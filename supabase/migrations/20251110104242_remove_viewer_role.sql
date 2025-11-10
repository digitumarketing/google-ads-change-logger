/*
  # Remove Viewer Role

  1. Changes
    - Update users table CHECK constraint to remove 'Viewer' role
    - Only allow 'Super Admin', 'Admin', and 'Analyst' roles

  2. Notes
    - Any existing users with 'Viewer' role will need to be updated manually
    - The constraint will prevent creating new 'Viewer' users
*/

-- Drop the existing role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint without 'Viewer' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Super Admin', 'Admin', 'Analyst'));