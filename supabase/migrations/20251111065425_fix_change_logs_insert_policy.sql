/*
  # Fix Change Logs Insert Policy

  1. Changes
    - Drop the existing restrictive INSERT policy for change_logs
    - Create a new policy that allows all authenticated users to insert change logs
    - The application layer handles setting the correct logged_by_id

  2. Security
    - All authenticated users can create change logs
    - The logged_by_id is set by the application based on the current user
*/

-- Drop the old restrictive insert policy
DROP POLICY IF EXISTS "Users can create change logs" ON change_logs;

-- Create new policy allowing all authenticated users to insert
CREATE POLICY "Authenticated users can create change logs"
  ON change_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);