-- Add new fields to filters table
ALTER TABLE public.filters 
ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale')),
ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'loft', 'commercial')),
ADD COLUMN IF NOT EXISTS min_price INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_rooms INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS min_area INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_area INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS floor INTEGER DEFAULT NULL;

-- Update existing filters to have default values
UPDATE public.filters 
SET 
  listing_type = 'rent',
  property_type = 'apartment',
  min_price = 1,
  max_rooms = 10,
  min_area = 1,
  max_area = 200
WHERE listing_type IS NULL;

-- Make new fields NOT NULL after setting default values
ALTER TABLE public.filters 
ALTER COLUMN listing_type SET NOT NULL,
ALTER COLUMN property_type SET NOT NULL,
ALTER COLUMN min_price SET NOT NULL,
ALTER COLUMN max_rooms SET NOT NULL,
ALTER COLUMN min_area SET NOT NULL,
ALTER COLUMN max_area SET NOT NULL;

-- Add constraints
ALTER TABLE public.filters 
ADD CONSTRAINT filters_min_price_check CHECK (min_price >= 1),
ADD CONSTRAINT filters_max_price_check CHECK (max_price > 0),
ADD CONSTRAINT filters_min_rooms_check CHECK (min_rooms >= 1),
ADD CONSTRAINT filters_max_rooms_check CHECK (max_rooms >= 1),
ADD CONSTRAINT filters_min_area_check CHECK (min_area >= 1),
ADD CONSTRAINT filters_max_area_check CHECK (max_area > 0),
ADD CONSTRAINT filters_price_range_check CHECK (min_price <= max_price),
ADD CONSTRAINT filters_rooms_range_check CHECK (min_rooms <= max_rooms),
ADD CONSTRAINT filters_area_range_check CHECK (min_area <= max_area),
ADD CONSTRAINT filters_floor_check CHECK (floor IS NULL OR (floor >= 0 AND floor <= 50));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_filters_listing_type ON public.filters(listing_type);
CREATE INDEX IF NOT EXISTS idx_filters_property_type ON public.filters(property_type);
CREATE INDEX IF NOT EXISTS idx_filters_price_range ON public.filters(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_filters_rooms_range ON public.filters(min_rooms, max_rooms);
CREATE INDEX IF NOT EXISTS idx_filters_area_range ON public.filters(min_area, max_area);
CREATE INDEX IF NOT EXISTS idx_filters_floor ON public.filters(floor);
