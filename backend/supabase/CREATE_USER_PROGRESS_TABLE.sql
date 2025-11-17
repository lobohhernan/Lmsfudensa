-- ===============================================
-- TABLA: user_progress (Progreso de Lecciones)
-- ===============================================
-- Propósito: Guardar progreso persistente de lecciones completadas
-- Ejecutar DESPUÉS de FIX_ENROLLMENTS_RLS.sql
-- ===============================================

-- ============================================
-- PASO 1: CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un usuario solo puede tener UN registro por lección
  UNIQUE(user_id, course_id, lesson_id)
);

-- ============================================
-- PASO 2: ÍNDICES PARA RENDIMIENTO
-- ============================================

-- Búsqueda rápida por usuario y curso
CREATE INDEX IF NOT EXISTS idx_user_progress_user_course 
ON public.user_progress(user_id, course_id);

-- Búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_user_progress_user 
ON public.user_progress(user_id);

-- Búsqueda por lección
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson 
ON public.user_progress(lesson_id);

-- ============================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "user_progress_read_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_delete_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_admin_all" ON user_progress;

-- 1. Usuario puede VER su propio progreso
CREATE POLICY "user_progress_read_own" 
ON user_progress 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- 2. Usuario puede CREAR (INSERT) su propio progreso
CREATE POLICY "user_progress_insert_own" 
ON user_progress 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Usuario puede ACTUALIZAR su propio progreso
CREATE POLICY "user_progress_update_own" 
ON user_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Usuario puede ELIMINAR su propio progreso
CREATE POLICY "user_progress_delete_own" 
ON user_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Admin puede hacer TODO
CREATE POLICY "user_progress_admin_all" 
ON user_progress 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@fudensa.com',
    'santiago@fudensa.com',
    'hernan@fudensa.com'
  )
);

-- ============================================
-- PASO 5: FUNCIÓN PARA UPSERT (INSERT OR UPDATE)
-- ============================================

-- Función helper para marcar lección como completada
-- Uso: SELECT mark_lesson_complete('<user_id>', '<course_id>', '<lesson_id>');

CREATE OR REPLACE FUNCTION mark_lesson_complete(
  p_user_id UUID,
  p_course_id UUID,
  p_lesson_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_progress (
    user_id,
    course_id,
    lesson_id,
    completed,
    completed_at,
    last_accessed_at
  )
  VALUES (
    p_user_id,
    p_course_id,
    p_lesson_id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, course_id, lesson_id)
  DO UPDATE SET
    completed = true,
    completed_at = NOW(),
    last_accessed_at = NOW(),
    updated_at = NOW();
END;
$$;

-- ============================================
-- PASO 6: VERIFICACIÓN
-- ============================================

-- Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_progress'
ORDER BY policyname;

-- Test: Marcar lección como completada (ejecutar como usuario autenticado)
-- SELECT mark_lesson_complete(auth.uid(), '<course_id>', '<lesson_id>');

-- Ver progreso de un usuario
-- SELECT * FROM user_progress WHERE user_id = auth.uid();

-- ============================================
-- EXPLICACIÓN DEL FLUJO
-- ============================================
--
-- 1. Usuario completa lección en frontend
-- 2. Frontend llama a mark_lesson_complete()
-- 3. Si es la primera vez: INSERT nuevo registro
-- 4. Si ya existe: UPDATE completed_at y last_accessed_at
-- 5. Al recargar página: SELECT user_progress WHERE user_id AND course_id
-- 6. Marcar lecciones como completadas en UI
--
-- BENEFICIOS:
-- ✅ Progreso persiste entre sesiones
-- ✅ Sobrevive a refresh, cerrar navegador, cambiar de dispositivo
-- ✅ No depende de localStorage (puede borrarse)
-- ✅ UNIQUE constraint previene duplicados
-- ✅ ON CONFLICT DO UPDATE = upsert automático
--
-- ============================================
