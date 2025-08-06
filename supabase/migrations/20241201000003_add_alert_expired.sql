-- Add is_expired field to alerts table
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT FALSE;

-- Create index for is_expired for better performance when filtering
CREATE INDEX IF NOT EXISTS idx_alerts_is_expired ON public.alerts(is_expired);

-- Create index for user_id + is_expired for efficient user-specific expired queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_expired ON public.alerts(user_id, is_expired); 