/*
  # Add Role-Based Access Control for Accounts

  1. Changes
    - Drop existing public policies for accounts table
    - Add new RLS policies that restrict account management to Super Admin and Admin roles
    - Allow all authenticated users to read accounts
    - Allow only Super Admin and Admin users to insert, update, and delete accounts

  2. Security
    - Analysts and Viewers can view accounts but cannot modify them
    - Admin and Super Admin users have full CRUD access to accounts
*/

-- Drop existing public policies for accounts table
DROP POLICY IF EXISTS "Allow public read access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public insert access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public update access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public delete access to accounts" ON accounts;

-- Allow all authenticated users to read accounts
CREATE POLICY "Authenticated users can read accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (true);

-- Allow Super Admin and Admin users to insert accounts
CREATE POLICY "Super Admin and Admin can insert accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  );

-- Allow Super Admin and Admin users to update accounts
CREATE POLICY "Super Admin and Admin can update accounts"
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

-- Allow Super Admin and Admin users to delete accounts
CREATE POLICY "Super Admin and Admin can delete accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('Super Admin', 'Admin')
    )
  );