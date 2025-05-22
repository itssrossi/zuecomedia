
-- Create the user_onboarding table to track onboarding progress
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_data JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies to secure the table
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own onboarding data
CREATE POLICY "Users can view their own onboarding data" 
  ON user_onboarding 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own onboarding data
CREATE POLICY "Users can update their own onboarding data" 
  ON user_onboarding 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own onboarding data
CREATE POLICY "Users can insert their own onboarding data" 
  ON user_onboarding 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
