-- Add the timing_type column
ALTER TABLE nurture_messages 
ADD COLUMN timing_type TEXT NOT NULL DEFAULT 'delay';

-- Add check constraint for valid timing types
ALTER TABLE nurture_messages
ADD CONSTRAINT nurture_messages_timing_type_check 
CHECK (timing_type IN ('immediate', 'delay', 'schedule'));

-- Rename send_day to schedule_day
ALTER TABLE nurture_messages 
RENAME COLUMN send_day TO schedule_day;

-- Rename send_time to schedule_time
ALTER TABLE nurture_messages 
RENAME COLUMN send_time TO schedule_time;