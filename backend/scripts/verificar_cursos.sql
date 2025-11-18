-- =========================================
-- SCRIPT DE VERIFICACIÓN DE CURSOS
-- =========================================
-- Este script te permite verificar si los cursos se están guardando correctamente en Supabase
-- Copia y pega estas queries en el SQL Editor de Supabase

-- 1. Ver todos los cursos (más recientes primero)
SELECT 
  id,
  title,
  slug,
  category,
  price,
  level,
  certified,
  instructor_id,
  created_at,
  updated_at
FROM courses
ORDER BY created_at DESC;

-- 2. Contar total de cursos
SELECT COUNT(*) as total_cursos FROM courses;

-- 3. Ver cursos con sus lecciones
SELECT 
  c.id as curso_id,
  c.title as curso_titulo,
  c.created_at as curso_creado,
  COUNT(l.id) as total_lecciones
FROM courses c
LEFT JOIN lessons l ON l.course_id = c.id
GROUP BY c.id, c.title, c.created_at
ORDER BY c.created_at DESC;

-- 4. Ver cursos con sus evaluaciones
SELECT 
  c.id as curso_id,
  c.title as curso_titulo,
  c.created_at as curso_creado,
  COUNT(e.id) as total_preguntas_evaluacion
FROM courses c
LEFT JOIN evaluations e ON e.course_id = c.id
GROUP BY c.id, c.title, c.created_at
ORDER BY c.created_at DESC;

-- 5. Ver último curso creado con todos los detalles
SELECT 
  c.*,
  p.full_name as instructor_name,
  p.email as instructor_email
FROM courses c
LEFT JOIN profiles p ON p.id = c.instructor_id
ORDER BY c.created_at DESC
LIMIT 1;

-- 6. Verificar si hay cursos creados en los últimos 10 minutos
SELECT 
  id,
  title,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_desde_creacion
FROM courses
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- 7. Ver estructura completa de un curso específico (reemplaza 'COURSE_ID_AQUI' con el ID real)
-- SELECT 
--   c.title as curso,
--   json_agg(DISTINCT jsonb_build_object(
--     'lesson_id', l.id,
--     'lesson_title', l.title,
--     'order', l.order_index
--   )) as lecciones,
--   json_agg(DISTINCT jsonb_build_object(
--     'question_id', e.id,
--     'question', e.question,
--     'order', e.question_order
--   )) as evaluaciones
-- FROM courses c
-- LEFT JOIN lessons l ON l.course_id = c.id
-- LEFT JOIN evaluations e ON e.course_id = c.id
-- WHERE c.id = 'COURSE_ID_AQUI'
-- GROUP BY c.id, c.title;

-- 8. Ver cursos creados hoy
SELECT 
  id,
  title,
  created_at,
  updated_at
FROM courses
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;

-- 9. Estadísticas generales
SELECT 
  COUNT(*) as total_cursos,
  COUNT(CASE WHEN certified = true THEN 1 END) as cursos_certificados,
  AVG(price) as precio_promedio,
  COUNT(DISTINCT instructor_id) as total_instructores
FROM courses;

-- 10. Ver si hay problemas de permisos RLS (Row Level Security)
-- Si esta query falla, puede haber un problema de permisos
SELECT 
  id,
  title,
  'Permisos OK' as estado
FROM courses
LIMIT 1;
