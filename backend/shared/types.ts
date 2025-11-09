// ============================================
// TIPOS COMPARTIDOS PARA LMS FUDENSA
// ============================================
// Estos tipos se usan tanto en frontend como en backend
// para mantener consistencia en la comunicación

// Tipos base para lecciones
export interface LessonPayload {
  title: string;
  description?: string;
  type: "video" | "quiz" | "document";
  youtubeId?: string;
  duration: string;
}

// Tipos base para evaluaciones
export interface EvaluationPayload {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Tipos base para requisitos y objetivos
export interface RequirementPayload {
  requirement: string;
}

export interface LearningOutcomePayload {
  outcome: string;
}

// Payload que envía el frontend al backend
export interface CourseCreatePayload {
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription?: string;
  image?: string;
  instructorId: string;
  price?: number;
  duration: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  certified: boolean;
  lessons?: LessonPayload[];
  requirements?: RequirementPayload[];
  learningOutcomes?: LearningOutcomePayload[];
  evaluations?: EvaluationPayload[];
}

// Respuesta que retorna el backend
export interface CourseResponse {
  success: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    instructorId: string;
    created_at: string;
  };
  error?: string;
}

// Tipos para validación de errores
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  errors: ValidationError[];
}

// Tipos para el hook useCreateCourse
export interface UseCreateCourseState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseCreateCourseReturn extends UseCreateCourseState {
  createCourse: (payload: CourseCreatePayload) => Promise<CourseResponse | null>;
  reset: () => void;
}

// Tipos para el backend (Edge Functions)
export interface CreateCourseRequest {
  payload: CourseCreatePayload;
}

export interface CreateCourseResponse {
  success: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    instructorId: string;
    created_at: string;
  };
  error?: string;
}

// Tipos para la BD (mapeo de campos)
export interface CourseDB {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_description?: string;
  image?: string;
  instructor_id: string;
  price?: number;
  duration: string;
  level: string;
  certified: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface LessonDB {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: string;
  youtube_id?: string;
  duration: string;
  order_index: number;
  completed: boolean;
  locked: boolean;
  created_at: string;
}

export interface EvaluationDB {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  question_order: number;
  created_at: string;
}

// Constantes para validación
export const COURSE_LEVELS = ["Básico", "Intermedio", "Avanzado"] as const;
export const LESSON_TYPES = ["video", "quiz", "document"] as const;

// Utilidades de tipo
export type CourseLevel = typeof COURSE_LEVELS[number];
export type LessonType = typeof LESSON_TYPES[number];