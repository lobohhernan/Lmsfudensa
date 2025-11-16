-- =============================================
-- SCRIPT DE VERIFICACIÓN DE SEGURIDAD RLS
-- Valida que todas las políticas RLS estén correctamente configuradas
-- =============================================

-- ========== PARTE 1: VERIFICAR RLS HABILITADO ==========
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    rowsecurity AS "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========== PARTE 2: CONTAR POLÍTICAS POR TABLA ==========
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    COUNT(*) AS "Número de Políticas"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ========== PARTE 3: DETALLE DE POLÍTICAS ==========
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    policyname AS política,
    cmd AS comando,
    qual AS "Condición USING",
    with_check AS "Condición WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========== PARTE 4: VERIFICAR POLICIES EN ENROLLMENTS ==========
-- Debe tener exactamente 4 políticas: select, insert, update, delete
SELECT 
    policyname AS política,
    cmd AS comando,
    roles AS "Aplicable a roles"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'enrollments'
ORDER BY cmd;

-- Verificar UNIQUE constraint en enrollments
SELECT 
    conname AS "Nombre Constraint",
    contype AS "Tipo",
    pg_get_constraintdef(oid) AS "Definición"
FROM pg_constraint
WHERE conrelid = 'public.enrollments'::regclass
ORDER BY contype, conname;

-- ========== PARTE 5: VERIFICAR POLICIES EN COURSES ==========
SELECT 
    policyname AS política,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'courses'
ORDER BY cmd;

-- ========== PARTE 6: VERIFICAR POLICIES EN LESSONS ==========
SELECT 
    policyname AS política,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'lessons'
ORDER BY cmd;

-- ========== PARTE 7: VERIFICAR POLICIES EN PROFILES ==========
SELECT 
    policyname AS política,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY cmd;

-- ========== PARTE 8: VERIFICAR POLICIES EN EVALUATIONS ==========
SELECT 
    policyname AS política,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'evaluations'
ORDER BY cmd;

-- ========== PARTE 9: TEST DE SEGURIDAD - SELECT PÚBLICO ==========
-- Estas consultas deben funcionar sin autenticación (lectura pública)
SELECT COUNT(*) AS "Total Cursos Visibles" FROM courses;
SELECT COUNT(*) AS "Total Lecciones Visibles" FROM lessons;
SELECT COUNT(*) AS "Total Enrollments Visibles" FROM enrollments;

-- ========== PARTE 10: TEST DE SEGURIDAD - INSERT RESTRINGIDO ==========
-- NOTA: Estos tests deben ejecutarse CON autenticación para validar
-- Descomentar solo si estás autenticado y quieres probar

-- Intento de insertar enrollment (debe fallar si no eres el usuario)
/*
INSERT INTO enrollments (user_id, course_id)
VALUES ('00000000-0000-0000-0000-000000000000', 1)
RETURNING *;
*/

-- ========== PARTE 11: VERIFICAR TRIGGERS ==========
SELECT 
    tgname AS "Trigger Name",
    tgrelid::regclass AS "Tabla",
    tgenabled AS "Habilitado",
    pg_get_triggerdef(oid) AS "Definición"
FROM pg_trigger
WHERE tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('enrollments', 'courses', 'lessons', 'profiles')
    AND relnamespace = 'public'::regnamespace
)
ORDER BY tgrelid, tgname;

-- ========== PARTE 12: VERIFICAR ÍNDICES EN ENROLLMENTS ==========
SELECT 
    indexname AS "Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'enrollments'
ORDER BY indexname;

-- ========== PARTE 13: RESUMEN DE SEGURIDAD ==========
SELECT 
    'enrollments' AS tabla,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='enrollments') AS "RLS",
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='enrollments') AS "Policies",
    (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public.enrollments'::regclass AND contype='u') AS "UNIQUE Constraints",
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND tablename='enrollments') AS "Índices"
UNION ALL
SELECT 
    'courses' AS tabla,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='courses'),
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='courses'),
    (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public.courses'::regclass AND contype='u'),
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND tablename='courses')
UNION ALL
SELECT 
    'lessons' AS tabla,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='lessons'),
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='lessons'),
    (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public.lessons'::regclass AND contype='u'),
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND tablename='lessons')
UNION ALL
SELECT 
    'profiles' AS tabla,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='profiles'),
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='profiles'),
    (SELECT COUNT(*) FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND contype='u'),
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND tablename='profiles')
ORDER BY tabla;

-- ========== CHECKLIST DE SEGURIDAD ==========
/*
✅ VALIDACIONES ESPERADAS:

1. ENROLLMENTS:
   - RLS: true
   - Políticas: 4 (select, insert, update, delete)
   - UNIQUE constraint en (user_id, course_id)
   - Índices en user_id y course_id
   - Trigger para last_accessed_at

2. COURSES:
   - RLS: true
   - Políticas: mínimo 2 (select público, insert/update restringido)

3. LESSONS:
   - RLS: true
   - Políticas: mínimo 2 (select público, insert/update restringido)

4. PROFILES:
   - RLS: true
   - Políticas: mínimo 2 (select público, update propio)

5. EVALUATIONS:
   - RLS: true
   - Políticas: mínimo 2 (select propio, insert propio)

❌ PROBLEMAS COMUNES:
   - Si RLS = false en alguna tabla → VULNERABLE
   - Si enrollments no tiene UNIQUE constraint → Permite duplicados
   - Si policies < 2 → Posible configuración incompleta
   - Si no hay índices en enrollments → Performance issues

🔒 RECOMENDACIONES:
   1. Ejecutar este script después de cada migración
   2. Validar en ambiente de staging antes de producción
   3. Monitorear logs de Supabase para intentos de acceso denegados
   4. Revisar policies cada 3 meses
*/
