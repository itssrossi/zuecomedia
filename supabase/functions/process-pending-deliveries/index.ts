import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing pending deliveries');

    // Fetch pending deliveries that are due
    const { data: pendingDeliveries, error: deliveriesError } = await supabase
      .from('nurture_deliveries')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(100);

    if (deliveriesError) throw deliveriesError;

    if (!pendingDeliveries || pendingDeliveries.length === 0) {
      console.log('No pending deliveries to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingDeliveries.length} pending deliveries`);

    let successCount = 0;
    let failureCount = 0;

    // Process each delivery
    for (const delivery of pendingDeliveries) {
      try {
        const functionName = delivery.delivery_type === 'email' 
          ? 'send-nurture-email' 
          : 'send-nurture-sms';

        console.log(`Invoking ${functionName} for delivery ${delivery.id}`);

        const { error: invokeError } = await supabase.functions.invoke(functionName, {
          body: {
            delivery_id: delivery.id,
            campaign_id: delivery.campaign_id,
            contact_id: delivery.contact_id,
            message_id: delivery.message_id,
          },
        });

        if (invokeError) {
          console.error(`Error invoking ${functionName}:`, invokeError);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error: any) {
        console.error(`Error processing delivery ${delivery.id}:`, error);
        failureCount++;
      }
    }

    console.log(`Processed ${successCount} successfully, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: pendingDeliveries.length,
        successful: successCount,
        failed: failureCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing pending deliveries:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
