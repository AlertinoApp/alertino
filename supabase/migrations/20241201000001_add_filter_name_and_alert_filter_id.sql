-- Add name field to filters table
ALTER TABLE public.filters 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT NULL;

-- Add filter_id field to alerts table
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS filter_id UUID REFERENCES public.filters(id) ON DELETE CASCADE;

-- Create index for filter_id in alerts table for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_filter_id ON public.alerts(filter_id);

-- Update existing filters to have default names if they don't have one
-- Simple approach: just use a generic name for existing filters
UPDATE public.filters 
SET name = CONCAT('Filter ', id::text)
WHERE name IS NULL;

-- Make name field NOT NULL after setting default values
ALTER TABLE public.filters 
ALTER COLUMN name SET NOT NULL;

-- Add a unique constraint to ensure filter names are unique per user
ALTER TABLE public.filters 
ADD CONSTRAINT filters_user_id_name_unique UNIQUE (user_id, name); 