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

    const { delivery_id } = await req.json();

    console.log('Processing SMS delivery:', delivery_id);

    // Fetch delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from('nurture_deliveries')
      .select(`
        *,
        campaign:nurture_campaigns(*),
        contact:nurture_contacts(*),
        message:nurture_messages(*)
      `)
      .eq('id', delivery_id)
      .single();

    if (deliveryError || !delivery) {
      throw new Error('Delivery not found');
    }

    // Fetch Twilio credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('nurture_credentials')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', delivery.campaign.user_id)
      .single();

    if (credentialsError || !credentials) {
      throw new Error('Twilio credentials not found');
    }

    if (!credentials.twilio_account_sid || !credentials.twilio_auth_token || !credentials.twilio_phone_number) {
      throw new Error('Incomplete Twilio credentials');
    }

    // Replace variables in message content
    let messageContent = delivery.message.content;
    messageContent = messageContent.replace(/{{first_name}}/g, delivery.contact.first_name || '');
    messageContent = messageContent.replace(/{{last_name}}/g, delivery.contact.last_name || '');
    messageContent = messageContent.replace(/{{email}}/g, delivery.contact.email || '');
    messageContent = messageContent.replace(/{{phone}}/g, delivery.contact.phone || '');

    // Send SMS via Twilio
    const twilioAuth = btoa(`${credentials.twilio_account_sid}:${credentials.twilio_auth_token}`);
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.twilio_account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: delivery.contact.phone,
          From: credentials.twilio_phone_number,
          Body: messageContent,
        }),
      }
    );

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      throw new Error(`Twilio error: ${twilioResult.message || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', twilioResult.sid);

    // Update delivery status
    const { error: updateError } = await supabase
      .from('nurture_deliveries')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: twilioResult.sid,
      })
      .eq('id', delivery_id);

    if (updateError) {
      console.error('Error updating delivery status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message_sid: twilioResult.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending SMS:', error);

    // Try to update delivery as failed
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { delivery_id } = await req.json();
      await supabase
        .from('nurture_deliveries')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', delivery_id);
    } catch (updateError) {
      console.error('Error updating failed delivery:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
