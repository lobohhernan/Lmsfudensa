-- Migración: Mejorar esquema de cursos, lecciones y agregar evaluaciones
-- Fecha: 2024-11-08
-- Descripción: Agregar campos faltantes y mejorar estructura para createCourse()

-- 1. Alternar tabla courses para agregar campos faltantes
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '0 horas';
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Básico' CHECK (level IN ('Básico', 'Intermedio', 'Avanzado'));
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS certified BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS students INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;

-- 2. Mejorar tabla lessons con campos adicionales
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video' CHECK (type IN ('video', 'quiz', 'document'));
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS youtube_id TEXT;
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '0 min';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Crear tabla de evaluaciones
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  question_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de requisitos
CREATE TABLE IF NOT EXISTS public.course_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  requirement TEXT NOT NULL,
  requirement_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de objetivos de aprendizaje
CREATE TABLE IF NOT EXISTS public.course_learning_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  outcome TEXT NOT NULL,
  outcome_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Mejorar políticas RLS para courses
DROP POLICY IF EXISTS "Instructors can manage their courses" ON public.courses;

CREATE POLICY "Instructors can view their courses" ON public.courses
  FOR SELECT USING (
    auth.uid() = instructor_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (
    auth.uid() = instructor_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Instructors can update their courses" ON public.courses
  FOR UPDATE USING (
    auth.uid() = instructor_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can delete courses" ON public.courses
  FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 7. Políticas RLS para lecciones
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons from published courses" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Only instructors can manage their course lessons" ON public.lessons
  FOR ALL USING (
    course_id IN (
      SELECT id FROM public.courses WHERE instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 8. Políticas RLS para evaluaciones
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evaluations from published courses" ON public.evaluations
  FOR SELECT USING (true);

CREATE POLICY "Only instructors can manage their course evaluations" ON public.evaluations
  FOR ALL USING (
    course_id IN (
      SELECT id FROM public.courses WHERE instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 9. Políticas para requisitos y objetivos
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course requirements" ON public.course_requirements
  FOR SELECT USING (true);

CREATE POLICY "Only instructors can manage course requirements" ON public.course_requirements
  FOR ALL USING (
    course_id IN (
      SELECT id FROM public.courses WHERE instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Anyone can view learning outcomes" ON public.course_learning_outcomes
  FOR SELECT USING (true);

CREATE POLICY "Only instructors can manage learning outcomes" ON public.course_learning_outcomes
  FOR ALL USING (
    course_id IN (
      SELECT id FROM public.courses WHERE instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 10. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON public.evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_requirements_course ON public.course_requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_course ON public.course_learning_outcomes(course_id);

-- 11. Comentarios (documentación en BD)
COMMENT ON TABLE public.courses IS 'Tabla de cursos del LMS con información completa del curso';
COMMENT ON TABLE public.lessons IS 'Lecciones individuales que componen un curso';
COMMENT ON TABLE public.evaluations IS 'Preguntas de evaluación para cursos';
COMMENT ON TABLE public.course_requirements IS 'Requisitos para tomar cada curso';
COMMENT ON TABLE public.course_learning_outcomes IS 'Objetivos de aprendizaje de cada curso';
