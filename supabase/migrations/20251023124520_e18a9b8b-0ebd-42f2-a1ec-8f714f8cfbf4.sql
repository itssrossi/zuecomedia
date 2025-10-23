-- Create nurture_deliveries table for tracking email/SMS delivery status
CREATE TABLE public.nurture_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES nurture_contacts(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES nurture_messages(id) ON DELETE CASCADE,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nurture_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own campaign deliveries"
  ON public.nurture_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nurture_campaigns
      WHERE nurture_campaigns.id = nurture_deliveries.campaign_id
      AND nurture_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own campaign deliveries"
  ON public.nurture_deliveries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nurture_campaigns
      WHERE nurture_campaigns.id = nurture_deliveries.campaign_id
      AND nurture_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign deliveries"
  ON public.nurture_deliveries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nurture_campaigns
      WHERE nurture_campaigns.id = nurture_deliveries.campaign_id
      AND nurture_campaigns.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_nurture_deliveries_updated_at
  BEFORE UPDATE ON public.nurture_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nurture_updated_at();

-- Create index for faster queries
CREATE INDEX idx_nurture_deliveries_campaign ON nurture_deliveries(campaign_id);
CREATE INDEX idx_nurture_deliveries_status ON nurture_deliveries(status, scheduled_for);
CREATE INDEX idx_nurture_deliveries_contact ON nurture_deliveries(contact_id);