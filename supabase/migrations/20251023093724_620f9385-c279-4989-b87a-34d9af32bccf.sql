-- Create nurture_credentials table for user-specific API keys
CREATE TABLE public.nurture_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Resend credentials
  resend_api_key TEXT,
  resend_email_from TEXT,
  
  -- Twilio credentials
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_phone_number TEXT,
  
  -- Google Sheets credentials
  google_sheets_api_key TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one credential set per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.nurture_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credentials"
  ON public.nurture_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials"
  ON public.nurture_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON public.nurture_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON public.nurture_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_nurture_credentials_updated_at
  BEFORE UPDATE ON public.nurture_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nurture_updated_at();