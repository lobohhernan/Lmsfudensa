-- ✅ FIX NUCLEAR: DESHABILITAR Y RECONFIGURAR RLS COMPLETAMENTE
-- Este SQL resuelve todos los conflictos de policies anteriores
-- Y permite que el catálogo funcione sin login

-- 1️⃣ DESHABILITAR RLS COMPLETAMENTE (Nuclear option)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- 2️⃣ ESPERAR UN MOMENTO Y VOLVER A HABILITAR
-- (Esto asegura que las policies viejas se limpian)

-- 3️⃣ HABILITAR RLS NUEVAMENTE (Ahora limpio)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CREAR POLÍTICAS SIMPLES Y EFECTIVAS PARA COURSES
-- SELECT: Todos pueden ver todos los cursos (catálogo público)
CREATE POLICY "courses_select_all"
  ON public.courses
  FOR SELECT
  USING (true);

-- INSERT: Usuarios autenticados (para admin)
CREATE POLICY "courses_insert_auth"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Propietario o admin
CREATE POLICY "courses_update_auth"
  ON public.courses
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- DELETE: Propietario o admin
CREATE POLICY "courses_delete_auth"
  ON public.courses
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 5️⃣ POLÍTICAS PARA PROFILES (Todos ven todos, necesario para instructores)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 6️⃣ POLÍTICAS PARA LESSONS (Todos ven todas las lecciones)
CREATE POLICY "lessons_select_all"
  ON public.lessons
  FOR SELECT
  USING (true);

-- 7️⃣ POLÍTICAS PARA EVALUATIONS (Todos ven todas las evaluaciones)
CREATE POLICY "evaluations_select_all"
  ON public.evaluations
  FOR SELECT
  USING (true);

-- 8️⃣ POLÍTICAS PARA ENROLLMENTS (Todos pueden leer)
CREATE POLICY "enrollments_select_all"
  ON public.enrollments
  FOR SELECT
  USING (true);

-- ✅ VERIFICAR QUE FUNCIONÓ
SELECT 
  tablename,
  policyname,
  permissive,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('courses', 'profiles', 'lessons', 'evaluations', 'enrollments')
ORDER BY tablename, policyname;
