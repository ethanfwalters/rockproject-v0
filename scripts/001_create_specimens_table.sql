-- Create specimens table
CREATE TABLE IF NOT EXISTS public.specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  acquisition_date DATE,
  description TEXT,
  hardness NUMERIC,
  luster TEXT,
  color TEXT,
  composition TEXT,
  weight NUMERIC,
  dimensions TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.specimens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own specimens"
  ON public.specimens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own specimens"
  ON public.specimens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own specimens"
  ON public.specimens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own specimens"
  ON public.specimens FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX specimens_user_id_idx ON public.specimens(user_id);
CREATE INDEX specimens_created_at_idx ON public.specimens(created_at DESC);
