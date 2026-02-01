-- Create profiles table for usernames
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add CHECK constraint for username format: 3-30 chars, lowercase alphanumeric + underscores
ALTER TABLE public.profiles
  ADD CONSTRAINT username_format CHECK (
    username ~ '^[a-z0-9_]{3,30}$'
  );

-- Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anyone authenticated can read all profiles
CREATE POLICY "Users can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed existing users with usernames derived from their email prefix
-- Part before @, lowercased, non-alphanumeric replaced with _, truncated to 30 chars
-- Numbered suffix appended if duplicates
DO $$
DECLARE
  r RECORD;
  base_username TEXT;
  final_username TEXT;
  suffix INT;
BEGIN
  FOR r IN SELECT id, email FROM auth.users ORDER BY created_at ASC LOOP
    -- Extract part before @, lowercase, replace non-alphanumeric with _
    base_username := regexp_replace(lower(split_part(r.email, '@', 1)), '[^a-z0-9]', '_', 'g');
    -- Remove leading/trailing underscores and collapse multiple underscores
    base_username := regexp_replace(base_username, '_+', '_', 'g');
    base_username := trim(BOTH '_' FROM base_username);
    -- Ensure minimum length of 3
    IF length(base_username) < 3 THEN
      base_username := base_username || repeat('_', 3 - length(base_username));
    END IF;
    -- Truncate to 30 chars
    base_username := left(base_username, 30);

    -- Check for uniqueness, append suffix if needed
    final_username := base_username;
    suffix := 1;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      final_username := left(base_username, 30 - length(suffix::text) - 1) || '_' || suffix::text;
      suffix := suffix + 1;
    END LOOP;

    INSERT INTO public.profiles (user_id, username)
    VALUES (r.id, final_username);
  END LOOP;
END $$;
