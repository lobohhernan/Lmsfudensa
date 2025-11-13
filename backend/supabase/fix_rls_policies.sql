-- ARREGLAR POLÍTICAS RLS PARA PERMITIR REGISTRO DE USUARIOS

-- 1. Desactivar RLS temporalmente para hacer cambios
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 3. Reactivar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. NUEVA POLÍTICA - Permitir que usuarios anónimos se registren
CREATE POLICY "Allow registration - insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. NUEVA POLÍTICA - Ver el propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

-- 6. NUEVA POLÍTICA - Actualizar el propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR role = 'admin')
  WITH CHECK (auth.uid() = id OR role = 'admin');

-- 7. NUEVA POLÍTICA - Admin puede ver todos
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 8. Permitir lectura pública de cursos (catálogo)
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;

CREATE POLICY "Public can view courses"
  ON public.courses
  FOR SELECT
  USING (true);

-- 9. Verificar que las políticas se crearon
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'courses');
