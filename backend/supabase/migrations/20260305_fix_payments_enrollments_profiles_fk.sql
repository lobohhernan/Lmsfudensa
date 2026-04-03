-- ============================================================
-- FIX: Agregar FK de enrollments y payments hacia profiles
-- 
-- Problema: enrollments.user_id y payments.user_id referencian
-- auth.users(id) pero NO public.profiles(id).
-- PostgREST necesita una FK directa a profiles para resolver
-- el join embebido "profiles!user_id(...)".
-- ============================================================

-- 1. Asegurar que todos los user_id en enrollments existen en profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT DISTINCT e.user_id, '', '', 'student'
FROM public.enrollments e
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = e.user_id
)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar que todos los user_id en payments existen en profiles
-- (Solo si la tabla payments existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    EXECUTE '
      INSERT INTO public.profiles (id, email, full_name, role)
      SELECT DISTINCT pay.user_id, '''', '''', ''student''
      FROM public.payments pay
      WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = pay.user_id
      )
      ON CONFLICT (id) DO NOTHING
    ';
  END IF;
END $$;

-- 3. Agregar FK de enrollments.user_id -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_enrollments_profiles'
      AND table_name = 'enrollments'
  ) THEN
    ALTER TABLE public.enrollments
      ADD CONSTRAINT fk_enrollments_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Agregar FK de payments.user_id -> profiles.id (solo si la tabla existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_payments_profiles'
        AND table_name = 'payments'
    ) THEN
      ALTER TABLE public.payments
        ADD CONSTRAINT fk_payments_profiles
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
