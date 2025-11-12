/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users) - The user who performed the action
      - `user_name` (text) - Name of the user who performed the action
      - `action_type` (text) - Type of action (create_log, update_log, delete_log, create_comment, delete_comment)
      - `entity_type` (text) - Type of entity affected (log, comment)
      - `entity_id` (uuid) - ID of the affected entity
      - `description` (text) - Human-readable description of the action
      - `metadata` (jsonb) - Additional data about the action (account_name, campaign_name, etc.)
      - `created_at` (timestamptz) - When the action occurred

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for authenticated users to read all notifications
    - Add policy for authenticated users to create notifications

  3. Indexes
    - Add index on `created_at` for sorting
    - Add index on `user_id` for filtering
    - Add index on `action_type` for filtering
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Super admins can delete notifications
CREATE POLICY "Super admins can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'Super Admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_action_type ON notifications(action_type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity_type ON notifications(entity_type);