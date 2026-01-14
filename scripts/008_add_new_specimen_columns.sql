-- Add new columns to specimens table for the refactored schema
-- This migration adds new columns while keeping old ones temporarily

-- Add locality reference
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL;

-- Add mineral_ids as ordered array (position = rank: 1st = primary, 2nd = secondary, etc.)
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS mineral_ids UUID[] DEFAULT '{}';

-- Add individual dimension columns (in millimeters)
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS length NUMERIC;

ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS width NUMERIC;

ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS height NUMERIC;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS specimens_locality_idx ON public.specimens(locality_id);
CREATE INDEX IF NOT EXISTS specimens_mineral_ids_idx ON public.specimens USING GIN(mineral_ids);
