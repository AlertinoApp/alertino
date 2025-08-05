-- Add is_favorite field to alerts table
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Create index for is_favorite for better performance when filtering
CREATE INDEX IF NOT EXISTS idx_alerts_is_favorite ON public.alerts(is_favorite);

-- Create index for user_id + is_favorite for efficient user-specific favorite queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_favorite ON public.alerts(user_id, is_favorite); 