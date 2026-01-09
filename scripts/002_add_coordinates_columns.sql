-- Add latitude and longitude columns for map functionality
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS specimens_coordinates_idx ON public.specimens(latitude, longitude);
