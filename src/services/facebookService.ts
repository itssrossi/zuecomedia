
import { supabase } from "@/integrations/supabase/client";

export interface FbAdAccount {
  id: string;
  account_id: string;
  account_name: string;
  user_id: string;
  access_token: string;
}

export interface FbCampaign {
  id: string;
  fb_campaign_id: string;
  campaign_name: string;
  campaign_status: string | null;
  start_time: string | null;
  stop_time: string | null;
  user_id: string;
}

export interface FbAdMetric {
  id: string;
  user_id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  campaign_name?: string; // For joined queries
  campaign?: string; // Add this property to match AdMetric type
  campaign_status?: string; // Add campaign status
  start_time?: string | null; // Add start time
  stop_time?: string | null; // Add stop time
}

export interface SyncStatus {
  id: string;
  user_id: string;
  last_sync_at: string;
  sync_status: string;
}

export const fetchUserAdAccounts = async (): Promise<FbAdAccount[]> => {
  const { data, error } = await supabase
    .from('fb_ad_accounts')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching ad accounts: ${error.message}`);
  }
  
  return data || [];
};

export const fetchUserCampaigns = async (): Promise<FbCampaign[]> => {
  const { data, error } = await supabase
    .from('fb_campaigns')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching campaigns: ${error.message}`);
  }
  
  return data || [];
};

export const fetchUserAdMetrics = async (
  startDate?: string,
  endDate?: string,
  campaignIds?: string[]
): Promise<FbAdMetric[]> => {
  let query = supabase
    .from('fb_ad_metrics')
    .select(`
      *,
      fb_campaigns!inner(campaign_name, campaign_status, start_time, stop_time)
    `);
  
  // Build the date filter condition
  if (startDate || endDate) {
    // Create a condition that includes:
    // 1. Metrics within the date range
    // 2. OR campaigns that are scheduled within the date range (even without metrics)
    let dateConditions = [];
    
    if (startDate && endDate) {
      // Include metrics in date range OR campaigns scheduled in date range
      dateConditions.push(`(date.gte.${startDate},date.lte.${endDate})`);
      dateConditions.push(`(fb_campaigns.start_time.gte.${startDate},fb_campaigns.start_time.lte.${endDate})`);
      dateConditions.push(`(fb_campaigns.stop_time.gte.${startDate},fb_campaigns.stop_time.lte.${endDate})`);
    } else if (startDate) {
      dateConditions.push(`(date.gte.${startDate})`);
      dateConditions.push(`(fb_campaigns.start_time.gte.${startDate})`);
    } else if (endDate) {
      dateConditions.push(`(date.lte.${endDate})`);
      dateConditions.push(`(fb_campaigns.stop_time.lte.${endDate})`);
    }
    
    // Use 'or' to combine conditions - metrics in range OR campaign scheduled in range
    if (dateConditions.length > 0) {
      query = query.or(dateConditions.join(','));
    }
  }
  
  if (campaignIds && campaignIds.length > 0) {
    query = query.in('campaign_id', campaignIds);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching ad metrics: ${error.message}`);
  }
  
  return data?.map(item => ({
    ...item,
    campaign_name: item.fb_campaigns.campaign_name,
    campaign: item.fb_campaigns.campaign_name, // Add this to match AdMetric type
    campaign_status: item.fb_campaigns.campaign_status,
    start_time: item.fb_campaigns.start_time,
    stop_time: item.fb_campaigns.stop_time
  })) || [];
};

export const fetchLastSyncStatus = async (): Promise<SyncStatus | null> => {
  const { data, error } = await supabase
    .from('fb_sync_status')
    .select('*')
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    throw new Error(`Error fetching sync status: ${error.message}`);
  }
  
  return data || null;
};

export const saveAdAccount = async (
  accountId: string,
  accountName: string,
  accessToken: string
): Promise<void> => {
  // Get current user ID from auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be logged in to save ad account");
  }
  
  const { error } = await supabase.from('fb_ad_accounts').insert({
    account_id: accountId,
    account_name: accountName,
    access_token: accessToken,
    user_id: user.id // Add the user_id from the authenticated user
  });
  
  if (error) {
    throw new Error(`Error saving ad account: ${error.message}`);
  }
};

export const triggerFacebookDataSync = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-facebook-data', {
      method: 'POST',
      body: {} // Add an empty body to avoid potential issues
    });
    
    if (error) {
      console.error("Error from edge function:", error);
      throw new Error(`Error syncing data: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned from sync function");
    }
    
    console.log("Sync response:", data);
    return data;
  } catch (err) {
    console.error("Error in triggerFacebookDataSync:", err);
    throw err;
  }
};
