-- ========================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- Y CREAR POLÍTICAS PÚBLICAS PARA ADMINPANEL
-- ========================================
-- Fecha: 13 noviembre 2025
-- Problema: Supabase reporta "RLS Disabled in Public" para múltiples tablas
-- Solución: Habilitar RLS + crear políticas que permitan lectura pública
-- ========================================

-- ========================================
-- PASO 1: HABILITAR RLS EN TODAS LAS TABLAS
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_outcomes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 2: ELIMINAR POLÍTICAS CONFLICTIVAS ANTIGUAS
-- ========================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow registration - insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read access for admin dashboard" ON public.profiles;

-- Courses
DROP POLICY IF EXISTS "Instructors can manage their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view all courses" ON public.courses;

-- Lessons
DROP POLICY IF EXISTS "Anyone can view lessons from published courses" ON public.lessons;
DROP POLICY IF EXISTS "Only instructors can manage their course lessons" ON public.lessons;
DROP POLICY IF EXISTS "Public can view lessons" ON public.lessons;

-- Evaluations
DROP POLICY IF EXISTS "Anyone can view evaluations from published courses" ON public.evaluations;
DROP POLICY IF EXISTS "Only instructors can manage their course evaluations" ON public.evaluations;

-- Requirements
DROP POLICY IF EXISTS "Anyone can view course requirements" ON public.course_requirements;
DROP POLICY IF EXISTS "Only instructors can manage course requirements" ON public.course_requirements;

-- Learning Outcomes
DROP POLICY IF EXISTS "Anyone can view learning outcomes" ON public.course_learning_outcomes;
DROP POLICY IF EXISTS "Only instructors can manage learning outcomes" ON public.course_learning_outcomes;

-- ========================================
-- PASO 3: CREAR POLÍTICAS PARA PROFILES
-- ========================================

-- Lectura pública (para AdminPanel)
CREATE POLICY "public_profiles_select"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Inserción durante registro (usuario crea su propio perfil)
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
-- PASO 4: CREAR POLÍTICAS PARA COURSES
-- ========================================

-- Lectura pública (catálogo de cursos)
CREATE POLICY "public_courses_select"
  ON public.courses
  FOR SELECT
  USING (true);

-- Inserción solo para instructores y admins
CREATE POLICY "courses_insert_instructor_admin"
  ON public.courses
  FOR INSERT
  WITH CHECK (
    auth.uid() = instructor_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- Actualización solo para el instructor propietario o admins
CREATE POLICY "courses_update_owner_admin"
  ON public.courses
  FOR UPDATE
  USING (
    auth.uid() = instructor_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = instructor_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Eliminación solo para admins
CREATE POLICY "courses_delete_admin_only"
  ON public.courses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- PASO 5: CREAR POLÍTICAS PARA LESSONS
-- ========================================

-- Lectura pública
CREATE POLICY "public_lessons_select"
  ON public.lessons
  FOR SELECT
  USING (true);

-- Escritura solo para instructor del curso o admin
CREATE POLICY "lessons_write_owner_admin"
  ON public.lessons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = lessons.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = lessons.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ========================================
-- PASO 6: CREAR POLÍTICAS PARA EVALUATIONS
-- ========================================

-- Lectura pública
CREATE POLICY "public_evaluations_select"
  ON public.evaluations
  FOR SELECT
  USING (true);

-- Escritura solo para instructor del curso o admin
CREATE POLICY "evaluations_write_owner_admin"
  ON public.evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = evaluations.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = evaluations.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ========================================
-- PASO 7: CREAR POLÍTICAS PARA COURSE_REQUIREMENTS
-- ========================================

-- Lectura pública
CREATE POLICY "public_requirements_select"
  ON public.course_requirements
  FOR SELECT
  USING (true);

-- Escritura solo para instructor del curso o admin
CREATE POLICY "requirements_write_owner_admin"
  ON public.course_requirements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_requirements.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_requirements.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ========================================
-- PASO 8: CREAR POLÍTICAS PARA COURSE_LEARNING_OUTCOMES
-- ========================================

-- Lectura pública
CREATE POLICY "public_outcomes_select"
  ON public.course_learning_outcomes
  FOR SELECT
  USING (true);

-- Escritura solo para instructor del curso o admin
CREATE POLICY "outcomes_write_owner_admin"
  ON public.course_learning_outcomes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_learning_outcomes.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_learning_outcomes.course_id 
      AND (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ========================================
-- PASO 9: VERIFICACIÓN - Ver todas las políticas
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  LEFT(qual::text, 50) as condition
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

-- ========================================
-- PASO 10: VERIFICAR QUE RLS ESTÁ HABILITADO
-- ========================================

SELECT 
  n.nspname AS schema,
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
-- Todas las tablas deben mostrar "✅ ENABLED"
-- El AdminPanel podrá leer datos (SELECT público)
-- La escritura sigue protegida (requiere autenticación + roles)
-- ========================================

-- ========================================
-- NOTAS DE SEGURIDAD
-- ========================================
-- ✅ RLS habilitado en todas las tablas
-- ✅ Lectura pública permitida (necesario para catálogo y AdminPanel)
-- ✅ Escritura protegida (requiere auth + roles específicos)
-- ⚠️  Para producción, considera:
--    - Crear un backend API que use service_role_key
--    - O forzar autenticación en AdminPanel
--    - Limitar acceso público solo a campos no sensibles
-- ========================================
