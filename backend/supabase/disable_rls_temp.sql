-- Temporal: Desactivar RLS para poder insertar datos de prueba
-- EJECUTAR ESTO PRIMERO en Supabase Dashboard

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_outcomes DISABLE ROW LEVEL SECURITY;

-- Ahora ejecuta seed_simple.sql

-- Luego VUELVE A ACTIVAR RLS:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.course_learning_outcomes ENABLE ROW LEVEL SECURITY;
