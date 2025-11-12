-- Script de seed simple para ejecutar en Supabase Dashboard SQL Editor
-- Este script inserta datos de prueba directamente

-- 1. Insertar un perfil de prueba (sin auth.users, solo para testing)
INSERT INTO public.profiles (id, email, full_name, role, bio, avatar_url)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'instructor@test.com', 'Dr. Test Instructor', 'instructor', 'Instructor certificado en RCP.', 'https://randomuser.me/api/portraits/men/75.jpg')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar curso de prueba
INSERT INTO public.courses (id, title, slug, description, full_description, image, instructor_id, price, duration, level, certified, students, category, rating, reviews)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RCP Adultos AHA 2020', 'rcp-adultos-aha-2020', 'Aprende RCP para adultos', 'Curso completo de Reanimacion Cardiopulmonar', 'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200', '550e8400-e29b-41d4-a716-446655440000', 29900, '8 horas', 'Basico', true, 0, 'RCP', 0, 0)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insertar lecciones
INSERT INTO public.lessons (course_id, title, description, type, youtube_id, duration, order_index, locked)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Intro a RCP', 'Conceptos basicos', 'video', 'dQw4w9WgXcQ', '15 min', 1, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Anatomia', 'Como funciona', 'video', 'dQw4w9WgXcQ', '20 min', 2, false)
ON CONFLICT DO NOTHING;

-- 4. Insertar evaluaciones
INSERT INTO public.evaluations (course_id, question, options, correct_answer, explanation, question_order)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Profundidad de compresiones?', ARRAY['3cm','5cm','7cm','10cm'], 1, 'Al menos 5cm.', 1)
ON CONFLICT DO NOTHING;

-- Verificar que se insertaron los datos
SELECT 'Profiles' as tabla, COUNT(*) as registros FROM public.profiles
UNION ALL
SELECT 'Courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'Lessons', COUNT(*) FROM public.lessons
UNION ALL
SELECT 'Evaluations', COUNT(*) FROM public.evaluations;
