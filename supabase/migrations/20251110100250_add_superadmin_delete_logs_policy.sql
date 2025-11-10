/*
  # Add SuperAdmin Delete Policy for Change Logs

  ## Description
  This migration updates the RLS policies for change_logs to allow only SuperAdmin to delete logs.

  ## Changes
  1. Drop the existing delete policy that allowed all authenticated users
  2. Create a new restrictive policy that only allows SuperAdmin role to delete logs

  ## Security
  - Only users with 'Super Admin' role can delete change logs
  - All other roles (Admin, Analyst, Viewer) cannot delete logs
*/

-- Drop the old delete policy
DROP POLICY IF EXISTS "Authenticated users can delete change logs" ON change_logs;

-- Create new restrictive policy for SuperAdmin only
CREATE POLICY "Only SuperAdmin can delete change logs"
  ON change_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );