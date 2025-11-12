/*
  # Add Notification Read Tracking

  1. New Tables
    - `notification_reads`
      - `id` (uuid, primary key)
      - `notification_id` (uuid, references notifications)
      - `user_id` (uuid, references users)
      - `read_at` (timestamptz) - When the notification was read
      - Unique constraint on (notification_id, user_id) to prevent duplicates

  2. Security
    - Enable RLS on `notification_reads` table
    - Users can read their own read status
    - Users can create their own read records
    - Users can delete their own read records

  3. Indexes
    - Add index on `user_id` for filtering
    - Add index on `notification_id` for filtering
*/

-- Create notification_reads table
CREATE TABLE IF NOT EXISTS notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own read status"
  ON notification_reads FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark notifications as read"
  ON notification_reads FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own read records"
  ON notification_reads FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);