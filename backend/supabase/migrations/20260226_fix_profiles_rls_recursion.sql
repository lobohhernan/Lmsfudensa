-- ══════════════════════════════════════════════════════════════════
-- CORRECCIÓN: Recursión infinita en policy SELECT de profiles
-- ══════════════════════════════════════════════════════════════════
-- La policy anterior tenía:
--   auth.uid() IN (SELECT id FROM profiles p2 WHERE p2.role = 'admin')
-- Eso consulta la tabla profiles DENTRO de su propia policy → recursión → 500.
--
-- Solución: cada usuario solo puede leer SU PROPIO perfil.
-- El rol admin para administrar la plataforma se gestiona en el código,
-- no hace falta que un admin vea los perfiles de otros via RLS básico.
-- ══════════════════════════════════════════════════════════════════

-- 1. Reemplazar policy SELECT con versión sin recursión
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);


-- 2. Asegurar que UPDATE también funciona (sin recursión)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 3. Asegurar INSERT
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 4. Asegurar que authenticated puede hacer SELECT, INSERT, UPDATE
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;


-- 5. Verificar que no hay policies problemáticas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
