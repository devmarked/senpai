-- Migration: Change from hourly booking to monthly subscriptions
-- This migration creates the subscriptions table and updates profiles for monthly pricing

-- 1. Drop the availability table (no longer needed for subscriptions)
DROP TABLE IF EXISTS availability CASCADE;

-- 2. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Subscription details
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due, paused
  monthly_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate active subscriptions
  UNIQUE(mentor_id, mentee_id, status)
);

-- 3. Update profiles table - rename hourly_rate to monthly_rate
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS hourly_rate CASCADE;

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC DEFAULT 0;

-- Add Stripe product/price IDs to profiles (one product per mentor)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_mentor_id ON subscriptions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mentee_id ON subscriptions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- 5. Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Mentees can view their own subscriptions
CREATE POLICY "Mentees can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = mentee_id);

-- Mentors can view subscriptions to their mentorship
CREATE POLICY "Mentors can view their subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = mentor_id);

-- Authenticated users can create subscriptions (as mentee)
CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

-- Users can update their own subscriptions (for cancellations)
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

-- 7. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- 8. Optional: Keep sessions table for session tracking within subscription
-- Update sessions table to link to subscriptions
ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Make scheduled_at and some fields optional since sessions are part of subscription
ALTER TABLE sessions 
  ALTER COLUMN scheduled_at DROP NOT NULL;

COMMENT ON TABLE subscriptions IS 'Monthly mentorship subscriptions between mentees and mentors';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active, cancelled, past_due, paused';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether the subscription will cancel at the end of the current period';

