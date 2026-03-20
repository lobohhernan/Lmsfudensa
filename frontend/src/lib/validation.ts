import { z } from 'zod';

// ============================================
// ESQUEMAS DE VALIDACIÓN PARA FORMULARIOS
// ============================================

/**
 * Validación para Contacto
 */
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z
    .string()
    .email('Ingresa un email válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\)]{10,}$/, 'Ingresa un número de teléfono válido')
    .optional()
    .or(z.literal('')),
  
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(5000, 'El mensaje no puede exceder 5000 caracteres'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Validación para Profesor/Docente
 */
export const TeacherFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z
    .string()
    .email('Ingresa un email válido'),
  
  specialization: z
    .string()
    .max(200, 'La especialización no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  years_of_experience: z
    .number()
    .min(0, 'Los años no pueden ser negativos')
    .max(70, 'Ingresa un valor válido')
    .optional(),
  
  hourly_rate: z
    .number()
    .positive('La tarifa debe ser un número positivo')
    .optional(),
  
  is_active: z
    .boolean()
    .optional(),
});

export type TeacherFormData = z.infer<typeof TeacherFormSchema>;

/**
 * Validación para Curso
 */
export const CourseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9\-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  fullDescription: z
    .string()
    .min(20, 'La descripción completa debe tener al menos 20 caracteres')
    .max(5000, 'La descripción completa no puede exceder 5000 caracteres')
    .optional(),
  
  category: z
    .string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(100, 'La categoría no puede exceder 100 caracteres'),
  
  level: z
    .enum(['Básico', 'Intermedio', 'Avanzado'])
    .default('Básico'),
  
  duration: z
    .string()
    .regex(/^\d+\s*(horas?|days?|semanas?|weeks?)$/i, 'Ingresa una duración válida (ej: 8 horas)'),
  
  price: z
    .number()
    .positive('El precio debe ser un número positivo')
    .optional(),
  
  certified: z
    .boolean()
    .optional(),
  
  instructorId: z
    .string()
    .min(1, 'Debes seleccionar un instructor'),
});

export type CourseFormData = z.infer<typeof CourseFormSchema>;

/**
 * Validación para Lección
 */
export const LessonSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  type: z.enum(['video', 'quiz', 'document']),
  
  duration: z
    .string()
    .regex(/^\d+\s*min|^\d+\s*h/, 'Ingresa una duración válida'),
  
  youtubeId: z
    .string()
    .regex(/^[a-zA-Z0-9_\-]{11}$/, 'ID de YouTube debe tener 11 caracteres')
    .optional()
    .or(z.literal('')),
});

export type LessonData = z.infer<typeof LessonSchema>;

/**
 * Validación para Pregunta de Evaluación
 */
export const EvaluationQuestionSchema = z.object({
  question: z
    .string()
    .min(10, 'La pregunta debe tener al menos 10 caracteres')
    .max(500, 'La pregunta no puede exceder 500 caracteres'),
  
  options: z
    .array(z.string().min(1, 'Cada opción debe tener texto'))
    .min(2, 'Debe haber al menos 2 opciones')
    .max(5, 'No puede haber más de 5 opciones'),
  
  correctAnswer: z
    .number()
    .min(0, 'Debes seleccionar una respuesta correcta'),
  
  explanation: z
    .string()
    .max(1000, 'La explicación no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type EvaluationQuestionData = z.infer<typeof EvaluationQuestionSchema>;

/**
 * Validación para Checkout
 */
export const CheckoutFormSchema = z.object({
  email: z
    .string()
    .email('Ingresa un email válido'),
  
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  courseId: z
    .string()
    .min(1, 'Debe seleccionarse un curso'),
  
  paymentMethod: z
    .enum(['mercadopago', 'bank_transfer', 'credit_card'])
    .optional(),
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

/**
 * Utilidad para validar datos
 */
export const validateFormData = async <T>(
  schema: z.ZodSchema,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string[]> }> => {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error desconocido en validación'] } };
  }
};

/**
 * Hook para usar validación en formularios (útil en React)
 */
export const useFormValidation = <T>(schema: z.ZodSchema) => {
  const validate = async (data: unknown): Promise<{ success: boolean; data?: T; errors?: Record<string, string[]> }> => {
    return validateFormData<T>(schema, data);
  };

  return { validate };
};
