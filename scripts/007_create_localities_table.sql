-- Create localities table with hierarchical linked list structure
-- Countries are root nodes (parent_id = NULL), with children like states, counties, mines, etc.

CREATE TABLE IF NOT EXISTS public.localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  kind TEXT NOT NULL,  -- e.g., 'country', 'state', 'county', 'district', 'mine', 'quarry', etc.
  parent_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on name + parent to prevent duplicates at same level
  UNIQUE(name, parent_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS localities_name_idx ON public.localities(LOWER(name));
CREATE INDEX IF NOT EXISTS localities_parent_idx ON public.localities(parent_id);
CREATE INDEX IF NOT EXISTS localities_kind_idx ON public.localities(kind);

-- No RLS - localities are public/shared across all users
-- Anyone can read, only admins should be able to modify (enforce at API level)
