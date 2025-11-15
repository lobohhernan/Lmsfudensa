import { supabase } from "./supabase";

/**
 * Códigos de error estandarizados para enrollments
 */
export enum EnrollmentErrorCode {
  ALREADY_ENROLLED = "ALREADY_ENROLLED",
  COURSE_NOT_FOUND = "COURSE_NOT_FOUND",
  USER_NOT_AUTHENTICATED = "USER_NOT_AUTHENTICATED",
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DUPLICATE_KEY = "DUPLICATE_KEY",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Tipo de respuesta para operaciones de enrollment
 */
export interface EnrollmentResult {
  success: boolean;
  error?: string;
  errorCode?: EnrollmentErrorCode;
  data?: any;
}

/**
 * Verifica si un usuario está inscrito en un curso específico
 * Valida parámetros y maneja errores de red gracefully.
 * 
 * @param userId - UUID del usuario (auth.users.id)
 * @param courseId - UUID del curso
 * @returns true si el usuario está inscrito, false en caso contrario
 * 
 * @example
 * const isEnrolled = await isUserEnrolled(user.id, course.id);
 * if (isEnrolled) {
 *   console.log("Usuario ya inscrito");
 * }
 */
export async function isUserEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  // Validación de parámetros
  if (!userId || !courseId) {
    console.error("isUserEnrolled: userId y courseId son requeridos");
    return false;
  }

  // Validar formato UUID básico
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId) || !uuidRegex.test(courseId)) {
    console.error("isUserEnrolled: IDs inválidos (no son UUIDs)");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle(); // maybeSingle en vez de single para evitar error si no existe

    // PGRST116 = no se encontraron filas (no está inscrito)
    if (error && error.code !== "PGRST116") {
      console.error("Error checking enrollment:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Error in isUserEnrolled:", err);
    return false;
  }
}

/**
 * Inscribe a un usuario en un curso con validación completa y reintentos.
 * Previene inscripciones duplicadas y maneja errores de red.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @param options - Opciones adicionales (retries, timeout)
 * @returns EnrollmentResult con estado de éxito/error
 * 
 * @example
 * const result = await enrollUser(user.id, course.id);
 * if (result.success) {
 *   toast.success("Inscripción exitosa");
 * } else {
 *   toast.error(result.error || "Error al inscribirse");
 * }
 */
