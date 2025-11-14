
-- =============================================
-- TABLA: evaluations (Preguntas de evaluación por curso)
-- =============================================

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_correct_answer CHECK (correct_answer >= 0 AND correct_answer <= 3),
  CONSTRAINT valid_options CHECK (jsonb_array_length(options) = 4),
  UNIQUE(course_id, question_order)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_evaluations_course_id ON public.evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_order ON public.evaluations(course_id, question_order);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluations_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Política: admins pueden hacer todo (INSERT/UPDATE/DELETE) usando auth.uid()
CREATE POLICY IF NOT EXISTS admins_all_evaluations
  ON public.evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: usuarios autenticados pueden ver (SELECT) las evaluaciones
CREATE POLICY IF NOT EXISTS students_view_evaluations
  ON public.evaluations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Comentarios descriptivos (opcionales pero útiles)
COMMENT ON TABLE public.evaluations IS 'Preguntas de evaluación creadas por admins para cada curso';
COMMENT ON COLUMN public.evaluations.course_id IS 'ID del curso al que pertenece la pregunta';
COMMENT ON COLUMN public.evaluations.question_order IS 'Orden de la pregunta en la evaluación (1, 2, 3...)';
COMMENT ON COLUMN public.evaluations.question IS 'Texto de la pregunta';
COMMENT ON COLUMN public.evaluations.options IS 'Array JSONB con 4 opciones de respuesta';
COMMENT ON COLUMN public.evaluations.correct_answer IS 'Índice (0-3) de la opción correcta';
COMMENT ON COLUMN public.evaluations.explanation IS 'Explicación de por qué es correcta (opcional)';
