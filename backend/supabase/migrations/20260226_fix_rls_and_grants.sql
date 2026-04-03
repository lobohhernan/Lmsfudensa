-- ============================================================
-- MIGRACIÓN: Corregir RLS y permisos en courses y profiles
-- Fecha: 2026-02-26
-- Problema: cursos no visibles para usuarios anónimos (anon)
-- ============================================================

-- ── 1. COURSES: permitir SELECT público (anon + authenticated) ──

-- Asegurarse que RLS está habilitado
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Eliminar policies previas si existen (para re-crearlas limpias)
DROP POLICY IF EXISTS "public_courses_select" ON courses;
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "Cursos públicos para todos" ON courses;
DROP POLICY IF EXISTS "Allow public read access for courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "courses_select_public" ON courses;

-- Política: cualquier persona (anon o authenticated) puede VER todos los cursos
CREATE POLICY "courses_select_public"
  ON courses FOR SELECT
  USING (true);

-- Política: solo instructores y admins pueden INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "courses_insert_instructor_admin" ON courses;
CREATE POLICY "courses_insert_instructor_admin"
  ON courses FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
  );

DROP POLICY IF EXISTS "courses_update_instructor_admin" ON courses;
CREATE POLICY "courses_update_instructor_admin"
  ON courses FOR UPDATE
  USING (
    auth.uid() = instructor_id
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "courses_delete_admin" ON courses;
CREATE POLICY "courses_delete_admin"
  ON courses FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ── 2. GRANT de permisos al rol anon y authenticated ──
-- Sin estos GRANTs, Postgres bloquea el acceso aunque haya policies

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON courses TO anon;
GRANT SELECT ON courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON courses TO authenticated;

-- ── 3. PROFILES: asegurar que el INSERT y SELECT funcionan ──

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ver perfil propio (o admin ve todos)
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR auth.uid() IN (
      SELECT id FROM profiles p2 WHERE p2.role = 'admin'
    )
  );

-- Insertar perfil propio
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Actualizar perfil propio
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permisos a authenticated
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- ── 4. VERIFICAR: listar policies creadas ──
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('courses', 'profiles')
ORDER BY tablename, policyname;
