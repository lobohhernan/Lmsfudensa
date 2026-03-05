-- ══════════════════════════════════════════════════════════════════
-- CORRECCIÓN FINAL: Recursión infinita en policies de profiles
-- Fecha: 2026-03-02
--
-- Problema raíz:
--   20260226_fix_rls_and_grants.sql (corre DESPUÉS por orden alfabético)
--   re-crea la policy "profiles_select_own_or_admin" con:
--     auth.uid() IN (SELECT id FROM profiles p2 WHERE p2.role = 'admin')
--   Eso consulta profiles DENTRO de su propia policy SELECT → recursión → 500.
--
-- Solución:
--   1. Crear función is_admin() con SECURITY DEFINER (bypassea RLS, sin recursión)
--   2. Eliminar TODAS las policies SELECT de profiles
--   3. Crear UNA SOLA policy SELECT que usa is_admin() para admins
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Función helper: is_admin() ──
-- SECURITY DEFINER = corre como el dueño de la función (postgres),
-- bypaseando RLS → no hay recursión al consultar profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Permitir que authenticated invoque la función
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;


-- ── 2. Eliminar TODAS las policies SELECT que existen (recursivas o no) ──
DROP POLICY IF EXISTS "profiles_select_own"            ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin"   ON profiles;
-- por si existen con otros nombres de migraciones anteriores:
DROP POLICY IF EXISTS "Users can view own profile"     ON profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;


-- ── 3. Policy SELECT definitiva (sin recursión) ──
-- Cada usuario ve su propio perfil; un admin ve todos.
CREATE POLICY "profiles_select_own_or_admin"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );


-- ── 4. Asegurar INSERT / UPDATE sin recursión ──
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());


-- ── 5. Asegurar permisos de rol ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;


-- ── 6. Verificar resultado ──
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
