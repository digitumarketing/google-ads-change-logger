/*
  # Enable Review Reminder Cron Job
  
  1. Extensions
    - Enable pg_cron extension for scheduled tasks
  
  2. Cron Job
    - Create a daily cron job that runs at 9:00 AM UTC to check for review reminders
    - The job calls the check-review-reminders edge function
  
  3. Security
    - Add policy to allow service role to insert system notifications (user_id = null)
  
  4. Important Notes
    - The cron job runs daily at 9:00 AM UTC
    - The edge function checks for logs with next_review_date matching today's date
    - Creates notifications for users to review those logs
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create a cron job that runs daily at 9:00 AM UTC
DO $$
BEGIN
  -- First, remove any existing job with the same name
  PERFORM cron.unschedule('check-review-reminders-daily');
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_function THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule the cron job to run daily at 9:00 AM UTC
SELECT cron.schedule(
  'check-review-reminders-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.api_url') || '/functions/v1/check-review-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Add policy to allow service role to insert system notifications
DROP POLICY IF EXISTS "Service role can create system notifications" ON notifications;

CREATE POLICY "Service role can create system notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);