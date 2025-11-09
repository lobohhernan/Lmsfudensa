-- ============================================
-- DATOS DE PRUEBA PARA LMS FUDENSA
-- ============================================
-- Este archivo contiene inserts de prueba para testear createCourse()
-- Ejecuta esto después de las migraciones

-- 1. Crear perfil de usuario de prueba (instructor)
-- Nota: Supabase auth.users debe crearse primero, este es solo el profile
-- 1a. Crear el user en auth.users ANTES del profile
-- Nota: Supabase Auth mantiene la tabla de usuarios; profiles.id tiene FK sobre auth.users.id
-- Intentamos insertar directamente en auth.users para entornos de prueba. Si esto falla
-- en tu proyecto (por cambios en el esquema de auth.users), usa la Admin API (ver README) o
-- crea el usuario desde la consola antes de correr este seed.
INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'authenticated',
  'authenticated',
  'instructor@test.com',
  '{}'::jsonb,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 1b. Crear perfil de usuario de prueba (instructor)
-- Ahora que el user existe (o ya existía), podemos insertar el profile vinculado.
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'instructor@test.com',
  'Dr. Test Instructor',
  'instructor',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar curso de prueba (RCP Adultos)
INSERT INTO public.courses (
  title,
  slug,
  description,
  full_description,
  image,
  instructor_id,
  price,
  duration,
  level,
  certified,
  students,
  category,
  rating,
  reviews,
  created_at,
  updated_at
) VALUES (
  'RCP Adultos AHA 2020 - Reanimación Cardiopulmonar',
  'rcp-adultos-aha-2020',
  'Aprende las técnicas de RCP para adultos según las guías AHA 2020',
  'Curso completo de Reanimación Cardiopulmonar para adultos basado en las últimas guías de la American Heart Association 2020. Aprenderás técnicas esenciales para salvar vidas en situaciones de emergencia cardíaca.',
  'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200',
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  29900,
  '8 horas',
  'Básico',
  true,
  0,
  'RCP',
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Obtener ID del curso creado (para usar en lecciones)
-- Nota: Reemplaza 'curso_id_aqui' con el UUID real después de insertar

-- Para pruebas, crea curso manualmente o usa el ID:
-- SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020';

-- 4. Insertar lecciones de prueba
INSERT INTO public.lessons (
  course_id,
  title,
  description,
  type,
  youtube_id,
  duration,
  order_index,
  completed,
  locked,
  created_at
) VALUES
-- Lección 1
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Introducción a RCP',
  'Conceptos básicos de reanimación cardiopulmonar',
  'video',
  'dQw4w9WgXcQ',
  '15 min',
  1,
  false,
  false,
  NOW()
),
-- Lección 2
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Anatomía del sistema cardiovascular',
  'Entender el corazón y cómo funciona',
  'video',
  'dQw4w9WgXcQ',
  '20 min',
  2,
  false,
  false,
  NOW()
),
-- Lección 3
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Compresiones torácicas efectivas',
  'Técnica correcta de compresiones',
  'video',
  'dQw4w9WgXcQ',
  '25 min',
  3,
  false,
  false,
  NOW()
);

-- 5. Insertar evaluaciones de prueba
INSERT INTO public.evaluations (
  course_id,
  question,
  options,
  correct_answer,
  explanation,
  question_order,
  created_at
) VALUES
-- Pregunta 1
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  '¿Cuál es la profundidad correcta de las compresiones torácicas en un adulto durante la RCP?',
  ARRAY['Al menos 3 cm', 'Al menos 5 cm', 'Al menos 7 cm', 'Al menos 10 cm'],
  1,
  'Las compresiones torácicas en adultos deben tener una profundidad de al menos 5 cm según las guías AHA 2020.',
  1,
  NOW()
),
-- Pregunta 2
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  '¿Cuál es la frecuencia recomendada de compresiones torácicas por minuto?',
  ARRAY['60-80 compresiones', '80-100 compresiones', '100-120 compresiones', '120-140 compresiones'],
  2,
  'La frecuencia óptima es de 100-120 compresiones por minuto.',
  2,
  NOW()
);

-- 6. Insertar requisitos del curso
INSERT INTO public.course_requirements (
  course_id,
  requirement,
  requirement_order,
  created_at
) VALUES
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'No se requiere experiencia previa',
  1,
  NOW()
),
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Conexión a internet estable',
  2,
  NOW()
),
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Dispositivo para ver videos',
  3,
  NOW()
);

-- 7. Insertar objetivos de aprendizaje
INSERT INTO public.course_learning_outcomes (
  course_id,
  outcome,
  outcome_order,
  created_at
) VALUES
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Dominar las técnicas de RCP para adultos',
  1,
  NOW()
),
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Reconocer signos de paro cardíaco',
  2,
  NOW()
),
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Utilizar un DEA correctamente',
  3,
  NOW()
),
(
  (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1),
  'Aplicar compresiones torácicas efectivas',
  4,
  NOW()
);

-- ============================================
-- VERIFICACIONES (ejecuta estas queries para ver resultados)
-- ============================================

-- Ver todos los cursos
-- SELECT id, title, slug, category FROM public.courses;

-- Ver lecciones de un curso
-- SELECT * FROM public.lessons 
-- WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1);

-- Ver evaluaciones de un curso
-- SELECT * FROM public.evaluations 
-- WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1);

-- Ver requisitos
-- SELECT * FROM public.course_requirements 
-- WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1);

-- Ver objetivos
-- SELECT * FROM public.course_learning_outcomes 
-- WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'rcp-adultos-aha-2020' LIMIT 1);
