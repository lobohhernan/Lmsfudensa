-- ✅ FIX RÁPIDO Y PERMANENTE PARA ACCESO ANÓNIMO A CURSOS
-- Este SQL permite que el catálogo de cursos se vea sin login
-- Y permite que admin panel cree/edite/elimine cursos

-- 1️⃣ HABILITAR RLS EN TODAS LAS TABLAS (Seguridad)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 2️⃣ POLICIES PARA COURSES (La tabla más importante)
-- Limpieza de policies antiguas
DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_update" ON public.courses;
DROP POLICY IF EXISTS "courses_permissive_delete" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_auth" ON public.courses;
DROP POLICY IF EXISTS "courses_update_owner" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_owner" ON public.courses;

-- ✅ POLICY: Cualquiera puede ver los cursos (catálogo público)
CREATE POLICY "courses_public_select"
  ON public.courses
  FOR SELECT
  USING (true);

-- ✅ POLICY: Usuarios autenticados pueden crear cursos
CREATE POLICY "courses_authenticated_insert"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ✅ POLICY: Propietario puede editar su curso
CREATE POLICY "courses_owner_update"
  ON public.courses
  FOR UPDATE
  USING (auth.uid() = instructor_id);

-- ✅ POLICY: Propietario puede eliminar su curso
CREATE POLICY "courses_owner_delete"
  ON public.courses
  FOR DELETE
  USING (auth.uid() = instructor_id);

-- 3️⃣ POLICIES PARA PROFILES
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;

-- ✅ Cualquiera puede ver perfiles (para instructores, etc)
CREATE POLICY "profiles_public_select"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 4️⃣ POLICIES PARA LESSONS (Lecciones públicas si el curso es público)
DROP POLICY IF EXISTS "lessons_public_select" ON public.lessons;

-- ✅ Cualquiera puede ver lecciones del curso
CREATE POLICY "lessons_public_select"
  ON public.lessons
  FOR SELECT
  USING (true);

-- 5️⃣ POLICIES PARA EVALUATIONS
DROP POLICY IF EXISTS "evaluations_public_select" ON public.evaluations;

-- ✅ Cualquiera puede ver evaluaciones
CREATE POLICY "evaluations_public_select"
  ON public.evaluations
  FOR SELECT
  USING (true);

-- ✅ LISTO: Verify policies
SELECT 
  schemaname, tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('courses', 'profiles', 'lessons', 'evaluations')
ORDER BY tablename, policyname;
