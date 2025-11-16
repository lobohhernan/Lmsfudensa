-- ===============================================
-- POLÍTICAS RLS SIMPLIFICADAS PARA PROYECTO PEQUEÑO
-- ===============================================
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 16 Nov 2025
-- Propósito: Seguridad básica sin complicaciones
-- ===============================================

-- ============================================
-- TABLA: courses (Cursos)
-- ============================================
-- Seguridad: Lectura pública, solo admins escriben

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "courses_admin_all" ON courses;

-- 1. Lectura PÚBLICA (todos pueden ver cursos)
CREATE POLICY "courses_public_read" 
ON courses 
FOR SELECT 
USING (true);

-- 2. Admin puede hacer TODO (insert, update, delete)
CREATE POLICY "courses_admin_all" 
ON courses 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- TABLA: lessons (Lecciones)
-- ============================================
-- Seguridad: Lectura pública, solo admins escriben

DROP POLICY IF EXISTS "lessons_public_read" ON lessons;
DROP POLICY IF EXISTS "lessons_admin_all" ON lessons;

CREATE POLICY "lessons_public_read" 
ON lessons 
FOR SELECT 
USING (true);

CREATE POLICY "lessons_admin_all" 
ON lessons 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- TABLA: teachers (Profesores)
-- ============================================
-- Seguridad: Lectura pública, solo admins escriben

DROP POLICY IF EXISTS "teachers_public_read" ON teachers;
DROP POLICY IF EXISTS "teachers_admin_all" ON teachers;

CREATE POLICY "teachers_public_read" 
ON teachers 
FOR SELECT 
USING (true);

CREATE POLICY "teachers_admin_all" 
ON teachers 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- TABLA: profiles (Perfiles de usuarios)
-- ============================================
-- Seguridad: Usuarios ven su perfil, admins ven todo

DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

-- Usuarios autenticados ven su propio perfil
CREATE POLICY "profiles_read_own" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- Admins pueden hacer todo
CREATE POLICY "profiles_admin_all" 
ON profiles 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- TABLA: enrollments (Inscripciones)
-- ============================================
-- Seguridad: Usuario ve sus inscripciones, admin ve todo

DROP POLICY IF EXISTS "enrollments_read_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all" ON enrollments;

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
-- TABLA: certificates (Certificados)
-- ============================================
-- Seguridad: Verificación pública, usuario ve los suyos

DROP POLICY IF EXISTS "certificates_public_verify" ON certificates;
DROP POLICY IF EXISTS "certificates_read_own" ON certificates;
DROP POLICY IF EXISTS "certificates_admin_all" ON certificates;

-- Cualquiera puede verificar certificados (con hash)
CREATE POLICY "certificates_public_verify" 
ON certificates 
FOR SELECT 
USING (true);

-- Admins pueden hacer todo
CREATE POLICY "certificates_admin_all" 
ON certificates 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test sin autenticación (debe funcionar)
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_lessons FROM lessons;
SELECT COUNT(*) as total_teachers FROM teachers;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Lectura pública = Cualquiera puede ver cursos
-- 2. Solo admins escriben = Protege datos
-- 3. Usuarios ven solo sus datos personales
-- 4. Certificados públicos = Verificación funciona
-- 
-- Para agregar más admins, edita el array:
--   'admin@fudensa.com',
--   'nuevo-admin@fudensa.com'
-- 
-- ============================================
