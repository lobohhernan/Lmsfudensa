-- ========================================
-- CORRECCIÓN: Permitir acceso al AdminPanel sin autenticación
-- ========================================
-- Problema: AdminPanel no puede cargar usuarios/cursos porque las políticas RLS
-- requieren auth.uid() que es NULL cuando no hay sesión autenticada.
--
-- Solución: Agregar políticas que permitan SELECT público para administradores
-- o modificar las políticas existentes para permitir acceso anónimo controlado.
--
-- OPCIÓN A: Permitir SELECT público (MENOS SEGURO, solo para desarrollo)
-- OPCIÓN B: Crear un endpoint backend con service_role_key (RECOMENDADO)
--
-- Este script implementa OPCIÓN A para desbloquear el AdminPanel rápidamente.
-- Para producción, implementa OPCIÓN B.
-- ========================================

-- ========================================
-- PASO 1: Agregar política de lectura pública para profiles
-- ========================================

-- Eliminar política restrictiva existente si existe
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable select own profile" ON public.profiles;

-- Crear política que permite lectura pública (solo para AdminPanel)
-- ADVERTENCIA: Esto expone los datos de perfil públicamente
-- Solo usar en desarrollo o con datos no sensibles
CREATE POLICY "Public read access for admin dashboard"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Mantener restricciones para INSERT/UPDATE/DELETE
-- Solo usuarios autenticados pueden modificar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ========================================
-- PASO 2: Verificar que courses ya tiene acceso público
-- ========================================

-- La tabla courses ya debería tener esta política desde 20241108_enhance_schema.sql
-- Verificar y recrear si es necesario
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view lessons from published courses" ON public.lessons;

CREATE POLICY "Public can view all courses"
  ON public.courses
  FOR SELECT
  USING (true);

-- Permitir lectura pública de lecciones también
CREATE POLICY "Public can view lessons"
  ON public.lessons
  FOR SELECT
  USING (true);

-- ========================================
-- PASO 3: Mantener políticas de escritura restrictivas
-- ========================================

-- Solo instructores/admins pueden crear cursos
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses"
  ON public.courses
  FOR INSERT
  WITH CHECK (
    auth.uid() = instructor_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Solo instructores/admins pueden actualizar sus cursos
DROP POLICY IF EXISTS "Instructors can update their courses" ON public.courses;
CREATE POLICY "Instructors can update their courses"
  ON public.courses
  FOR UPDATE
  USING (
    auth.uid() = instructor_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Solo admins pueden eliminar cursos
DROP POLICY IF EXISTS "Only admins can delete courses" ON public.courses;
CREATE POLICY "Only admins can delete courses"
  ON public.courses
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========================================
-- PASO 4: VERIFICACIÓN - Ver políticas activas
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'courses', 'lessons')
ORDER BY tablename, policyname;

-- ========================================
-- PASO 5: Verificar que RLS está habilitado
-- ========================================

SELECT 
  n.nspname AS schema,
  c.relname AS table,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('profiles', 'courses', 'lessons')
  AND n.nspname = 'public';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 
-- ⚠️ SEGURIDAD: Esta configuración permite lectura pública de profiles y courses
-- 
-- Para PRODUCCIÓN, implementa en su lugar:
-- 1. Crear un Supabase Edge Function que use service_role_key
-- 2. Llamar a esa función desde AdminPanel en lugar de consultas directas
-- 3. La función validará credenciales de admin antes de retornar datos
-- 
-- Ejemplo de Edge Function:
-- ```typescript
-- import { createClient } from '@supabase/supabase-js'
-- 
-- export default async (req: Request) => {
--   const supabase = createClient(
--     Deno.env.get('SUPABASE_URL')!,
--     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Clave secreta
--   )
--   
--   // Validar que el usuario es admin
--   const authHeader = req.headers.get('Authorization')
--   const token = authHeader?.replace('Bearer ', '')
--   const { data: user } = await supabase.auth.getUser(token)
--   
--   if (!user || user.user.role !== 'admin') {
--     return new Response('Forbidden', { status: 403 })
--   }
--   
--   // Consultar datos con service_role (bypass RLS)
--   const { data, error } = await supabase.from('profiles').select('*')
--   return new Response(JSON.stringify(data), {
--     headers: { 'Content-Type': 'application/json' }
--   })
-- }
-- ```
-- 
-- ========================================
