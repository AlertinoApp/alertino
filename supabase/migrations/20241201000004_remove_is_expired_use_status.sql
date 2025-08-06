-- Update existing expired alerts to use status = 'expired' instead of is_expired = true
UPDATE public.alerts 
SET status = 'expired' 
WHERE is_expired = true;

-- Remove the is_expired column
ALTER TABLE public.alerts 
DROP COLUMN IF EXISTS is_expired;

-- Drop the indexes that were created for is_expired
DROP INDEX IF EXISTS idx_alerts_is_expired;
DROP INDEX IF EXISTS idx_alerts_user_expired; 