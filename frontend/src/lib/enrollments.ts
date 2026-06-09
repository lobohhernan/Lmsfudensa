import { supabase } from "./supabase";
import { Enrollment } from "./types";

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

    
    // Intento 1: Consulta simple con select
    const { data, error, status, statusText } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId);

    console.log(`[isUserEnrolled] Response status: ${status}, statusText: ${statusText}`);
    
    if (error) {
      console.error("[isUserEnrolled] Error checking enrollment:", {
        message: error.message,
        code: error.code,
        status,
        statusText,
        details: error
      });
      return false;
    }

    console.log(`[isUserEnrolled] Query result - data:`, data, `- length:`, data?.length);
    
    const enrolled = data !== null && data.length > 0;
    
    if (enrolled) {

    } else {
      console.log(`ℹ️  [isUserEnrolled] Usuario NOT inscrito (sin registros)`);
    }
    
    return enrolled;
  } catch (err) {
    console.error("[isUserEnrolled] Exception in isUserEnrolled:", err);
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in enrollUser:", message);
    return {
      success: false,
      error: message || "Error desconocido al inscribir usuario",
    };
  }
}


