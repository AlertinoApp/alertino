-- Drop the existing check constraint if it exists
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Add the new check constraint that allows the current plan values
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('free', 'basic', 'pro'));

-- Update any existing subscriptions that might have old plan values
-- This will update any subscriptions that might have old plan names
UPDATE public.subscriptions 
SET plan = 'free' 
WHERE plan NOT IN ('free', 'basic', 'pro') OR plan IS NULL; 