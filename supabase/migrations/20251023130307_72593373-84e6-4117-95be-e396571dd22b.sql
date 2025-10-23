-- Add Google Sheets sync columns to nurture_campaigns
ALTER TABLE nurture_campaigns
ADD COLUMN IF NOT EXISTS sheet_column_mappings JSONB,
ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN DEFAULT false;

-- Create index for efficient cron job queries
CREATE INDEX IF NOT EXISTS idx_campaigns_auto_sync 
ON nurture_campaigns(auto_sync_enabled, status) 
WHERE auto_sync_enabled = true AND status = 'active';

-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to sync Google Sheets contacts every minute
SELECT cron.schedule(
  'sync-google-sheets-contacts',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/sync-google-sheet-contacts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);