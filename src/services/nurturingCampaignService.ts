import { supabase } from "@/integrations/supabase/client";

export interface CampaignConfig {
  name: string;
  type: 'short_term' | 'long_term' | 'custom';
  description?: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface MessageConfig {
  message_type: 'email' | 'sms';
  sequence_order: number;
  subject?: string;
  content: string;
  timing_type: 'immediate' | 'delay' | 'schedule';
  delay_value?: number;
  delay_unit?: 'minutes' | 'hours' | 'days' | 'weeks';
  schedule_day?: string;
  schedule_time?: string;
}

export const fetchCampaigns = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("nurture_campaigns")
    .select(`
      *,
      nurture_messages(count),
      nurture_contacts(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchCampaignById = async (id: string) => {
  const { data, error } = await supabase
    .from("nurture_campaigns")
    .select(`
      *,
      nurture_messages(*),
      nurture_contacts(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createCampaign = async (config: CampaignConfig, messages: MessageConfig[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Create campaign
  const { data: campaign, error: campaignError } = await supabase
    .from("nurture_campaigns")
    .insert({
      user_id: user.id,
      name: config.name,
      type: config.type,
      description: config.description,
      email_enabled: config.email_enabled,
      sms_enabled: config.sms_enabled,
      status: config.status,
    })
    .select()
    .single();

  if (campaignError) throw campaignError;

  // Create messages
  if (messages.length > 0) {
    const messagesWithCampaignId = messages.map(msg => ({
      ...msg,
      campaign_id: campaign.id,
    }));

    const { error: messagesError } = await supabase
      .from("nurture_messages")
      .insert(messagesWithCampaignId);

    if (messagesError) throw messagesError;
  }

  return campaign;
};

export const updateCampaign = async (id: string, config: Partial<CampaignConfig>) => {
  const { error } = await supabase
    .from("nurture_campaigns")
    .update(config)
    .eq("id", id);

  if (error) throw error;
};

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase
    .from("nurture_campaigns")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const pauseCampaign = async (id: string) => {
  return updateCampaign(id, { status: 'paused' });
};

export const resumeCampaign = async (id: string) => {
  return updateCampaign(id, { status: 'active' });
};
