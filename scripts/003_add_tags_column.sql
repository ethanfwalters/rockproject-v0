-- Add tags column to specimens table
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tags for better query performance
CREATE INDEX IF NOT EXISTS specimens_tags_idx ON public.specimens USING GIN(tags);