export async function enrollUser(
  userId: string,
  courseId: string,
  options: { retries?: number } = { retries: 2 }
): Promise<EnrollmentResult> {
  // Validación de parámetros
  if (!userId || !courseId) {
    return {
      success: false,
      error: "Usuario y curso son requeridos",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  // Validar formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId) || !uuidRegex.test(courseId)) {
    return {
      success: false,
      error: "IDs inválidos",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  try {
    // 1. Verificar si ya está inscrito (previene race conditions)
    const alreadyEnrolled = await isUserEnrolled(userId, courseId);
    if (alreadyEnrolled) {
      return {
        success: false,
        error: "Ya estás inscrito en este curso",
        errorCode: EnrollmentErrorCode.ALREADY_ENROLLED,
      };
    }

    // 2. Verificar que el curso existe
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError || !courseData) {
      return {
        success: false,
        error: "El curso no existe o no está disponible",
        errorCode: EnrollmentErrorCode.COURSE_NOT_FOUND,
      };
    }

    // 3. Intentar inscripción con reintentos para manejar errores de red
    let lastError: any = null;
    const maxRetries = options.retries || 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select()
        .single();

      if (!error) {
        console.log("✅ Enrollment successful:", data);
        return {
          success: true,
          data,
        };
      }

      lastError = error;

      // Error de clave duplicada (23505) - ya inscrito
      if (error.code === "23505") {
        return {
          success: false,
          error: "Ya estás inscrito en este curso",
          errorCode: EnrollmentErrorCode.DUPLICATE_KEY,
        };
      }

      // Error de permiso (42501 o PGRST301)
      if (error.code === "42501" || error.code === "PGRST301") {
        return {
          success: false,
          error: "No tienes permiso para inscribirte",
          errorCode: EnrollmentErrorCode.PERMISSION_DENIED,
        };
      }

      // Error de red - reintentar con backoff exponencial
      if (
        error.message?.includes("network") ||
        error.message?.includes("fetch") ||
        error.message?.includes("timeout")
      ) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
          console.warn(
            `⚠️ Reintento ${attempt + 1}/${maxRetries} después de ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        return {
          success: false,
          error: "Error de conexión. Por favor, intenta de nuevo.",
          errorCode: EnrollmentErrorCode.NETWORK_ERROR,
        };
      }

      // Otro error - no reintentar
      break;
    }

    // Si llegamos aquí, falló después de todos los reintentos
    console.error("❌ Error enrolling user after retries:", lastError);
    return {
      success: false,
      error:
        lastError?.message ||
        "Error al inscribirte. Por favor, intenta de nuevo.",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  } catch (err: any) {
    console.error("❌ Exception in enrollUser:", err);
    return {
      success: false,
      error: err.message || "Error inesperado al inscribirse",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }
}

/**
 * Versión idempotente de enrollUser: devuelve éxito si ya está inscrito.
 * Útil para scripts y operaciones automatizadas.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns EnrollmentResult (siempre success: true si ya inscrito)
 * 
 * @example
 * const result = await enrollUserIdempotent(user.id, course.id);
 * // Siempre devuelve success: true si el usuario termina inscrito
 */
export async function enrollUserIdempotent(
  userId: string,
  courseId: string
): Promise<EnrollmentResult> {
  const result = await enrollUser(userId, courseId, { retries: 1 });

  // Si ya está inscrito, devolver éxito (operación idempotente)
  if (
    !result.success &&
    (result.errorCode === EnrollmentErrorCode.ALREADY_ENROLLED ||
      result.errorCode === EnrollmentErrorCode.DUPLICATE_KEY)
  ) {
    return {
      success: true,
      error: undefined,
      data: { message: "Usuario ya inscrito previamente" },
    };
  }

  return result;
}

/**
 * Obtiene todos los cursos en los que un usuario está inscrito.
 * Incluye información completa del curso y estado de inscripción.
 * 
 * @param userId - UUID del usuario
 * @returns Array de cursos con datos de inscripción
 * 
 * @example
 * const enrollments = await getUserEnrollments(user.id);
 * enrollments.forEach(e => console.log(e.course.title, e.progress));
 */
export async function getUserEnrollments(userId: string): Promise<any[]> {
  if (!userId) {
    console.error("getUserEnrollments: userId es requerido");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        completed,
        completed_at,
        last_accessed_at,
        progress,
        course:courses (
          id,
          title,
          description,
          image,
          duration,
          level,
          certified
        )
      `
      )
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Error fetching user enrollments:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserEnrollments:", err);
    return [];
  }
}

/**
 * Marca un curso como completado para un usuario.
 * Actualiza las columnas `completed` y `completed_at`.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns EnrollmentResult con estado de éxito
 * 
 * @example
 * const result = await markCourseCompleted(user.id, course.id);
 * if (result.success) {
 *   generateCertificate(user, course);
 * }
 */
export async function markCourseCompleted(
  userId: string,
  courseId: string
): Promise<EnrollmentResult> {
  if (!userId || !courseId) {
    return {
      success: false,
      error: "Usuario y curso son requeridos",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  try {
    // Verificar que está inscrito antes de marcar como completado
    const isEnrolled = await isUserEnrolled(userId, courseId);
    if (!isEnrolled) {
      return {
        success: false,
        error: "No estás inscrito en este curso",
        errorCode: EnrollmentErrorCode.PERMISSION_DENIED,
      };
    }

    const { error, data } = await supabase
      .from("enrollments")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        progress: 100,
      })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) {
      console.error("Error marking course as completed:", error);
      return {
        success: false,
        error: "Error al marcar curso como completado",
        errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
      };
    }

    console.log("✅ Curso marcado como completado:", data);
    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Error in markCourseCompleted:", err);
    return {
      success: false,
      error: err.message || "Error inesperado",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }
}

/**
 * Actualiza la fecha de último acceso de un enrollment.
 * Llamar cada vez que el usuario accede a una lección.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns Promise<void> (fire-and-forget, no bloquea UI)
 * 
 * @example
 * // Al cargar LessonPlayer
 * updateLastAccessed(user.id, course.id).catch(console.error);
 */
export async function updateLastAccessed(
  userId: string,
  courseId: string
): Promise<void> {
  if (!userId || !courseId) {
    return;
  }

  try {
    const { error } = await supabase
      .from("enrollments")
      .update({
        last_accessed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) {
      console.warn("⚠️ Error updating last accessed (non-critical):", error);
    }
  } catch (err) {
    console.warn("⚠️ Exception in updateLastAccessed (non-critical):", err);
  }
}

/**
 * Actualiza el progreso de un curso (0-100).
 * Útil para tracking de avance en lecciones.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @param progress - Porcentaje de progreso (0-100)
 * @returns EnrollmentResult
 * 
 * @example
 * await updateCourseProgress(user.id, course.id, 45);
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number
): Promise<EnrollmentResult> {
  if (!userId || !courseId) {
    return {
      success: false,
      error: "Usuario y curso son requeridos",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  if (progress < 0 || progress > 100) {
    return {
      success: false,
      error: "Progreso debe estar entre 0 y 100",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  try {
    const { error, data } = await supabase
      .from("enrollments")
      .update({ progress })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) {
      console.error("Error updating course progress:", error);
      return {
        success: false,
        error: "Error al actualizar progreso",
        errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Error in updateCourseProgress:", err);
    return {
      success: false,
      error: err.message || "Error inesperado",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }
}

/**
 * Des-inscribe a un usuario de un curso (elimina enrollment).
 * ADVERTENCIA: Esta operación es irreversible.
 * 
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns EnrollmentResult
 * 
 * @example
 * const result = await unenrollUser(user.id, course.id);
 * if (result.success) {
 *   toast.success("Te has desinscrito del curso");
 * }
 */
export async function unenrollUser(
  userId: string,
  courseId: string
): Promise<EnrollmentResult> {
  if (!userId || !courseId) {
    return {
      success: false,
      error: "Usuario y curso son requeridos",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }

  try {
    const { error, data } = await supabase
      .from("enrollments")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select();

    if (error) {
      console.error("Error unenrolling user:", error);
      return {
        success: false,
        error: "Error al desinscribirse del curso",
        errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No se encontró la inscripción",
        errorCode: EnrollmentErrorCode.PERMISSION_DENIED,
      };
    }

    console.log("✅ Usuario desinscrito exitosamente");
    return {
      success: true,
      data: data[0],
    };
  } catch (err: any) {
    console.error("Error in unenrollUser:", err);
    return {
      success: false,
      error: err.message || "Error inesperado",
      errorCode: EnrollmentErrorCode.UNKNOWN_ERROR,
    };
  }
}
