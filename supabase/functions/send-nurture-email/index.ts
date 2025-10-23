import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  delivery_id: string;
  campaign_id: string;
  contact_id: string;
  message_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { delivery_id, campaign_id, contact_id, message_id }: SendEmailRequest = await req.json();

    console.log('Sending email for delivery:', delivery_id);

    // Fetch campaign, message, contact, and credentials
    const [campaignRes, messageRes, contactRes] = await Promise.all([
      supabase.from('nurture_campaigns').select('*').eq('id', campaign_id).single(),
      supabase.from('nurture_messages').select('*').eq('id', message_id).single(),
      supabase.from('nurture_contacts').select('*').eq('id', contact_id).single(),
    ]);

    if (campaignRes.error) throw new Error(`Campaign not found: ${campaignRes.error.message}`);
    if (messageRes.error) throw new Error(`Message not found: ${messageRes.error.message}`);
    if (contactRes.error) throw new Error(`Contact not found: ${contactRes.error.message}`);

    const campaign = campaignRes.data;
    const message = messageRes.data;
    const contact = contactRes.data;

    // Fetch user credentials
    const { data: credentials, error: credError } = await supabase
      .from('nurture_credentials')
      .select('resend_api_key, resend_email_from')
      .eq('user_id', campaign.user_id)
      .single();

    if (credError || !credentials?.resend_api_key || !credentials?.resend_email_from) {
      throw new Error('Resend credentials not configured');
    }

    // Replace variables in content
    const replaceVariables = (text: string) => {
      return text
        .replace(/\{\{first_name\}\}/g, contact.first_name || '')
        .replace(/\{\{last_name\}\}/g, contact.last_name || '')
        .replace(/\{\{email\}\}/g, contact.email || '')
        .replace(/\{\{phone\}\}/g, contact.phone || '');
    };

    const subject = message.subject ? replaceVariables(message.subject) : 'Message from ' + campaign.name;
    const content = replaceVariables(message.content);

    // Send email via Resend
    const resend = new Resend(credentials.resend_api_key);
    
    const emailResponse = await resend.emails.send({
      from: credentials.resend_email_from,
      to: [contact.email],
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${content.replace(/\n/g, '<br>')}</div>`,
    });

    if (emailResponse.error) {
      throw new Error(`Resend error: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data);

    // Update delivery status
    await supabase
      .from('nurture_deliveries')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: emailResponse.data?.id,
      })
      .eq('id', delivery_id);

    return new Response(
      JSON.stringify({ success: true, external_id: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);

    // Update delivery status to failed
    if (req.json && (await req.json()).delivery_id) {
      const { delivery_id } = await req.json();
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('nurture_deliveries')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', delivery_id);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});