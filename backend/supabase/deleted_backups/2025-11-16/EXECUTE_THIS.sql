-- BACKUP of original file: EXECUTE_THIS.sql
-- Backed up on 2025-11-16 before deletion

-- =============================================
-- ⚡ SOLUCIÓN DE EMERGENCIA - EJECUTA ESTO AHORA
-- (backup before deletion)
-- =============================================
-- Este script desactiva completamente RLS en profiles
-- para que puedas registrar usuarios SIN ERRORES

-- PASO 1: Desactivar RLS en la tabla profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas que existan
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- PASO 3: Verificación - Debe mostrar 0 políticas
SELECT 
    COUNT(*) as "Total de políticas (debe ser 0)",
    'Si es 0, estás listo para registrar usuarios' as "Estado"
FROM pg_policies 
WHERE tablename = 'profiles';

-- PASO 4: Verificación - Debe mostrar RLS = false
SELECT 
    tablename as "Tabla",
    CASE 
        WHEN rowsecurity = false THEN 'RLS Desactivado - OK'
        ELSE 'RLS Activado - ERROR'
    END as "Estado"
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- ... (rest of original file omitted for brevity in backup file)
