/*
  # Fix Review Reminder Cron with Direct SQL
  
  1. SQL Function
    - Create a function that checks for logs needing review
    - Creates notifications directly without calling edge function
  
  2. Cron Job
    - Update cron job to call the SQL function instead
    - Runs daily at 9:00 AM UTC
  
  3. Important Notes
    - This approach is more reliable as it doesn't depend on edge function availability
    - The function checks for logs with next_review_date matching today's date
    - Creates system notifications that can be clicked to navigate to the log
*/

-- Drop existing cron job
DO $$
BEGIN
  PERFORM cron.unschedule('check-review-reminders-daily');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create function to check and create review reminders
CREATE OR REPLACE FUNCTION check_review_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_record RECORD;
  account_name TEXT;
  notification_count INTEGER := 0;
  today_date DATE;
BEGIN
  -- Get today's date
  today_date := CURRENT_DATE;
  
  -- Loop through all logs that need review today
  FOR log_record IN 
    SELECT id, campaign_name, account_id, next_review_date
    FROM change_logs
    WHERE next_review_date = today_date
  LOOP
    -- Check if notification already exists for this log today
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE entity_id = log_record.id
      AND action_type = 'review_reminder'
      AND created_at >= today_date
    ) THEN
      -- Get account name
      SELECT name INTO account_name
      FROM accounts
      WHERE id = log_record.account_id;
      
      -- Create notification
      INSERT INTO notifications (
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        description,
        metadata
      ) VALUES (
        NULL,
        'System',
        'review_reminder',
        'log',
        log_record.id,
        'scheduled a review for log: ' || log_record.campaign_name || ' (' || COALESCE(account_name, 'Unknown Account') || ')',
        jsonb_build_object(
          'campaignName', log_record.campaign_name,
          'accountName', COALESCE(account_name, 'Unknown Account'),
          'reviewDate', today_date
        )
      );
      
      notification_count := notification_count + 1;
    END IF;
  END LOOP;
  
  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'date', today_date,
    'notifications_created', notification_count
  );
END;
$$;

-- Schedule the cron job to run daily at 9:00 AM UTC
SELECT cron.schedule(
  'check-review-reminders-daily',
  '0 9 * * *',
  'SELECT check_review_reminders();'
);