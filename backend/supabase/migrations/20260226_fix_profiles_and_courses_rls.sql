-- ============================================================================
-- Migration: Fix RLS policies for profiles and courses tables
-- Date: 2026-02-26
-- 
-- Problems fixed:
--   1. profiles table has NO INSERT policy → users can't create their profile
--      after sign-up (causes 500 on POST /profiles)
--   2. profiles table has NO UPDATE policy → users can't update their profile
--   3. profiles SELECT policy only allows own profile → admins can't list users
--   4. courses table has NO public SELECT policy → students/anonymous can't
--      browse the course catalog (causes timeout / empty results)
-- ============================================================================

-- ─── 1. PROFILES: Add INSERT policy ─────────────────────────────────────────
-- Allow authenticated users to create their own profile row (for ensureProfile)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── 2. PROFILES: Add UPDATE policy ─────────────────────────────────────────
-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── 3. PROFILES: Extend SELECT to allow admins to view all profiles ────────
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;
CREATE POLICY "Users can view own profile and admins can view all"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─── 4. COURSES: Add public SELECT policy ───────────────────────────────────
DROP POLICY IF EXISTS "Instructors can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses"
  ON public.courses
  FOR SELECT
  USING (true);
