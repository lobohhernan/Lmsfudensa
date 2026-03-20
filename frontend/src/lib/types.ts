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
  is_active?: boolean;
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

// Tipo para profe/teacher
export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  specialization?: string;
  years_of_experience?: number;
  total_students?: number;
  total_courses?: number;
  hourly_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
export const LESSON_TYPES = ["video", "quiz", "document"] as const;

// Utilidades de tipo
export type CourseLevel = typeof COURSE_LEVELS[number];
export type LessonType = typeof LESSON_TYPES[number];

// ============================================
// TIPOS SUPABASE (BD)
// ============================================

// User Profile en DB
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

// Course completo (con relaciones)
export interface Course extends CourseDB {
  lessons?: Lesson[];
  evaluations?: Evaluation[];
}

// Lesson renderizada
export interface Lesson extends LessonDB {
  youtube_id?: string;
}

// Evaluation renderizada
export interface Evaluation extends EvaluationDB {
  correct_answer: number;
}

// Teacher
export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  specialization?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// Enrollment (inscripción en curso)
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  last_accessed_at?: string;
  completed: boolean;
  courses?: Course;
}

// User Progress (progreso en lecciones)
export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  last_accessed_at: string;
  progress_percentage?: number;
}

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

// Form: Crear/Editar Curso
export interface CourseFormData {
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription?: string;
  image?: string;
  instructorId: string;
  price?: number;
  duration: string;
  level: CourseLevel;
  certified: boolean;
  lessons?: CourseLesson[];
  evaluations?: EvaluationQuestion[];
}

// Lesson en formulario
export interface CourseLesson {
  title: string;
  description?: string;
  type: LessonType;
  youtubeId?: string;
  duration: string;
  order_index?: number;
}

// Evaluation Question en formulario
export interface EvaluationQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Form: Crear/Editar Profesor
export interface TeacherFormData {
  email: string;
  full_name: string;
  specialization?: string;
  bio?: string;
}

// Form: MercadoPago Checkout
export interface CheckoutFormData {
  courseId: string;
  userId: string;
}

// ============================================
// TIPOS PARA ERRORES Y RESPUESTAS
// ============================================

// Handler de errores seguro
export interface ErrorWithMessage {
  message: string;
}

// Helper para extraer mensaje de error
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

// Respuesta genérica del API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// TIPOS PARA NAVEGACIÓN
// ============================================

// Tipo Enrollment - representa una inscripción de un usuario en un curso
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at?: string;
  status?: string;
  enrolled_at?: string;
  completed?: boolean;
  completed_at?: string | null;
  last_accessed_at?: string | null;
  course?: Record<string, unknown>;
}

// Parámetros de navegación
export interface NavigationParams {
  page: string;
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
  [key: string]: any;
}

// ============================================
// TIPOS DE PAGOS
// ============================================

export type PaymentStatus = 'approved' | 'pending' | 'rejected' | 'cancelled' | 'legacy';

/** Fila en la tabla `payments` (con joins opcionales) */
export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  payer_email: string | null;
  payer_name: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  profiles?: { full_name: string | null; email: string | null } | null;
  courses?: { title: string; price?: number | null } | null;
}