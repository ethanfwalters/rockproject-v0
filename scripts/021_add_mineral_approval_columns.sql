-- Add approval workflow columns to existing minerals table
ALTER TABLE public.minerals
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS minerals_status_idx ON public.minerals(status);
