import { supabase } from "./supabase";

/**
 * Verifica si un usuario está inscrito en un curso específico
 * @param userId - UUID del usuario (auth.users.id)
 * @param courseId - UUID del curso
 * @returns true si el usuario está inscrito, false en caso contrario
 */
export async function isUserEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

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
 * Inscribe a un usuario en un curso
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns true si la inscripción fue exitosa, false en caso contrario
 */
export async function enrollUser(
  userId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si ya está inscrito
    const alreadyEnrolled = await isUserEnrolled(userId, courseId);
    if (alreadyEnrolled) {
      return {
        success: false,
        error: "El usuario ya está inscrito en este curso",
      };
    }

    const { error } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
    });

    if (error) {
      console.error("Error enrolling user:", error);
      return {
        success: false,
        error: error.message || "Error al inscribir usuario",
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in enrollUser:", err);
    return {
      success: false,
      error: err.message || "Error desconocido al inscribir usuario",
    };
  }
}

/**
 * Obtiene todos los cursos en los que un usuario está inscrito
 * @param userId - UUID del usuario
 * @returns Array de cursos con datos de inscripción
 */
export async function getUserEnrollments(userId: string): Promise<any[]> {
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
 * Marca un curso como completado para un usuario
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns true si se marcó como completado, false en caso contrario
 */
export async function markCourseCompleted(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) {
      console.error("Error marking course as completed:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in markCourseCompleted:", err);
    return false;
  }
}

/**
 * Actualiza la fecha de último acceso de un enrollment
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 */
export async function updateLastAccessed(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    await supabase
      .from("enrollments")
      .update({
        last_accessed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  } catch (err) {
    console.error("Error updating last accessed:", err);
  }
}

/**
 * Des-inscribe a un usuario de un curso (elimina enrollment)
 * @param userId - UUID del usuario
 * @param courseId - UUID del curso
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export async function unenrollUser(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) {
      console.error("Error unenrolling user:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in unenrollUser:", err);
    return false;
  }
}
