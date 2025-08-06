-- Update existing subscriptions to use the new plan structure
-- This migration handles any existing subscriptions that might have old plan values

-- First, let's see what plans currently exist
-- SELECT DISTINCT plan FROM public.subscriptions;

-- Update any subscriptions that might have old plan names to the new structure
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

-- Ensure all subscriptions have a valid plan
UPDATE public.subscriptions 
SET plan = 'free' 
WHERE plan IS NULL; 