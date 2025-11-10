/*
  # Cleanup and Fix Account RLS Policies

  1. Changes
    - Drop all existing policies on accounts table
    - Create clean, role-based policies for accounts
    - Authenticated users can read all accounts
    - Only Super Admin and Admin can create, update, or delete accounts

  2. Security
    - Analysts and Viewers: Read-only access
    - Admin and Super Admin: Full CRUD access
*/

-- Drop all existing policies on accounts table
DO $$ 
DECLARE 
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'accounts'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON accounts';
  END LOOP;
END $$;

-- Allow all authenticated users to view accounts
CREATE POLICY "Users can view accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (true);

-- Allow Super Admin and Admin to create accounts
CREATE POLICY "Admins can create accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  );

-- Allow Super Admin and Admin to update accounts
CREATE POLICY "Admins can update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  );

-- Allow Super Admin and Admin to delete accounts
CREATE POLICY "Admins can delete accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  );