-- Manual SQL commands to update subscriptions table
-- Run these commands in your Supabase SQL editor or database client

-- 1. Drop the existing check constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- 2. Add the new check constraint that allows the current plan values
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('free', 'basic', 'pro'));

-- 3. Update any existing subscriptions that might have old plan values
-- Common old plan names that might exist:
-- - 'premium' -> 'basic'
-- - 'business' -> 'pro'
-- - 'starter' -> 'free'
-- - 'standard' -> 'basic'

UPDATE public.subscriptions 
SET plan = 'basic' 
WHERE plan IN ('premium', 'standard', 'starter');

UPDATE public.subscriptions 
SET plan = 'pro' 
WHERE plan IN ('business', 'enterprise');

UPDATE public.subscriptions 
SET plan = 'free' 
WHERE plan NOT IN ('free', 'basic', 'pro') OR plan IS NULL;

-- 4. Ensure all subscriptions have a valid plan
UPDATE public.subscriptions 
SET plan = 'free' 
WHERE plan IS NULL;

-- 5. Verify the changes
SELECT DISTINCT plan FROM public.subscriptions; 