import { createClient } from 'npm:@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const { data: logsNeedingReview, error: logsError } = await supabase
      .from('change_logs')
      .select('id, campaign_name, account_id, next_review_date')
      .eq('next_review_date', todayStr);

    if (logsError) {
      throw logsError;
    }

    if (!logsNeedingReview || logsNeedingReview.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No logs need review today', count: 0 }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const notificationsCreated = [];

    for (const log of logsNeedingReview) {
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('entity_id', log.id)
        .eq('action_type', 'review_reminder')
        .gte('created_at', todayStr)
        .maybeSingle();

      if (existingNotification) {
        continue;
      }

      const { data: account } = await supabase
        .from('accounts')
        .select('name')
        .eq('id', log.account_id)
        .maybeSingle();

      const accountName = account?.name || 'Unknown Account';
      const description = `scheduled a review for log: ${log.campaign_name} (${accountName})`;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: null,
          user_name: 'System',
          action_type: 'review_reminder',
          entity_type: 'log',
          entity_id: log.id,
          description: description,
          metadata: {
            campaignName: log.campaign_name,
            accountName: accountName,
            reviewDate: todayStr,
          },
        });

      if (!notifError) {
        notificationsCreated.push(log.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Review reminders checked',
        logsFound: logsNeedingReview.length,
        notificationsCreated: notificationsCreated.length,
        logIds: notificationsCreated,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
