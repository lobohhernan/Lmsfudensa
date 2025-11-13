-- ========================================
-- ARREGLAR POLÍTICAS RLS PARA AUTENTICACIÓN
-- ========================================
-- Este script arregla todos los problemas de autenticación
-- Errores 409 al registrar usuarios

-- 1. Desactivar RLS temporalmente para hacer cambios
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas antiguas
DROP POLICY IF EXISTS "Allow registration - insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to register" ON public.profiles;

-- 3. Reactivar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- NUEVAS POLÍTICAS - SIN CONFLICTOS
-- ========================================

-- POLÍTICA 1: INSERT - Usuarios autenticados pueden crear su propio perfil
CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- POLÍTICA 2: INSERT - Permitir a cualquiera (anon o auth) crear perfil con su ID
CREATE POLICY "Enable insert during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- POLÍTICA 3: SELECT - Cada usuario ve su propio perfil
CREATE POLICY "Enable select own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- POLÍTICA 4: UPDATE - Cada usuario puede actualizar su propio perfil
CREATE POLICY "Enable update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- POLÍTICA 5: DELETE - Cada usuario puede borrar su propio perfil
CREATE POLICY "Enable delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver todas las políticas creadas
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Ver el estado de RLS
SELECT tablename, rowsecurity 
FROM pg_class 
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid 
WHERE relname = 'profiles';
