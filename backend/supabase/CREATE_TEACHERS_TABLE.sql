-- Create teachers table (replacing old profesores table)
-- This table stores teacher/instructor information for courses

DROP TABLE IF EXISTS public.teachers CASCADE;

CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  specialization VARCHAR(255),
  years_of_experience INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_students INT DEFAULT 0,
  total_courses INT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT experience_positive CHECK (years_of_experience >= 0),
  CONSTRAINT rate_positive CHECK (hourly_rate IS NULL OR hourly_rate > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_email ON public.teachers(email);
CREATE INDEX idx_teachers_is_active ON public.teachers(is_active);
CREATE INDEX idx_teachers_created_at ON public.teachers(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- 1. Anyone can view active teachers
CREATE POLICY "Allow public read active teachers" ON public.teachers
  FOR SELECT USING (is_active = true);

-- 2. Admins can view all teachers
CREATE POLICY "Allow admins view all teachers" ON public.teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Teachers can view their own profile
CREATE POLICY "Allow teachers view own profile" ON public.teachers
  FOR SELECT USING (user_id = auth.uid());

-- 4. Admins can insert teachers
CREATE POLICY "Allow admins insert teachers" ON public.teachers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Teachers can update their own profile
CREATE POLICY "Allow teachers update own profile" ON public.teachers
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Admins can update any teacher
CREATE POLICY "Allow admins update teachers" ON public.teachers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 7. Admins can delete teachers
CREATE POLICY "Allow admins delete teachers" ON public.teachers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_teachers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teachers_updated_at_trigger
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_teachers_timestamp();

-- Add teacher_id column to courses table (optional, for course assignment)
-- ALTER TABLE public.courses ADD COLUMN teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;
-- CREATE INDEX idx_courses_teacher_id ON public.courses(teacher_id);

COMMENT ON TABLE public.teachers IS 'Stores teacher/instructor profiles and metadata';
COMMENT ON COLUMN public.teachers.specialization IS 'Primary subject or area of expertise';
COMMENT ON COLUMN public.teachers.years_of_experience IS 'Total years of teaching experience';
COMMENT ON COLUMN public.teachers.hourly_rate IS 'Hourly rate for private sessions (optional)';
