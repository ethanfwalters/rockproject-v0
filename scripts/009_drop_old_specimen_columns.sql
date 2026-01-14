-- Migration 009: Drop old specimen columns
-- Run this AFTER migrating any existing data and verifying the new schema works
-- This removes the old flat fields that are now replaced by normalized tables

-- WARNING: This is a destructive migration. Ensure you have:
-- 1. Backed up any data you want to preserve
-- 2. Successfully migrated data to the new schema
-- 3. Verified the application works with the new schema

ALTER TABLE public.specimens
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS hardness,
DROP COLUMN IF EXISTS luster,
DROP COLUMN IF EXISTS color,
DROP COLUMN IF EXISTS composition,
DROP COLUMN IF EXISTS weight,
DROP COLUMN IF EXISTS dimensions,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude,
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS acquisition_date;
