-- Add chemical_formula column to minerals table
-- This is an optional field to store the chemical formula of a mineral (e.g., SiO2 for Quartz)

ALTER TABLE public.minerals
ADD COLUMN IF NOT EXISTS chemical_formula TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.minerals.chemical_formula IS 'Optional chemical formula for the mineral (e.g., SiO2, Fe2O3)';
