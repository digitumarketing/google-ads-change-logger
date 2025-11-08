/*
  # Add Authentication and Super Admin Role

  ## Changes
  
  1. Updates to users table:
     - Add `auth_id` column to link with Supabase auth.users
     - Add `email` column for user email addresses
     - Update role check to include 'Super Admin'
  
  2. Security Updates:
     - Update RLS policies to use auth.uid()
     - Restrict user and account management to Super Admin only
     - Allow all authenticated users to view and manage change logs
  
  ## Notes
  - Super Admin role has full access to users and accounts management
  - Regular users (Admin, Analyst, Viewer) can only view users and accounts
  - All authenticated users can create and manage change logs
*/

-- Add auth_id and email to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text UNIQUE;
  END IF;
END $$;

-- Update role check constraint to include Super Admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Super Admin', 'Admin', 'Analyst', 'Viewer'));

-- Create index on auth_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow public insert access to users" ON users;
DROP POLICY IF EXISTS "Allow public update access to users" ON users;
DROP POLICY IF EXISTS "Allow public delete access to users" ON users;

DROP POLICY IF EXISTS "Allow public read access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public insert access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public update access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public delete access to accounts" ON accounts;

DROP POLICY IF EXISTS "Allow public read access to change_logs" ON change_logs;
DROP POLICY IF EXISTS "Allow public insert access to change_logs" ON change_logs;
DROP POLICY IF EXISTS "Allow public update access to change_logs" ON change_logs;
DROP POLICY IF EXISTS "Allow public delete access to change_logs" ON change_logs;

DROP POLICY IF EXISTS "Allow public read access to comments" ON comments;
DROP POLICY IF EXISTS "Allow public insert access to comments" ON comments;
DROP POLICY IF EXISTS "Allow public update access to comments" ON comments;
DROP POLICY IF EXISTS "Allow public delete access to comments" ON comments;

-- Users table policies (Super Admin only for write operations)
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super Admin can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

CREATE POLICY "Super Admin can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

CREATE POLICY "Super Admin can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

-- Accounts table policies (Super Admin only for write operations)
CREATE POLICY "Authenticated users can view all accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super Admin can create accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

CREATE POLICY "Super Admin can update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

CREATE POLICY "Super Admin can delete accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

-- Change logs table policies (All authenticated users)
CREATE POLICY "Authenticated users can view change logs"
  ON change_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create change logs"
  ON change_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update change logs"
  ON change_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete change logs"
  ON change_logs FOR DELETE
  TO authenticated
  USING (true);

-- Comments table policies (All authenticated users)
CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (true);