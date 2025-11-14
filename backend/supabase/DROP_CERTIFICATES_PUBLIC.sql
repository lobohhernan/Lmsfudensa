-- Eliminar la vista pública insegura creada originalmente.
-- Ejecuta este script en Supabase SQL editor para borrar la vista que usa SECURITY DEFINER

DROP VIEW IF EXISTS public.certificates_public;

-- Nota:
-- En lugar de exponer una vista con privilegios elevados, se recomienda
-- implementar una Edge Function que devuelva solo los campos públicos
-- (hash, student_name, course_title, issue_date, status, completion_date).
-- Esto evita bypass de RLS y alertas de seguridad.
