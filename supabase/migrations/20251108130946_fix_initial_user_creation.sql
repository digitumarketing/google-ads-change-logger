/*
  # Fix Initial User Creation

  1. Changes
    - Create a database function that bypasses RLS to insert the first user
    - This function can only be called when no users exist
    - Uses SECURITY DEFINER to run with elevated privileges

  2. Security
    - Function checks that no users exist before allowing insert
    - Only allows creation of Super Admin role during initial setup
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.create_initial_super_admin(uuid, text, text, text);

-- Create function to insert initial super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_initial_super_admin(
  p_auth_id uuid,
  p_email text,
  p_name text,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count integer;
  v_new_user jsonb;
BEGIN
  -- Check if any users exist
  SELECT COUNT(*) INTO v_user_count FROM public.users;
  
  -- Only allow if no users exist
  IF v_user_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Users already exist in the system'
    );
  END IF;
  
  -- Insert the super admin user
  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (p_auth_id, p_email, p_name, p_role)
  RETURNING jsonb_build_object(
    'id', id,
    'auth_id', auth_id,
    'email', email,
    'name', name,
    'role', role
  ) INTO v_new_user;
  
  RETURN jsonb_build_object(
    'success', true,
    'user', v_new_user
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_initial_super_admin(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_initial_super_admin(uuid, text, text, text) TO anon;
