-- Migración: Garantizar columna youtube_id en lecciones
-- Fecha: 2026-02-25
-- Descripción: Asegura que la columna youtube_id exista en la tabla lessons
--              y añade un índice para búsquedas por ID de YouTube.
--              Esta migración es idempotente (segura de re-ejecutar).

-- 1. Asegurar que la columna existe (por si la migración anterior no se aplicó)
ALTER TABLE IF EXISTS public.lessons
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

-- 2. Índice para búsquedas/filtros por youtube_id
CREATE INDEX IF NOT EXISTS idx_lessons_youtube_id
  ON public.lessons (youtube_id)
  WHERE youtube_id IS NOT NULL;

-- 3. Comentario descriptivo en la columna
COMMENT ON COLUMN public.lessons.youtube_id IS
  'ID del video de YouTube (11 caracteres). '
  'Ejemplo: para https://youtube.com/watch?v=dQw4w9WgXcQ → guardar dQw4w9WgXcQ';
