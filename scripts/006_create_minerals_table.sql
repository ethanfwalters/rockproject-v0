-- Create minerals table (shared/public)
-- Stores all known mineral names that specimens can reference

CREATE TABLE IF NOT EXISTS public.minerals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient case-insensitive name lookups
CREATE INDEX IF NOT EXISTS minerals_name_idx ON public.minerals(LOWER(name));

-- No RLS - minerals are public/shared across all users
-- Anyone can read, only admins should be able to modify (enforce at API level)
