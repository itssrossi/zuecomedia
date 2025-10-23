import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com'];

const extractDomain = (email: string): string => {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : '';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body once and store it
    const payload = await req.json();
    const { delivery_id, campaign_id, contact_id, message_id } = payload;

    console.log("Sending email for delivery:", delivery_id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch delivery details with all related data
    const { data: delivery, error: deliveryError } = await supabase
      .from("nurture_deliveries")
      .select(`
        *,
        campaign:nurture_campaigns(*),
        contact:nurture_contacts(*),
        message:nurture_messages(*)
      `)
      .eq("id", delivery_id)
      .single();

    if (deliveryError) throw new Error(`Failed to fetch delivery: ${deliveryError.message}`);
    if (!delivery) throw new Error("Delivery not found");

    // Get user credentials
    const { data: credentials, error: credError } = await supabase
      .from("nurture_credentials")
      .select("resend_api_key, resend_email_from")
      .eq("user_id", delivery.campaign.user_id)
      .single();

    if (credError || !credentials?.resend_api_key) {
      const errorMsg = "Resend API key not configured";
      await supabase
        .from("nurture_deliveries")
        .update({ 
          status: "failed", 
          error_message: errorMsg,
          updated_at: new Date().toISOString()
        })
        .eq("id", delivery_id);
      throw new Error(errorMsg);
    }

    const resend = new Resend(credentials.resend_api_key);

    // Determine from and reply_to based on domain
    let fromEmail = credentials.resend_email_from || "onboarding@resend.dev";
    let replyTo: string | undefined;
    
    const domain = extractDomain(fromEmail);
    if (genericDomains.includes(domain)) {
      // Use Resend test domain for generic emails
      replyTo = fromEmail;
      fromEmail = "Lovable <onboarding@resend.dev>";
    }

    // Replace variables in content
    let content = delivery.message.content || "";
    const contact = delivery.contact;
    
    content = content
      .replace(/\{\{first_name\}\}/g, contact.first_name || "there")
      .replace(/\{\{last_name\}\}/g, contact.last_name || "")
      .replace(/\{\{email\}\}/g, contact.email || "")
      .replace(/\{\{phone\}\}/g, contact.phone || "");

    let subject = delivery.message.subject || "Message from our team";
    subject = subject
      .replace(/\{\{first_name\}\}/g, contact.first_name || "there")
      .replace(/\{\{last_name\}\}/g, contact.last_name || "");

    // Send email via Resend
    try {
      const emailData: any = {
        from: fromEmail,
        to: [contact.email],
        subject: subject,
        html: content,
      };

      if (replyTo) {
        emailData.reply_to = replyTo;
      }

      const emailResponse = await resend.emails.send(emailData);

      console.log("Email sent successfully:", emailResponse);

      // Update delivery status
      await supabase
        .from("nurture_deliveries")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          external_id: emailResponse.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", delivery_id);

      return new Response(
        JSON.stringify({ success: true, email_id: emailResponse.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (emailError: any) {
      const errorMsg = `Resend error: ${emailError.message}`;
      console.error("Error sending email:", errorMsg);

      // Update delivery with failure
      await supabase
        .from("nurture_deliveries")
        .update({
          status: "failed",
          error_message: errorMsg,
          updated_at: new Date().toISOString()
        })
        .eq("id", delivery_id);

      throw new Error(errorMsg);
    }

  } catch (error: any) {
    console.error("Error in send-nurture-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
