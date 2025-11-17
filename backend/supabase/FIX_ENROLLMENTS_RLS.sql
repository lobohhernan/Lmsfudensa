-- ===============================================
-- FIX: PERMITIR QUE USUARIOS SE INSCRIBAN EN CURSOS
-- ===============================================
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 17 Nov 2025
-- Problema: Error 403 Forbidden al intentar inscribirse
-- Solución: Agregar política para INSERT de enrollments
-- ===============================================

-- ============================================
-- TABLA: enrollments (Inscripciones)
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "enrollments_read_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all" ON enrollments;

-- 1. Usuario puede VER sus propias inscripciones
CREATE POLICY "enrollments_read_own" 
ON enrollments 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- 2. ✅ NUEVO: Usuario puede INSCRIBIRSE (INSERT) en cualquier curso
CREATE POLICY "enrollments_insert_own" 
ON enrollments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id  -- Solo puede inscribirse a sí mismo
);

-- 3. Admin puede hacer TODO (insert, update, delete para cualquier usuario)
CREATE POLICY "enrollments_admin_all" 
ON enrollments 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver políticas de enrollments
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'enrollments'
ORDER BY policyname;

-- Test como usuario normal (debe permitir INSERT)
-- INSERT INTO enrollments (user_id, course_id) VALUES (auth.uid(), '<course_id>');

-- ============================================
-- EXPLICACIÓN
-- ============================================
--
-- ANTES:
--   ❌ Solo admins podían hacer INSERT en enrollments
--   ❌ Usuarios normales recibían error 403 Forbidden
--
-- DESPUÉS:
--   ✅ Usuarios autenticados pueden inscribirse (INSERT)
--   ✅ Solo pueden inscribirse a sí mismos (auth.uid() = user_id)
--   ✅ No pueden inscribir a otros usuarios
--   ✅ Admins siguen teniendo control total
--
-- ============================================
