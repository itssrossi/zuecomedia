-- Create nurture_campaigns table
CREATE TABLE IF NOT EXISTS public.nurture_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('short_term', 'long_term', 'custom')),
  email_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  google_sheet_url TEXT,
  google_sheet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nurture_messages table
CREATE TABLE IF NOT EXISTS public.nurture_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.nurture_campaigns(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('email', 'sms')),
  subject TEXT,
  content TEXT NOT NULL,
  delay_value INTEGER NOT NULL DEFAULT 0,
  delay_unit TEXT NOT NULL DEFAULT 'days' CHECK (delay_unit IN ('minutes', 'hours', 'days', 'weeks')),
  send_time TIME,
  send_day TEXT CHECK (send_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nurture_contacts table
CREATE TABLE IF NOT EXISTS public.nurture_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.nurture_campaigns(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nurture_logs table
CREATE TABLE IF NOT EXISTS public.nurture_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.nurture_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.nurture_contacts(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.nurture_messages(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'delivered', 'opened', 'clicked')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.nurture_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nurture_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.nurture_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.nurture_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.nurture_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.nurture_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for nurture_messages
CREATE POLICY "Users can view their own campaign messages"
  ON public.nurture_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign messages"
  ON public.nurture_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign messages"
  ON public.nurture_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaign messages"
  ON public.nurture_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for nurture_contacts
CREATE POLICY "Users can view their own campaign contacts"
  ON public.nurture_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_contacts.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign contacts"
  ON public.nurture_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_contacts.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign contacts"
  ON public.nurture_contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_contacts.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaign contacts"
  ON public.nurture_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_contacts.campaign_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for nurture_logs
CREATE POLICY "Users can view their own campaign logs"
  ON public.nurture_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_logs.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign logs"
  ON public.nurture_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_logs.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign logs"
  ON public.nurture_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nurture_campaigns
      WHERE id = nurture_logs.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_nurture_messages_campaign_id ON public.nurture_messages(campaign_id);
CREATE INDEX idx_nurture_contacts_campaign_id ON public.nurture_contacts(campaign_id);
CREATE INDEX idx_nurture_logs_campaign_id ON public.nurture_logs(campaign_id);
CREATE INDEX idx_nurture_logs_scheduled_for ON public.nurture_logs(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_nurture_logs_contact_id ON public.nurture_logs(contact_id);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_nurture_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_nurture_campaigns_updated_at
  BEFORE UPDATE ON public.nurture_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nurture_updated_at();

CREATE TRIGGER update_nurture_messages_updated_at
  BEFORE UPDATE ON public.nurture_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nurture_updated_at();