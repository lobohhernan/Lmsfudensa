-- ===============================================
-- MIGRACIÓN: Crear tabla enrollments
-- ===============================================
-- Fecha: 14 Enero 2025
-- Propósito: Registrar inscripciones de usuarios en cursos
-- ===============================================

-- ============================================
-- PASO 1: CREAR TABLA ENROLLMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_course UNIQUE(user_id, course_id)
);

-- ============================================
-- PASO 2: ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON public.enrollments(completed);

-- ============================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "enrollments_read_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_read_instructor" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_system" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;

-- 1. Usuarios pueden VER SUS PROPIAS inscripciones
CREATE POLICY "enrollments_read_own" 
ON public.enrollments 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- 2. Instructores pueden VER inscripciones en SUS CURSOS
CREATE POLICY "enrollments_read_instructor" 
ON public.enrollments 
FOR SELECT 
USING (
  course_id IN (
    SELECT id FROM public.courses WHERE instructor_id = auth.uid()
  )
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Sistema puede INSERTAR inscripciones (webhook, backend)
CREATE POLICY "enrollments_insert_system" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (true);

-- 4. Usuarios pueden UPDATE su propia inscripción (solo completed)
CREATE POLICY "enrollments_update_own" 
ON public.enrollments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PASO 5: TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enrollments_updated_at ON public.enrollments;

CREATE TRIGGER trigger_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollments_updated_at();

-- ============================================
-- PASO 6: COMENTARIOS (DOCUMENTACIÓN)
-- ============================================

COMMENT ON TABLE public.enrollments IS 'Inscripciones de usuarios en cursos';
COMMENT ON COLUMN public.enrollments.user_id IS 'ID del usuario (referencia a auth.users)';
COMMENT ON COLUMN public.enrollments.course_id IS 'ID del curso';
COMMENT ON COLUMN public.enrollments.enrolled_at IS 'Fecha y hora de inscripción';
COMMENT ON COLUMN public.enrollments.completed IS 'Si el usuario completó el curso';
COMMENT ON COLUMN public.enrollments.completed_at IS 'Fecha y hora de completación';

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
  tablename,
  schemaname,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'enrollments';
