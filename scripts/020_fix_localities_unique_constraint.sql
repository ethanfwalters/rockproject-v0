-- Fix the localities unique constraint to properly handle NULL parent_id values
-- The original UNIQUE(name, parent_id) doesn't prevent duplicates when parent_id is NULL
-- because NULL != NULL in SQL

-- Step 1: Remove duplicate localities (keep the oldest one by created_at)
DELETE FROM public.localities
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, COALESCE(parent_id::text, 'NULL')
             ORDER BY created_at ASC
           ) as rn
    FROM public.localities
  ) ranked
  WHERE rn > 1
);

-- Step 2: Drop the existing unique constraint
ALTER TABLE public.localities DROP CONSTRAINT IF EXISTS localities_name_parent_id_key;

-- Step 3: Create a new unique index that treats NULLs as equal
-- This uses COALESCE to handle NULL parent_id values
CREATE UNIQUE INDEX localities_name_parent_unique
ON public.localities (name, COALESCE(parent_id::text, 'NULL_PARENT'));

-- Alternative for PostgreSQL 15+:
-- ALTER TABLE public.localities
-- ADD CONSTRAINT localities_name_parent_id_key
-- UNIQUE NULLS NOT DISTINCT (name, parent_id);
