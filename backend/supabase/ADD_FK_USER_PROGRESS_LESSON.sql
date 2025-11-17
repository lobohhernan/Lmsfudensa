-- Añadir Foreign Key de user_progress.lesson_id a lessons(id)
-- Ejecutar solamente si ya ejecutaste CREATE_USER_PROGRESS_TABLE.sql

ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_lesson_fkey;

ALTER TABLE public.user_progress
  ADD CONSTRAINT user_progress_lesson_fkey
  FOREIGN KEY (lesson_id)
  REFERENCES public.lessons(id)
  ON DELETE CASCADE;

-- Verificación rápida
SELECT conname, conrelid::regclass AS table_from, confrelid::regclass AS table_to
FROM pg_constraint
WHERE conname = 'user_progress_lesson_fkey';
