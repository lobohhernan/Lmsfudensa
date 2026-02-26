-- Optimización de consultas para carga de cursos en progreso
-- Seguro de ejecutar múltiples veces

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'enrollments'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_last_accessed
      ON public.enrollments (user_id, last_accessed_at DESC);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lessons'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_lessons_course_order
      ON public.lessons (course_id, order_index);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_progress'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_progress_user_course
      ON public.user_progress (user_id, course_id);

    CREATE INDEX IF NOT EXISTS idx_user_progress_user_course_completed
      ON public.user_progress (user_id, course_id, completed);

    CREATE INDEX IF NOT EXISTS idx_user_progress_user_course_last_accessed
      ON public.user_progress (user_id, course_id, last_accessed_at DESC);
  END IF;
END $$;