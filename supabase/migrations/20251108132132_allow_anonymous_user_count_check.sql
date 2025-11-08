/*
  # Allow anonymous users to check if users exist

  1. Changes
    - Update SELECT policy to allow public (unauthenticated) users to view the users table
    - This is needed so the app can check if any users exist before showing login vs setup

  2. Security
    - Public users can only SELECT, cannot modify data
    - All other operations still require authentication
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;

-- Create new policy that allows both authenticated and anonymous users to view
CREATE POLICY "Allow public to view users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);
