-- Add new listing fields to alerts table
ALTER TABLE alerts 
ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'rent',
ADD COLUMN property_type TEXT NOT NULL DEFAULT 'apartment',
ADD COLUMN area INTEGER NOT NULL DEFAULT 0,
ADD COLUMN floor INTEGER;

-- Add constraints for the new fields
ALTER TABLE alerts 
ADD CONSTRAINT alerts_listing_type_check 
CHECK (listing_type IN ('rent', 'sale'));

ALTER TABLE alerts 
ADD CONSTRAINT alerts_property_type_check 
CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'loft', 'commercial'));

ALTER TABLE alerts 
ADD CONSTRAINT alerts_area_check 
CHECK (area > 0);

ALTER TABLE alerts 
ADD CONSTRAINT alerts_floor_check 
CHECK (floor IS NULL OR floor >= 0);

-- Update existing alerts to have reasonable default values
UPDATE alerts 
SET 
  listing_type = 'rent',
  property_type = 'apartment',
  area = 50
WHERE listing_type IS NULL OR property_type IS NULL OR area IS NULL;

-- Make the new fields required after setting defaults
ALTER TABLE alerts 
ALTER COLUMN listing_type SET NOT NULL,
ALTER COLUMN property_type SET NOT NULL,
ALTER COLUMN area SET NOT NULL;
