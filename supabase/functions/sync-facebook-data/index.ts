
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Define the API URL and headers for Facebook API
const FB_API_VERSION = 'v19.0';
const FB_API_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

interface FbAdAccount {
  account_id: string;
  access_token: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Now we can get the session or user object
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = session.user;

    // Fetch the user's Facebook Ad accounts
    const { data: adAccounts, error: accountsError } = await supabase
      .from('fb_ad_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) {
      throw new Error(`Error fetching ad accounts: ${accountsError.message}`);
    }

    if (!adAccounts || adAccounts.length === 0) {
      return new Response(JSON.stringify({ message: 'No Facebook Ad accounts found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each ad account
    const results = [];
    for (const account of adAccounts) {
      // In a real implementation, you would call the Facebook API here
      // using the account.access_token
      
      const result = await processAdAccount(supabase, user.id, account);
      results.push(result);
    }

    // Update the sync status
    await supabase.from('fb_sync_status').upsert({
      user_id: user.id,
      last_sync_at: new Date().toISOString(),
      sync_status: 'success',
      updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ message: 'Sync completed successfully', results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// This function simulates fetching campaign data from Facebook
// In a real implementation, it would call the Facebook Marketing API
async function processAdAccount(supabase, userId, account) {
  // Simulate campaign data
  // In reality, you would fetch this from Facebook's API using the account's access token
  const mockCampaigns = [
    { id: 'camp1', name: 'Summer Sale 2023' },
    { id: 'camp2', name: 'New Product Launch' },
    { id: 'camp3', name: 'Holiday Special' },
  ];

  // Insert/update campaigns in our database
  for (const campaign of mockCampaigns) {
    const { data, error } = await supabase.from('fb_campaigns').upsert({
      user_id: userId,
      fb_campaign_id: campaign.id,
      campaign_name: campaign.name,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, fb_campaign_id'
    }).select('id');

    if (error) {
      throw new Error(`Error upserting campaign: ${error.message}`);
    }
    
    // Now generate some mock metrics for this campaign
    const campaignId = data[0].id;
    await generateMockMetrics(supabase, userId, campaignId);
  }

  return { message: `Processed account ${account.account_id} successfully` };
}

// Generate mock metrics data for demo purposes
async function generateMockMetrics(supabase, userId, campaignId) {
  const today = new Date();
  
  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate random metrics
    const impressions = Math.floor(Math.random() * 10000) + 1000;
    const clicks = Math.floor(Math.random() * 500) + 50;
    const spend = Math.round((Math.random() * 200 + 20) * 100) / 100;
    const conversions = Math.floor(Math.random() * 50) + 5;
    const revenue = Math.round((spend * (Math.random() * 5 + 2)) * 100) / 100;
    const ctr = Math.round((clicks / impressions * 100) * 100) / 100;
    const cpc = Math.round((spend / clicks) * 100) / 100;
    const roas = Math.round((revenue / spend) * 100) / 100;
    
    // Insert/update metrics in our database
    const { error } = await supabase.from('fb_ad_metrics').upsert({
      user_id: userId,
      campaign_id: campaignId,
      date: dateStr,
      impressions,
      clicks,
      spend,
      conversions,
      revenue,
      ctr,
      cpc,
      roas,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, campaign_id, date'
    });

    if (error) {
      throw new Error(`Error upserting metrics: ${error.message}`);
    }
  }
}
