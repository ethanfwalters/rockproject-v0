-- Create admin_users table to track admin users
-- This stores which users have admin access and super admin privileges
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view admin users (needed for profile page check)
CREATE POLICY "Authenticated users can view admin users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only super admins can insert new admins
CREATE POLICY "Super admins can insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- RLS Policy: Only super admins can update admin users
CREATE POLICY "Super admins can update admin users"
  ON public.admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- RLS Policy: Only super admins can delete admin users (but not themselves)
CREATE POLICY "Super admins can delete other admin users"
  ON public.admin_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
    AND user_id != auth.uid()
  );

-- Create indexes for faster lookups
CREATE INDEX admin_users_user_id_idx ON public.admin_users(user_id);
CREATE INDEX admin_users_email_idx ON public.admin_users(email);
CREATE INDEX admin_users_is_super_admin_idx ON public.admin_users(is_super_admin);

-- Add a comment to the table
COMMENT ON TABLE public.admin_users IS 'Tracks admin users with super admin capabilities for managing the reference database';
