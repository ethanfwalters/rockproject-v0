-- Add is_public column to specimens table
-- Defaults to false (private) for existing and new specimens
ALTER TABLE public.specimens
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own specimens" ON public.specimens;

-- Create new SELECT policy that allows:
-- 1. Users to view their own specimens (public or private)
-- 2. Users to view other users' public specimens
CREATE POLICY "Users can view own and public specimens"
  ON public.specimens FOR SELECT
  USING (
    auth.uid() = user_id  -- User can always see their own
    OR is_public = true   -- Anyone can see public specimens
  );

-- Create index for better query performance on public specimens
CREATE INDEX IF NOT EXISTS specimens_is_public_idx ON public.specimens(is_public) WHERE is_public = true;
