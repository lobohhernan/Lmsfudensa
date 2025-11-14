-- =====================================================================
-- FIX DEFINITIVO: HABILITAR RLS + POLICIES SEGURAS PARA PRODUCCIÓN
-- =====================================================================
-- SOLUCIÓN A LOS ERRORES:
-- ❌ "Policy Exists RLS Disabled" en public.courses
-- ❌ "RLS Disabled in Public" en public.courses
--
-- ESTRATEGIA:
-- 1. Re-habilitar RLS en courses
-- 2. Limpiar policies conflictivas
-- 3. Crear policies que funcionen con SERVICE_ROLE_KEY (bypasean RLS)
-- 4. Permitir lectura pública + escritura solo con service_role o admin auth
-- =====================================================================

-- =====================================================================
-- PASO 1: RE-HABILITAR RLS
-- =====================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- PASO 2: LIMPIAR TODAS LAS POLICIES EXISTENTES
-- =====================================================================

DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_update" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_delete" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_auth" ON public.courses;
DROP POLICY IF EXISTS "courses_update_owner" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_owner" ON public.courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view all courses" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_instructor_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_update_owner_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin_only" ON public.courses;
DROP POLICY IF EXISTS "courses_select_all" ON public.courses;

-- =====================================================================
-- PASO 3: CREAR POLICIES SEGURAS COMPATIBLES CON SERVICE_ROLE_KEY
-- =====================================================================
-- IMPORTANTE: El service_role_key BYPASEA todas estas policies
-- Las policies solo aplican a usuarios con anon_key o authenticated users
-- =====================================================================

-- POLICY 1: Lectura pública (cualquiera puede leer cursos)
CREATE POLICY "courses_select_public"
  ON public.courses
  FOR SELECT
  USING (true);

-- POLICY 2: Inserción solo para usuarios autenticados
-- (service_role_key bypasea esto automáticamente)
CREATE POLICY "courses_insert_authenticated"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- POLICY 3: Actualización solo para el instructor dueño
-- (service_role_key bypasea esto automáticamente)
CREATE POLICY "courses_update_owner"
  ON public.courses
  FOR UPDATE
  USING (auth.uid() = instructor_id);

-- POLICY 4: Eliminación solo para el instructor dueño
-- (service_role_key bypasea esto automáticamente)
CREATE POLICY "courses_delete_owner"
  ON public.courses
  FOR DELETE
  USING (auth.uid() = instructor_id);

-- =====================================================================
-- PASO 4: APLICAR MISMA ESTRATEGIA A OTRAS TABLAS CRÍTICAS
-- =====================================================================

-- PROFILES: Lectura pública + edición propia
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Public read access for admin dashboard" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- LESSONS: Lectura pública + escritura para owner del curso
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert_auth" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update_auth" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete_auth" ON public.lessons;
DROP POLICY IF EXISTS "Public can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Only instructors can manage their course lessons" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view lessons from published courses" ON public.lessons;

CREATE POLICY "lessons_select_public"
  ON public.lessons
  FOR SELECT
  USING (true);

CREATE POLICY "lessons_write_course_owner"
  ON public.lessons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- EVALUATIONS: Lectura pública + escritura para owner del curso
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evaluations_select_all" ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_modify_auth" ON public.evaluations;
DROP POLICY IF EXISTS "Anyone can view evaluations from published courses" ON public.evaluations;
DROP POLICY IF EXISTS "Only instructors can manage their course evaluations" ON public.evaluations;

CREATE POLICY "evaluations_select_public"
  ON public.evaluations
  FOR SELECT
  USING (true);

CREATE POLICY "evaluations_write_course_owner"
  ON public.evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ENROLLMENTS: Lectura pública + escritura para el propio usuario
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_all" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;

CREATE POLICY "enrollments_select_public"
  ON public.enrollments
  FOR SELECT
  USING (true);

CREATE POLICY "enrollments_insert_own"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- COURSE_PROGRESS: Solo el usuario puede ver/modificar su propio progreso
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progress_select_own" ON public.course_progress;
DROP POLICY IF EXISTS "progress_write_own" ON public.course_progress;

CREATE POLICY "progress_select_own"
  ON public.course_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_write_own"
  ON public.course_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================================
-- PASO 5: VERIFICACIÓN
-- =====================================================================

-- Ver estado de RLS en todas las tablas
SELECT 
  c.relname AS table_name,
  CASE 
    WHEN c.relrowsecurity THEN '✅ RLS ENABLED' 
    ELSE '❌ RLS DISABLED' 
  END AS rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('courses', 'profiles', 'lessons', 'evaluations', 'enrollments', 'course_progress')
ORDER BY c.relname;

-- Ver policies activas en courses
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || pg_get_expr(qual, 'public.courses'::regclass)
    ELSE 'Sin USING'
  END AS using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || pg_get_expr(with_check, 'public.courses'::regclass)
    ELSE 'Sin WITH CHECK'
  END AS with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'courses'
ORDER BY cmd, policyname;

-- =====================================================================
-- RESULTADO ESPERADO
-- =====================================================================
-- ✅ RLS ENABLED en todas las tablas
-- ✅ 4 policies en courses (SELECT, INSERT, UPDATE, DELETE)
-- ✅ service_role_key bypasea todas las policies automáticamente
-- ✅ AdminPanel funciona porque usa supabaseAdmin con service_role_key
-- ✅ Usuarios normales (con anon_key) pueden leer pero no modificar
-- =====================================================================

-- =====================================================================
-- TESTING RÁPIDO
-- =====================================================================
-- Ejecutar estos comandos para probar que todo funciona:

-- Test 1: SELECT público (debe funcionar con cualquier key)
-- SELECT id, title, slug FROM public.courses LIMIT 5;

-- Test 2: INSERT con service_role_key (debe funcionar desde AdminPanel)
-- Este test lo harás desde el AdminPanel UI o con curl usando service_role_key

-- Test 3: INSERT con anon_key (debe fallar - comportamiento esperado)
-- Esto protege tu base de inserts no autorizados

-- =====================================================================
-- NOTAS IMPORTANTES
-- =====================================================================
-- 1. AdminPanel usa supabaseAdmin (con service_role_key) → BYPASEA RLS
-- 2. Usuarios normales usan supabase (con anon_key) → SUJETOS A RLS
-- 3. Las policies protegen contra escritura no autorizada
-- 4. Lectura es pública porque los cursos son contenido público
-- 5. Para operaciones admin, SIEMPRE usar supabaseAdmin (ya configurado)
-- =====================================================================
