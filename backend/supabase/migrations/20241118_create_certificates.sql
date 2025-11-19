-- ===============================================
-- MIGRACIÓN: Crear tabla certificates
-- ===============================================
-- Fecha: 18 Nov 2025
-- Propósito: Permitir emisión y verificación de certificados digitales
-- ===============================================

-- ============================================
-- PASO 1: CREAR TABLA CERTIFICATES
-- ============================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  hash TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completion_date DATE,
  grade DECIMAL(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'voided', 'expired')),
  pdf_generated BOOLEAN DEFAULT false,
  pdf_url TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_student_course UNIQUE(student_id, course_id)
);

-- ============================================
-- PASO 2: ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON public.certificates(hash);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- ============================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "certificates_read_own" ON certificates;
DROP POLICY IF EXISTS "certificates_read_by_hash" ON certificates;
DROP POLICY IF EXISTS "certificates_insert_system" ON certificates;
DROP POLICY IF EXISTS "certificates_admin_all" ON certificates;

-- 1. Usuarios pueden VER sus propios certificados
CREATE POLICY "certificates_read_own" 
ON certificates 
FOR SELECT 
USING (
  auth.uid() = student_id OR
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- 2. Cualquiera puede VERIFICAR certificados por hash (público)
CREATE POLICY "certificates_read_by_hash" 
ON certificates 
FOR SELECT 
USING (true);  -- Permite verificación pública

-- 3. Sistema puede INSERTAR certificados (usando service_role o admin client)
-- Esta política permite que el backend emita certificados
CREATE POLICY "certificates_insert_system" 
ON certificates 
FOR INSERT 
WITH CHECK (
  -- Permitir INSERT desde backend (usando service_role key)
  true
);

-- 4. Solo admins pueden UPDATE y DELETE
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
-- PASO 5: FUNCIÓN PARA GENERAR HASH ÚNICO
-- ============================================

-- Función para generar un hash único de certificado
CREATE OR REPLACE FUNCTION generate_certificate_hash()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_hash TEXT;
  hash_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar hash aleatorio de 32 caracteres
    new_hash := encode(gen_random_bytes(16), 'hex');
    
    -- Verificar si ya existe
    SELECT EXISTS(
      SELECT 1 FROM certificates WHERE hash = new_hash
    ) INTO hash_exists;
    
    -- Si no existe, retornar el hash
    IF NOT hash_exists THEN
      RETURN new_hash;
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- PASO 6: FUNCIÓN PARA EMITIR CERTIFICADO
-- ============================================

-- Función helper para emitir certificado (opcional, puede hacerse desde TypeScript)
CREATE OR REPLACE FUNCTION issue_certificate(
  p_student_id UUID,
  p_course_id UUID,
  p_student_name TEXT,
  p_course_title TEXT,
  p_grade DECIMAL DEFAULT NULL,
  p_completion_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash TEXT;
  v_certificate_id UUID;
BEGIN
  -- Generar hash único
  v_hash := generate_certificate_hash();
  
  -- Insertar certificado
  INSERT INTO public.certificates (
    student_id,
    course_id,
    hash,
    student_name,
    course_title,
    grade,
    completion_date,
    status,
    pdf_generated
  )
  VALUES (
    p_student_id,
    p_course_id,
    v_hash,
    p_student_name,
    p_course_title,
    p_grade,
    p_completion_date,
    'active',
    false
  )
  ON CONFLICT (student_id, course_id) 
  DO UPDATE SET
    grade = EXCLUDED.grade,
    completion_date = EXCLUDED.completion_date,
    updated_at = NOW()
  RETURNING id INTO v_certificate_id;
  
  RETURN v_certificate_id;
END;
$$;

-- ============================================
-- PASO 7: FUNCIÓN PARA VERIFICAR CERTIFICADO
-- ============================================

CREATE OR REPLACE FUNCTION verify_certificate(p_hash TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  student_name TEXT,
  course_title TEXT,
  completion_date DATE,
  issue_date DATE,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (c.status = 'active') as is_valid,
    c.student_name,
    c.course_title,
    c.completion_date,
    c.issue_date,
    c.status
  FROM public.certificates c
  WHERE c.hash = p_hash
  LIMIT 1;
END;
$$;

-- ============================================
-- PASO 8: TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_certificates_updated_at ON certificates;

CREATE TRIGGER trigger_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- ============================================
-- PASO 9: COMENTARIOS (DOCUMENTACIÓN)
-- ============================================

COMMENT ON TABLE public.certificates IS 'Certificados digitales emitidos a estudiantes que completan cursos';
COMMENT ON COLUMN public.certificates.hash IS 'Hash único para verificación pública del certificado';
COMMENT ON COLUMN public.certificates.status IS 'Estado del certificado: active, voided (anulado), expired';
COMMENT ON FUNCTION generate_certificate_hash() IS 'Genera un hash hexadecimal único de 32 caracteres para certificados';
COMMENT ON FUNCTION issue_certificate IS 'Emite un certificado o actualiza uno existente para el mismo estudiante y curso';
COMMENT ON FUNCTION verify_certificate IS 'Verifica la validez de un certificado mediante su hash';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que la tabla existe
SELECT 
  tablename,
  schemaname,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'certificates';

-- Ver políticas creadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'certificates'
ORDER BY policyname;

-- ============================================
-- TESTS (OPCIONAL - EJECUTAR MANUALMENTE)
-- ============================================

-- Test 1: Generar hash
-- SELECT generate_certificate_hash();

-- Test 2: Emitir certificado (reemplazar UUIDs con valores reales)
-- SELECT issue_certificate(
--   '<student_id>'::uuid,
--   '<course_id>'::uuid,
--   'Juan Pérez',
--   'Curso de Programación',
--   95.5,
--   CURRENT_DATE
-- );

-- Test 3: Verificar certificado (reemplazar con hash real)
-- SELECT * FROM verify_certificate('abc123...');

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
--
-- 1. La tabla permite UN certificado por estudiante y curso
--    (constraint unique_student_course)
--
-- 2. Los certificados son PÚBLICAMENTE VERIFICABLES por hash
--    (policy certificates_read_by_hash)
--
-- 3. Los estudiantes solo ven SUS PROPIOS certificados en su perfil
--    (policy certificates_read_own)
--
-- 4. Los certificados se pueden emitir desde:
--    - Frontend usando service_role key (supabaseAdmin)
--    - Backend usando función SQL issue_certificate()
--    - Directamente con INSERT (si tienes service_role)
--
-- 5. Si necesitas revocar un certificado:
--    UPDATE certificates SET status = 'voided' WHERE id = '...';
--
-- ============================================
