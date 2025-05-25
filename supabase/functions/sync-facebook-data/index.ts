
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
    const authHeader = req.headers.get('Authorization') ?? '';
    
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the Facebook access token from secrets
    const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    if (!facebookAccessToken) {
      console.error('Facebook access token not configured');
      return new Response(JSON.stringify({ error: 'Facebook access token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Getting user session...');
    // Get the user from the request
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);

    // Fetch the user's Facebook Ad accounts
    console.log('Fetching ad accounts for user:', user.id);
    const { data: adAccounts, error: accountsError } = await supabase
      .from('fb_ad_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) {
      console.error('Error fetching ad accounts:', accountsError);
      return new Response(JSON.stringify({ error: `Error fetching ad accounts: ${accountsError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!adAccounts || adAccounts.length === 0) {
      console.log('No Facebook Ad accounts found for user:', user.id);
      return new Response(JSON.stringify({ message: 'No Facebook Ad accounts found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${adAccounts.length} ad accounts`);

    // Process each ad account
    const results = [];
    for (const account of adAccounts) {
      console.log(`Processing account: ${account.account_id}`);
      
      try {
        const result = await processAdAccount(supabase, user.id, account, facebookAccessToken);
        results.push(result);
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error);
        results.push({ 
          account_id: account.account_id, 
          error: error.message 
        });
      }
    }

    // Update the sync status
    console.log('Updating sync status...');
    await supabase.from('fb_sync_status').upsert({
      user_id: user.id,
      last_sync_at: new Date().toISOString(),
      sync_status: 'success',
      updated_at: new Date().toISOString()
    });

    console.log('Sync completed successfully');
    return new Response(JSON.stringify({ message: 'Sync completed successfully', results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fetch real campaign data from Facebook Marketing API
async function processAdAccount(supabase, userId, account, accessToken) {
  console.log(`Fetching campaigns for account: ${account.account_id}`);
  
  try {
    // Fetch campaigns from Facebook API
    const campaignsUrl = `${FB_API_BASE_URL}/${account.account_id}/campaigns?fields=id,name,status&access_token=${accessToken}`;
    
    console.log('Making Facebook API request:', campaignsUrl);
    const campaignsResponse = await fetch(campaignsUrl);
    
    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error(`Facebook API error: ${campaignsResponse.status} - ${errorText}`);
      throw new Error(`Facebook API error fetching campaigns: ${campaignsResponse.status} - ${errorText}`);
    }
    
    const campaignsData = await campaignsResponse.json();
    console.log(`Found ${campaignsData.data?.length || 0} campaigns`);

    if (!campaignsData.data || campaignsData.data.length === 0) {
      console.log(`No active campaigns found for account ${account.account_id}`);
      return { message: `No active campaigns found for account ${account.account_id}` };
    }

    // Process each campaign
    for (const campaign of campaignsData.data) {
      console.log(`Processing campaign: ${campaign.name} (${campaign.id})`);
      
      // Insert/update campaign in our database
      const { data: campaignRecord, error: campaignError } = await supabase.from('fb_campaigns').upsert({
        user_id: userId,
        fb_campaign_id: campaign.id,
        campaign_name: campaign.name,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, fb_campaign_id'
      }).select('id');

      if (campaignError) {
        console.error(`Error upserting campaign ${campaign.id}:`, campaignError);
        continue;
      }
      
      const campaignId = campaignRecord[0].id;
      
      // Fetch insights (metrics) for this campaign
      await fetchCampaignInsights(supabase, userId, campaignId, campaign.id, accessToken);
    }

    return { message: `Processed account ${account.account_id} successfully` };
  } catch (error) {
    console.error(`Error in processAdAccount for ${account.account_id}:`, error);
    throw error;
  }
}

// Fetch campaign insights from Facebook API
async function fetchCampaignInsights(supabase, userId, campaignId, fbCampaignId, accessToken) {
  console.log(`Fetching insights for campaign: ${fbCampaignId}`);
  
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const since = startDate.toISOString().split('T')[0];
    const until = endDate.toISOString().split('T')[0];
    
    // Fetch insights from Facebook API
    const insightsUrl = `${FB_API_BASE_URL}/${fbCampaignId}/insights?fields=impressions,clicks,spend,actions,action_values,ctr,cpc&time_range={"since":"${since}","until":"${until}"}&time_increment=1&access_token=${accessToken}`;
    
    console.log('Fetching insights from Facebook API...');
    const insightsResponse = await fetch(insightsUrl);
    
    if (!insightsResponse.ok) {
      const errorText = await insightsResponse.text();
      console.error(`Facebook API error fetching insights: ${insightsResponse.status} - ${errorText}`);
      return;
    }
    
    const insightsData = await insightsResponse.json();
    console.log(`Found ${insightsData.data?.length || 0} daily insights`);

    if (!insightsData.data || insightsData.data.length === 0) {
      console.log(`No insights data found for campaign ${fbCampaignId}`);
      return;
    }

    // Process each day's insights
    for (const insight of insightsData.data) {
      const impressions = parseInt(insight.impressions || '0');
      const clicks = parseInt(insight.clicks || '0');
      const spend = parseFloat(insight.spend || '0');
      const ctr = parseFloat(insight.ctr || '0');
      const cpc = parseFloat(insight.cpc || '0');
      
      // Extract conversions and revenue from actions
      let conversions = 0;
      let revenue = 0;
      
      if (insight.actions) {
        for (const action of insight.actions) {
          if (action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase') {
            conversions += parseInt(action.value || '0');
          }
        }
      }
      
      if (insight.action_values) {
        for (const actionValue of insight.action_values) {
          if (actionValue.action_type === 'purchase' || actionValue.action_type === 'offsite_conversion.fb_pixel_purchase') {
            revenue += parseFloat(actionValue.value || '0');
          }
        }
      }
      
      // Calculate ROAS
      const roas = spend > 0 ? revenue / spend : 0;
      
      // Insert/update metrics in our database
      const { error: metricsError } = await supabase.from('fb_ad_metrics').upsert({
        user_id: userId,
        campaign_id: campaignId,
        date: insight.date_start,
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

      if (metricsError) {
        console.error(`Error upserting metrics for ${insight.date_start}:`, metricsError);
      }
    }
    
    console.log(`Successfully processed insights for campaign ${fbCampaignId}`);
  } catch (error) {
    console.error(`Error fetching insights for campaign ${fbCampaignId}:`, error);
  }
}
