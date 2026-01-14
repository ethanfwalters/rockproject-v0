-- Migration 010: Drop specimen_reference table
-- This removes the old auto-fill reference database
-- The new system uses user-managed minerals and localities tables instead

-- WARNING: This is a destructive migration. The specimen_reference table
-- will be permanently deleted.

DROP TABLE IF EXISTS public.specimen_reference;
