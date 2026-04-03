-- Migration: add is_active column to courses and profiles
-- This enables soft-deactivation without permanent deletion

-- Add is_active to courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add is_active to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for efficient filtering by active status
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses (is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles (is_active);

-- Ensure all existing records are marked active
UPDATE public.courses SET is_active = true WHERE is_active IS NULL;
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
