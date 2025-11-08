/*
  # Add Change Tracking to Change Logs

  ## Description
  This migration adds columns to track who created, who last edited, and when changes were made to change logs.

  ## Changes
  1. New Columns Added to `change_logs` table:
    - `created_by_name` (text) - Name of the user who created the log
    - `last_edited_by_id` (uuid) - ID of the user who last edited the log
    - `last_edited_by_name` (text) - Name of the user who last edited the log
    - `last_edited_at` (timestamptz) - Timestamp of the last edit
    - `updated_at` (timestamptz) - Auto-updated timestamp for any change

  ## Security
  - No RLS changes needed as existing policies already cover these columns
*/

-- Add tracking columns to change_logs table
DO $$
BEGIN
  -- Add created_by_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'change_logs' AND column_name = 'created_by_name'
  ) THEN
    ALTER TABLE change_logs ADD COLUMN created_by_name text;
  END IF;

  -- Add last_edited_by_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'change_logs' AND column_name = 'last_edited_by_id'
  ) THEN
    ALTER TABLE change_logs ADD COLUMN last_edited_by_id uuid REFERENCES users(id);
  END IF;

  -- Add last_edited_by_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'change_logs' AND column_name = 'last_edited_by_name'
  ) THEN
    ALTER TABLE change_logs ADD COLUMN last_edited_by_name text;
  END IF;

  -- Add last_edited_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'change_logs' AND column_name = 'last_edited_at'
  ) THEN
    ALTER TABLE change_logs ADD COLUMN last_edited_at timestamptz;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'change_logs' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE change_logs ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_change_logs_updated_at ON change_logs;

CREATE TRIGGER update_change_logs_updated_at
  BEFORE UPDATE ON change_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Populate created_by_name for existing records
UPDATE change_logs
SET created_by_name = users.name
FROM users
WHERE change_logs.logged_by_id = users.id
AND change_logs.created_by_name IS NULL;