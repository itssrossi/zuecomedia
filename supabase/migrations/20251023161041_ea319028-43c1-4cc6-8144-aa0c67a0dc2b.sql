-- Create cron jobs to process pending deliveries every 10 seconds
-- Job 1: Runs immediately at the start of each minute (0 seconds)
SELECT cron.schedule(
  'process-pending-deliveries-0',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Job 2: Runs at 10 seconds
SELECT cron.schedule(
  'process-pending-deliveries-10',
  '* * * * *',
  $$
  SELECT pg_sleep(10);
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Job 3: Runs at 20 seconds
SELECT cron.schedule(
  'process-pending-deliveries-20',
  '* * * * *',
  $$
  SELECT pg_sleep(20);
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Job 4: Runs at 30 seconds
SELECT cron.schedule(
  'process-pending-deliveries-30',
  '* * * * *',
  $$
  SELECT pg_sleep(30);
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Job 5: Runs at 40 seconds
SELECT cron.schedule(
  'process-pending-deliveries-40',
  '* * * * *',
  $$
  SELECT pg_sleep(40);
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Job 6: Runs at 50 seconds
SELECT cron.schedule(
  'process-pending-deliveries-50',
  '* * * * *',
  $$
  SELECT pg_sleep(50);
  SELECT net.http_post(
    url := 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/process-pending-deliveries',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d2J3YXpuc3JyYWN2YmVrc3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzMwNTksImV4cCI6MjA2MzQ0OTA1OX0.GO5LBd9XL6qvhpQ--RTszAvXx0k-7rgzloKBNFpdy_o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);