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

    const { campaign_id } = await req.json();

    console.log('Processing campaign:', campaign_id);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('nurture_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('status', 'active')
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or not active');
    }

    // Fetch all messages for this campaign
    const { data: messages, error: messagesError } = await supabase
      .from('nurture_messages')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('sequence_order', { ascending: true });

    if (messagesError) throw messagesError;
    if (!messages || messages.length === 0) {
      console.log('No messages configured for this campaign');
      return new Response(
        JSON.stringify({ success: true, message: 'No messages to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all contacts for this campaign
    const { data: contacts, error: contactsError } = await supabase
      .from('nurture_contacts')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('status', 'active');

    if (contactsError) throw contactsError;
    if (!contacts || contacts.length === 0) {
      console.log('No contacts for this campaign');
      return new Response(
        JSON.stringify({ success: true, message: 'No contacts to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${contacts.length} contacts with ${messages.length} messages`);

    const now = new Date();
    const deliveriesToCreate = [];

    // For each contact, schedule all messages
    for (const contact of contacts) {
      const baseTime = contact.imported_at ? new Date(contact.imported_at) : now;

      for (const message of messages) {
        // Check if message type is enabled
        if (message.message_type === 'email' && !campaign.email_enabled) continue;
        if (message.message_type === 'sms' && !campaign.sms_enabled) continue;

        // Check if email/phone exists
        if (message.message_type === 'email' && !contact.email) continue;
        if (message.message_type === 'sms' && !contact.phone) continue;

        // Check if delivery already exists
        const { data: existingDelivery } = await supabase
          .from('nurture_deliveries')
          .select('id')
          .eq('campaign_id', campaign_id)
          .eq('contact_id', contact.id)
          .eq('message_id', message.id)
          .maybeSingle();

        if (existingDelivery) {
          console.log(`Delivery already exists for contact ${contact.id} message ${message.id}`);
          continue;
        }

        // Calculate scheduled time based on timing_type
        let scheduledFor = new Date(baseTime);

        if (message.timing_type === 'immediate') {
          scheduledFor = now;
        } else if (message.timing_type === 'delay') {
          const delayMs = calculateDelay(message.delay_value, message.delay_unit);
          scheduledFor = new Date(baseTime.getTime() + delayMs);
        } else if (message.timing_type === 'schedule' && message.schedule_day && message.schedule_time) {
          scheduledFor = calculateScheduledTime(baseTime, message.schedule_day, message.schedule_time);
        }

        deliveriesToCreate.push({
          campaign_id: campaign_id,
          contact_id: contact.id,
          message_id: message.id,
          delivery_type: message.message_type,
          status: 'pending',
          scheduled_for: scheduledFor.toISOString(),
        });
      }
    }

    console.log(`Creating ${deliveriesToCreate.length} deliveries`);

    // Create all deliveries
    if (deliveriesToCreate.length > 0) {
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('nurture_deliveries')
        .insert(deliveriesToCreate)
        .select();

      if (deliveriesError) throw deliveriesError;

      // Send immediate messages
      const immediateDeliveries = deliveries?.filter(d => {
        const scheduledTime = new Date(d.scheduled_for);
        return scheduledTime <= now;
      }) || [];

      console.log(`Sending ${immediateDeliveries.length} immediate messages`);

      for (const delivery of immediateDeliveries) {
        if (delivery.delivery_type === 'email') {
          // Call send-nurture-email function
          await supabase.functions.invoke('send-nurture-email', {
            body: {
              delivery_id: delivery.id,
              campaign_id: delivery.campaign_id,
              contact_id: delivery.contact_id,
              message_id: delivery.message_id,
            },
          });
        } else if (delivery.delivery_type === 'sms') {
          // Call send-nurture-sms function
          await supabase.functions.invoke('send-nurture-sms', {
            body: {
              delivery_id: delivery.id,
              campaign_id: delivery.campaign_id,
              contact_id: delivery.contact_id,
              message_id: delivery.message_id,
            },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deliveries_created: deliveriesToCreate.length,
        immediate_sent: deliveriesToCreate.filter(d => new Date(d.scheduled_for) <= now).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing campaign:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateDelay(value: number, unit: string): number {
  const multipliers: Record<string, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] || multipliers.days);
}

function calculateScheduledTime(baseTime: Date, scheduleDay: string, scheduleTime: string): Date {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = daysOfWeek.indexOf(scheduleDay);
  const currentDayIndex = baseTime.getDay();
  
  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;

  const scheduledDate = new Date(baseTime);
  scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

  const [hours, minutes] = scheduleTime.split(':').map(Number);
  scheduledDate.setHours(hours, minutes, 0, 0);

  return scheduledDate;
}