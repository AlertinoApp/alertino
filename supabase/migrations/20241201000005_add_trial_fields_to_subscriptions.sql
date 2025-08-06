-- Add trial fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Create index for trial_end for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end);

-- Update existing subscriptions to mark trial as used if they have a stripe_subscription_id
UPDATE public.subscriptions 
SET trial_used = TRUE 
WHERE stripe_subscription_id IS NOT NULL AND trial_used IS NULL; 