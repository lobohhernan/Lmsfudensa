-- ============================================================
-- MIGRACIÓN: Relaxar RLS policies en enrollments
-- ============================================================
-- Problema: Error 406 al leer enrollments
-- Causa: Las políticas RLS son muy restrictivas
-- Solución: Permitir que usuarios autenticados lean sus inscripciones

-- Recrear políticas más flexibles
DROP POLICY IF EXISTS "enrollments_read_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_read_instructor" ON public.enrollments;

-- 1. Usuarios autenticados pueden VER SUS PROPIAS inscripciones
CREATE POLICY "enrollments_read_own"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Instructores pueden VER inscripciones en SUS CURSOS
CREATE POLICY "enrollments_read_instructor"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- 3. Admins pueden VER TODAS las inscripciones
CREATE POLICY "enrollments_read_admin"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Mantener políticas de INSERT y UPDATE existentes
-- (El webhook inserta con service role, así que no es afectado por RLS)
