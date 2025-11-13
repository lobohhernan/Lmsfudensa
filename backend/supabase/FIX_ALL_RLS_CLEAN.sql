-- ========================================
-- LIMPIEZA COMPLETA Y HABILITACIÓN DE RLS
-- ========================================
-- Problema: Políticas duplicadas y RLS en estado inconsistente
-- Solución: Limpiar TODO y empezar desde cero
-- Versión 2: Sin referencias a columna 'role' en políticas complejas
-- ========================================

-- ========================================
-- PASO 1: DESACTIVAR RLS TEMPORALMENTE
-- ========================================
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_learning_outcomes DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ========================================

-- Obtener y eliminar todas las políticas de profiles
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Obtener y eliminar todas las políticas de courses
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'courses' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses', pol.policyname);
    END LOOP;
END $$;

-- Obtener y eliminar todas las políticas de lessons
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'lessons' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.lessons', pol.policyname);
    END LOOP;
END $$;

-- Obtener y eliminar todas las políticas de evaluations
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'evaluations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.evaluations', pol.policyname);
    END LOOP;
END $$;

-- Obtener y eliminar todas las políticas de course_requirements
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'course_requirements' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.course_requirements', pol.policyname);
    END LOOP;
END $$;

-- Obtener y eliminar todas las políticas de course_learning_outcomes
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'course_learning_outcomes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.course_learning_outcomes', pol.policyname);
    END LOOP;
END $$;

-- ========================================
-- PASO 3: ACTIVAR RLS EN TODAS LAS TABLAS
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_outcomes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 4: CREAR POLÍTICAS LIMPIAS - PROFILES
-- ========================================

-- Lectura pública
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Inserción solo del propio perfil
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Actualización solo del propio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Eliminación solo del propio perfil
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ========================================
-- PASO 5: CREAR POLÍTICAS LIMPIAS - COURSES
-- ========================================

-- Lectura pública
CREATE POLICY "courses_select_all"
  ON public.courses
  FOR SELECT
  USING (true);

-- Inserción para usuarios autenticados
CREATE POLICY "courses_insert_auth"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

-- Actualización para propietario del curso
CREATE POLICY "courses_update_owner"
  ON public.courses
  FOR UPDATE
  USING (auth.uid() = instructor_id);

-- Eliminación para propietario del curso
CREATE POLICY "courses_delete_owner"
  ON public.courses
  FOR DELETE
  USING (auth.uid() = instructor_id);

-- ========================================
-- PASO 6: CREAR POLÍTICAS LIMPIAS - LESSONS
-- ========================================

-- Lectura pública
CREATE POLICY "lessons_select_all"
  ON public.lessons
  FOR SELECT
  USING (true);

-- Inserción para instructor del curso
CREATE POLICY "lessons_insert_auth"
  ON public.lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Actualización para instructor del curso
CREATE POLICY "lessons_update_auth"
  ON public.lessons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Eliminación para instructor del curso
CREATE POLICY "lessons_delete_auth"
  ON public.lessons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ========================================
-- PASO 7: CREAR POLÍTICAS LIMPIAS - EVALUATIONS
-- ========================================

-- Lectura pública
CREATE POLICY "evaluations_select_all"
  ON public.evaluations
  FOR SELECT
  USING (true);

-- Escritura para instructor del curso
CREATE POLICY "evaluations_modify_auth"
  ON public.evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ========================================
-- PASO 8: CREAR POLÍTICAS LIMPIAS - REQUIREMENTS
-- ========================================

-- Lectura pública
CREATE POLICY "requirements_select_all"
  ON public.course_requirements
  FOR SELECT
  USING (true);

-- Escritura para instructor del curso
CREATE POLICY "requirements_modify_auth"
  ON public.course_requirements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ========================================
-- PASO 9: CREAR POLÍTICAS LIMPIAS - LEARNING OUTCOMES
-- ========================================

-- Lectura pública
CREATE POLICY "outcomes_select_all"
  ON public.course_learning_outcomes
  FOR SELECT
  USING (true);

-- Escritura para instructor del curso
CREATE POLICY "outcomes_modify_auth"
  ON public.course_learning_outcomes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ========================================
-- PASO 10: VERIFICAR ESTADO FINAL
-- ========================================

-- Ver todas las políticas activas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 
    'courses', 
    'lessons', 
    'evaluations', 
    'course_requirements', 
    'course_learning_outcomes'
  )
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
  c.relname AS table_name,
  CASE 
    WHEN c.relrowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END AS rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'profiles', 
    'courses', 
    'lessons', 
    'evaluations', 
    'course_requirements', 
    'course_learning_outcomes'
  )
ORDER BY c.relname;

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- ✅ Todas las tablas con RLS ENABLED
-- ✅ UNA sola política por tipo (SELECT/INSERT/UPDATE/DELETE)
-- ✅ Sin advertencias de "Multiple Permissive Policies"
-- ✅ INSERT de lecciones funcionará correctamente
-- ========================================
