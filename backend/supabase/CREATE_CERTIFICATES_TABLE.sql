-- =====================================================
-- Tabla: certificates
-- Descripción: Almacena certificados emitidos a estudiantes
-- =====================================================

-- Crear tabla certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencias
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- Información del certificado
  hash VARCHAR(255) NOT NULL UNIQUE, -- Hash único para verificación pública
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  
  -- Almacenamiento
  pdf_url TEXT, -- URL del PDF del certificado (puede ser Supabase Storage, S3, etc.)
  pdf_generated BOOLEAN DEFAULT false,
  
  -- Datos del certificado (para regeneración)
  student_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  completion_date DATE,
  grade DECIMAL(5, 2), -- Nota final (0-100)
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos extra: instructor, duración, etc.
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  voided_at TIMESTAMPTZ, -- Fecha de revocación (si aplica)
  voided_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'voided', 'expired')),
  CONSTRAINT valid_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100))
);

-- =====================================================
-- Índices para optimización de consultas
-- =====================================================

-- Índice para búsquedas por estudiante
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);

-- Índice para búsquedas por curso
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);

-- Índice para búsquedas por hash (verificación pública)
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON public.certificates(hash);

-- Índice para filtrado por estado
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- Índice para ordenamiento por fecha de emisión
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON public.certificates(issue_date DESC);

-- Índice compuesto para consultas frecuentes (estudiante + estado)
CREATE INDEX IF NOT EXISTS idx_certificates_student_status ON public.certificates(student_id, status);

-- =====================================================
-- Trigger para updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- =====================================================
-- Función para generar hash único
-- =====================================================

CREATE OR REPLACE FUNCTION generate_certificate_hash()
RETURNS TEXT AS $$
DECLARE
  hash_value TEXT;
  hash_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar hash usando md5 con timestamp + random
    hash_value := encode(digest(now()::text || random()::text, 'sha256'), 'hex');
    
    -- Verificar si el hash ya existe
    SELECT EXISTS(SELECT 1 FROM public.certificates WHERE hash = hash_value) INTO hash_exists;
    
    -- Si no existe, salir del loop
    EXIT WHEN NOT hash_exists;
  END LOOP;
  
  RETURN hash_value;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Los estudiantes pueden ver solo sus propios certificados
CREATE POLICY "Students can view their own certificates"
  ON public.certificates
  FOR SELECT
  USING (auth.uid() = student_id);

-- Policy: Cualquier usuario autenticado puede verificar certificados por hash
-- (para verificación pública se debe crear un endpoint sin auth)
CREATE POLICY "Anyone can verify certificates by hash"
  ON public.certificates
  FOR SELECT
  USING (true); -- Permitir lectura pública; ajustar según requerimientos de seguridad

-- Policy: Solo admins pueden insertar certificados
CREATE POLICY "Admins can insert certificates"
  ON public.certificates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Policy: Solo admins pueden actualizar certificados
CREATE POLICY "Admins can update certificates"
  ON public.certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Policy: Solo admins pueden eliminar/revocar certificados
CREATE POLICY "Admins can delete certificates"
  ON public.certificates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- Comentarios sobre campos clave
-- =====================================================

COMMENT ON TABLE public.certificates IS 'Almacena certificados emitidos a estudiantes por completar cursos';
COMMENT ON COLUMN public.certificates.hash IS 'Hash único para verificación pública del certificado (SHA256)';
COMMENT ON COLUMN public.certificates.status IS 'Estados: active (activo), voided (revocado), expired (expirado)';
COMMENT ON COLUMN public.certificates.pdf_url IS 'URL del PDF del certificado almacenado (Supabase Storage, S3, etc.)';
COMMENT ON COLUMN public.certificates.metadata IS 'JSON con datos adicionales: instructor, horas de curso, fecha de finalización, etc.';
COMMENT ON COLUMN public.certificates.grade IS 'Nota final del estudiante (0-100), si aplica';
COMMENT ON COLUMN public.certificates.voided_at IS 'Fecha en que el certificado fue revocado (si aplica)';

-- =====================================================
-- Vista para verificación pública (OPCIONAL)
-- =====================================================

-- IMPORTANTE: La creación de una `VIEW` que actúe con permisos elevados
-- (SECURITY DEFINER) puede saltarse las políticas RLS y generar alertas
-- de seguridad en Supabase. Para evitar esto, NO creamos aquí la vista
-- pública insegura. En su lugar se recomienda:
--  - Implementar una Edge Function/endpoint que use la `service_role`
--    para consultar sólo los campos públicos y devolverlos al cliente,
--    o
--  - Crear una MATERIALIZED VIEW con sólo los campos públicos y
--    controlar su `REFRESH` desde un proceso seguro.

-- Si necesitas la materialized view rápidamente, pega y ejecuta el SQL
-- en el SQL Editor de Supabase (ejemplo más abajo en el repo).

-- =====================================================
-- Datos de ejemplo (OPCIONAL - comentar en producción)
-- =====================================================

-- Ejemplo de inserción (descomentar para testing):
-- INSERT INTO public.certificates (
--   student_id, 
--   course_id, 
--   hash, 
--   student_name, 
--   course_title, 
--   completion_date, 
--   grade, 
--   pdf_url, 
--   pdf_generated
-- )
-- VALUES (
--   (SELECT id FROM public.profiles WHERE role = 'student' LIMIT 1),
--   (SELECT id FROM public.courses LIMIT 1),
--   generate_certificate_hash(),
--   'Juan Pérez',
--   'RCP Básico',
--   CURRENT_DATE,
--   95.5,
--   'https://example.com/certificates/cert-123.pdf',
--   true
-- );
