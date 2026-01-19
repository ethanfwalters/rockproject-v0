-- Fix:  change default

-- Change the default for future inserts
ALTER TABLE public.minerals
ALTER COLUMN is_variety SET DEFAULT true;
