-- =====================================================================
-- SEED: Actualizar lecciones con videos de YouTube reales
-- =====================================================================
-- Descripción: Reemplaza videos hardcodeados (Rick Astley) con videos
--              educativos reales de RCP y otros temas médicos.
-- =====================================================================

-- NOTA: Estos son ejemplos. Reemplaza con los IDs de YouTube reales de tu canal oficial.
-- Para obtener el ID de un video de YouTube:
-- URL ejemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
-- El ID es: dQw4w9WgXcQ

-- =====================================================================
-- OPCIÓN 1: Actualizar videos de un curso específico
-- =====================================================================

-- Ejemplo: Curso "RCP Adultos AHA 2020"
-- Primero, obtener el course_id:
-- SELECT id, title FROM public.courses WHERE title ILIKE '%RCP%';

-- Luego, actualizar las lecciones (ajustar los IDs según corresponda):

-- Lección 1: Introducción a RCP
UPDATE public.lessons
SET youtube_id = 'x1VPa3B4F4w'  -- Ejemplo: video real de RCP básico
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%Introducción%'
  AND order_index = 1;

-- Lección 2: Anatomía del sistema cardiovascular
UPDATE public.lessons
SET youtube_id = 'yy9Y4Zqj7MA'  -- Ejemplo: anatomía cardiovascular
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%Anatomía%'
  AND order_index = 2;

-- Lección 3: Reconocimiento de paro cardíaco
UPDATE public.lessons
SET youtube_id = 'U-lHGUvhbLc'  -- Ejemplo: signos de paro cardíaco
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%Reconocimiento%'
  AND order_index = 3;

-- Lección 4: Compresiones torácicas efectivas
UPDATE public.lessons
SET youtube_id = 'hbNnxvRDJFI'  -- Ejemplo: técnica de compresiones
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%Compresiones%'
  AND order_index = 4;

-- Lección 5: Ventilaciones de rescate
UPDATE public.lessons
SET youtube_id = 'lCOGjlQtfkE'  -- Ejemplo: técnica de ventilación
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%Ventilaciones%'
  AND order_index = 5;

-- Lección 6: Uso del DEA
UPDATE public.lessons
SET youtube_id = 'lhvYr-5Yn9o'  -- Ejemplo: uso de desfibrilador
WHERE course_id = (SELECT id FROM public.courses WHERE title ILIKE '%RCP Adultos%' LIMIT 1)
  AND title ILIKE '%DEA%'
  AND order_index = 6;

-- =====================================================================
-- OPCIÓN 2: Actualizar en bloque eliminando todos los Rick Astley
-- =====================================================================

-- Reemplaza todos los videos hardcodeados con NULL (o un video por defecto)
UPDATE public.lessons
SET youtube_id = NULL
WHERE youtube_id = 'dQw4w9WgXcQ';

-- =====================================================================
-- OPCIÓN 3: Insertar lecciones nuevas con videos reales
-- =====================================================================

-- Ejemplo: Insertar lecciones para un curso de RCP Pediátrico
-- (Ajustar course_id según tu BD)

INSERT INTO public.lessons (course_id, title, description, youtube_id, duration, type, order_index)
VALUES
  (
    (SELECT id FROM public.courses WHERE title ILIKE '%RCP Pediátrico%' LIMIT 1),
    'Introducción a RCP Pediátrico',
    'Conceptos básicos de RCP en niños y lactantes',
    'x1VPa3B4F4w',  -- Reemplazar con ID real
    '15 min',
    'video',
    1
  ),
  (
    (SELECT id FROM public.courses WHERE title ILIKE '%RCP Pediátrico%' LIMIT 1),
    'Diferencias anatómicas en pediatría',
    'Anatomía y fisiología pediátrica relevante para RCP',
    'yy9Y4Zqj7MA',  -- Reemplazar con ID real
    '20 min',
    'video',
    2
  );

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================

-- Listar lecciones con sus videos actuales
SELECT 
  c.title AS course_title,
  l.order_index,
  l.title AS lesson_title,
  l.youtube_id,
  CASE 
    WHEN l.youtube_id IS NULL THEN '❌ Sin video'
    WHEN l.youtube_id = 'dQw4w9WgXcQ' THEN '⚠️ Rick Astley (hardcodeado)'
    ELSE '✅ Video real'
  END AS video_status
FROM public.lessons l
JOIN public.courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index;

-- =====================================================================
-- NOTAS IMPORTANTES
-- =====================================================================

-- 1. Los IDs de YouTube usados arriba son EJEMPLOS.
--    Debes reemplazarlos con los IDs reales de tu canal oficial.
--
-- 2. Para obtener el ID de un video de YouTube:
--    URL: https://www.youtube.com/watch?v=ABC123
--    ID: ABC123
--
-- 3. Canales recomendados para videos de RCP:
--    - American Heart Association (AHA)
--    - Cruz Roja Americana
--    - ILCOR (International Liaison Committee on Resuscitation)
--    - Tu propio canal institucional de FUDENSA
--
-- 4. Alternativa: Subir videos propios a YouTube y usar esos IDs.
--
-- 5. Si un video no está disponible, el LessonPlayer mostrará
--    un fallback ("Contenido no disponible").
