import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const extractSheetId = (url: string): string | null => {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const fetchSheetData = async (sheetId: string, apiKey: string) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch sheet data');
  }
  const data = await response.json();
  return data.values || [];
};

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json() : {};
    const targetCampaignId = body.campaign_id;

    console.log("Starting Google Sheets contact sync", targetCampaignId ? `for campaign ${targetCampaignId}` : "for all campaigns");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch campaigns - either specific campaign or all active campaigns with auto-sync enabled
    let query = supabase
      .from("nurture_campaigns")
      .select("*")
      .not("google_sheet_url", "is", null)
      .not("sheet_column_mappings", "is", null);

    if (targetCampaignId) {
      query = query.eq("id", targetCampaignId);
    } else {
      query = query.eq("auto_sync_enabled", true).eq("status", "active");
    }

    const { data: campaigns, error: campaignsError } = await query;

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
      throw campaignsError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("No campaigns to sync");
      return new Response(
        JSON.stringify({ message: "No campaigns to sync", synced: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${campaigns.length} campaigns to sync`);

    let totalNewContacts = 0;
    const syncResults = [];

    for (const campaign of campaigns) {
      try {
        console.log(`Syncing campaign: ${campaign.name} (${campaign.id})`);

        // Get user's Google Sheets API key
        const { data: credentials, error: credError } = await supabase
          .from("nurture_credentials")
          .select("google_sheets_api_key")
          .eq("user_id", campaign.user_id)
          .single();

        if (credError || !credentials?.google_sheets_api_key) {
          console.error(`No Google Sheets API key for campaign ${campaign.id}`);
          syncResults.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: "failed",
            error: "Google Sheets API key not configured"
          });
          continue;
        }

        // Extract sheet ID
        const sheetId = extractSheetId(campaign.google_sheet_url);
        if (!sheetId) {
          console.error(`Invalid sheet URL for campaign ${campaign.id}`);
          syncResults.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: "failed",
            error: "Invalid Google Sheets URL"
          });
          continue;
        }

        // Fetch sheet data
        const sheetData = await fetchSheetData(sheetId, credentials.google_sheets_api_key);
        
        if (!sheetData || sheetData.length === 0) {
          console.log(`No data in sheet for campaign ${campaign.id}`);
          syncResults.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: "success",
            new_contacts: 0
          });
          continue;
        }

        // Parse column mappings
        const mappings = campaign.sheet_column_mappings;
        const headers = sheetData[0];
        const rows = sheetData.slice(1);

        // Get existing contacts for this campaign
        const { data: existingContacts, error: existingError } = await supabase
          .from("nurture_contacts")
          .select("email")
          .eq("campaign_id", campaign.id);

        if (existingError) throw existingError;

        const existingEmails = new Set(existingContacts?.map(c => c.email.toLowerCase()) || []);

        // Process rows and find new contacts
        const newContacts = [];
        for (const row of rows) {
          if (!row || row.length === 0) continue;

          const email = mappings.email >= 0 ? row[mappings.email]?.trim() : null;
          
          if (!email || !validateEmail(email)) continue;
          if (existingEmails.has(email.toLowerCase())) continue;

          const contact: any = {
            campaign_id: campaign.id,
            email: email,
            imported_at: new Date().toISOString(),
            last_synced: new Date().toISOString(),
            status: "active"
          };

          if (mappings.phone >= 0 && row[mappings.phone]) {
            contact.phone = row[mappings.phone].trim();
          }
          if (mappings.firstName >= 0 && row[mappings.firstName]) {
            contact.first_name = row[mappings.firstName].trim();
          }
          if (mappings.lastName >= 0 && row[mappings.lastName]) {
            contact.last_name = row[mappings.lastName].trim();
          }

          newContacts.push(contact);
        }

        if (newContacts.length > 0) {
          console.log(`Inserting ${newContacts.length} new contacts for campaign ${campaign.id}`);
          
          const { error: insertError } = await supabase
            .from("nurture_contacts")
            .insert(newContacts);

          if (insertError) {
            console.error(`Error inserting contacts for campaign ${campaign.id}:`, insertError);
            syncResults.push({
              campaign_id: campaign.id,
              campaign_name: campaign.name,
              status: "failed",
              error: insertError.message
            });
            continue;
          }

          totalNewContacts += newContacts.length;

          // Process campaign to send messages to new contacts
          console.log(`Processing campaign ${campaign.id} for new contacts`);
          const { error: processError } = await supabase.functions.invoke('process-nurture-campaigns', {
            body: { campaign_id: campaign.id }
          });

          if (processError) {
            console.error(`Error processing campaign ${campaign.id}:`, processError);
          }
        }

        syncResults.push({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          status: "success",
          new_contacts: newContacts.length
        });

      } catch (error: any) {
        console.error(`Error syncing campaign ${campaign.id}:`, error);
        syncResults.push({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          status: "failed",
          error: error.message
        });
      }
    }

    console.log(`Sync complete. Total new contacts: ${totalNewContacts}`);

    return new Response(
      JSON.stringify({
        success: true,
        campaigns_synced: campaigns.length,
        total_new_contacts: totalNewContacts,
        results: syncResults
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in sync-google-sheet-contacts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
