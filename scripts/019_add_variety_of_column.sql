-- Migration: Add variety_of column to minerals table
-- This column stores the parent mineral ID when a mineral is a variety

-- Add variety_of column as a foreign key to minerals table
ALTER TABLE public.minerals
ADD COLUMN IF NOT EXISTS variety_of UUID REFERENCES public.minerals(id) ON DELETE SET NULL;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS minerals_variety_of_idx ON public.minerals(variety_of);

-- Add comment to describe the column
COMMENT ON COLUMN public.minerals.variety_of IS 'References the parent mineral when is_variety is true (e.g., Amethyst variety_of Quartz)';

-- Add check constraint to ensure variety_of is set when is_variety is true
-- Note: This is a soft constraint - the API will enforce this more strictly
-- We allow NULL variety_of for existing data that might not have been updated
