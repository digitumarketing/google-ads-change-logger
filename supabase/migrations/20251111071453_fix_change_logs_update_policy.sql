/*
  # Fix Change Logs Update Policy

  1. Changes
    - Drop the existing restrictive UPDATE policy for change_logs
    - Create a new policy that allows Super Admin, Admin, and Analyst roles to update any change log
    - This aligns with the frontend permissions where these roles can edit logs

  2. Security
    - Super Admin, Admin, and Analyst can update any change logs
    - The application layer handles role-based access control
*/

-- Drop the old restrictive update policy
DROP POLICY IF EXISTS "Users can update own logs or Super Admin can update any" ON change_logs;

-- Create new policy allowing Super Admin, Admin, and Analyst to update change logs
CREATE POLICY "Super Admin, Admin, and Analyst can update change logs"
  ON change_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin', 'Analyst')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin', 'Analyst')
    )
  );