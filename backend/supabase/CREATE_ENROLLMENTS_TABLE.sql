-- =====================================================================
-- TABLA DE INSCRIPCIONES (ENROLLMENTS)
-- =====================================================================
-- Descripción: Gestiona las inscripciones de usuarios a cursos
-- Autor: Sistema LMS FUDENSA
-- Fecha: 2024-11-15
-- =====================================================================

-- Crear tabla de inscripciones
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT false,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un usuario solo puede estar inscrito una vez por curso
  UNIQUE(user_id, course_id)
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON public.enrollments(completed) WHERE completed = true;

-- =====================================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop políticas previas si existen (idempotencia)
DROP POLICY IF EXISTS "enrollments_select_public" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_own" ON public.enrollments;

-- 1. Lectura pública (verificar inscripción)
-- Permite que cualquier usuario verifique si alguien está inscrito
CREATE POLICY "enrollments_select_public"
  ON public.enrollments
  FOR SELECT
  USING (true);

-- 2. Inserción: solo el propio usuario puede inscribirse
-- Previene que un usuario inscriba a otro sin autorización
CREATE POLICY "enrollments_insert_own"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Actualización: solo el propio usuario puede modificar su inscripción
-- Permite marcar como completado, actualizar last_accessed_at, etc.
CREATE POLICY "enrollments_update_own"
  ON public.enrollments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Eliminación: solo el propio usuario (o admin) puede darse de baja
CREATE POLICY "enrollments_delete_own"
  ON public.enrollments
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================================
-- COMENTARIOS (Documentación en BD)
-- =====================================================================

COMMENT ON TABLE public.enrollments IS 'Inscripciones de usuarios a cursos. Controla el acceso a lecciones y emisión de certificados.';
COMMENT ON COLUMN public.enrollments.user_id IS 'Usuario inscrito (referencia a auth.users)';
COMMENT ON COLUMN public.enrollments.course_id IS 'Curso al que está inscrito';
COMMENT ON COLUMN public.enrollments.enrolled_at IS 'Fecha y hora de inscripción';
COMMENT ON COLUMN public.enrollments.completed IS 'Si el usuario completó el curso (aprobó evaluación)';
COMMENT ON COLUMN public.enrollments.completed_at IS 'Fecha y hora de finalización del curso';
COMMENT ON COLUMN public.enrollments.certificate_issued IS 'Si se emitió certificado para este enrollment';
COMMENT ON COLUMN public.enrollments.last_accessed_at IS 'Última vez que el usuario accedió al curso';

-- =====================================================================
-- FUNCIÓN: Actualizar last_accessed_at automáticamente
-- =====================================================================

CREATE OR REPLACE FUNCTION update_enrollment_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: actualiza last_accessed_at en cada UPDATE
DROP TRIGGER IF EXISTS update_enrollment_timestamp ON public.enrollments;
CREATE TRIGGER update_enrollment_timestamp
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_last_accessed();

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================

-- Mostrar estado de la tabla
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla enrollments creada correctamente';
  RAISE NOTICE 'Verificando RLS y políticas...';
END
$$;

-- Verificar RLS activo
SELECT 
  CASE 
    WHEN relrowsecurity THEN '✅ RLS ENABLED' 
    ELSE '❌ RLS DISABLED' 
  END AS rls_status
FROM pg_class
WHERE relname = 'enrollments' AND relnamespace = 'public'::regnamespace;

-- Listar políticas activas
SELECT 
  policyname AS policy_name,
  cmd AS operation,
  CASE roles::text[]
    WHEN '{public}' THEN 'PUBLIC'
    ELSE roles::text
  END AS roles
FROM pg_policies
WHERE tablename = 'enrollments'
ORDER BY policyname;
