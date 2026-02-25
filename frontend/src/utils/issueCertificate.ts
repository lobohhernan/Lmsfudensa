import { supabase } from "../lib/supabase";
import { issueCertificate as issueCertificateViaAdmin } from "../lib/adminOperations";
import { info, error as logError } from '../lib/logger'

interface IssueCertificateParams {
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  grade: number;
  completionDate?: string;
}

/**
 * Emite un certificado para un estudiante que completó un curso.
 * Usa Edge Function para operaciones administrativas seguras.
 * 
 * @param params - datos del estudiante y curso
 * @returns El certificado recién creado (incluyendo el hash)
 */
export async function issueCertificate(params: IssueCertificateParams) {
  const {
    studentId,
    courseId,
    studentName,
    courseTitle,
    grade,
    completionDate = new Date().toISOString().split("T")[0],
  } = params;

  console.log("🎓 [issueCertificate] Iniciando emisión con params:", {
    studentId,
    courseId,
    studentName,
    courseTitle,
    grade,
    completionDate
  });

  try {
    // Usar Edge Function para emitir certificado (seguro, sin SERVICE_ROLE_KEY en frontend)
    console.log("🔑 [issueCertificate] Usando Edge Function bright-action");

    const result = await issueCertificateViaAdmin({
      studentId,
      courseId,
      studentName,
      courseTitle,
      grade,
      completionDate
    });

    console.log("💾 [issueCertificate] Resultado:", result);

    if (!result.success) {
      throw new Error("No se pudo emitir el certificado");
    }

    info("✅ Certificado emitido:", result.certificate);
    return result.certificate;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logError("❌ Error en issueCertificate:", message);
    throw err;
  }
}

/**
 * Verifica si un estudiante ya tiene un certificado para un curso dado.
 * 
 * @param studentId - ID del estudiante
 * @param courseId - ID del curso
 * @returns true si ya existe un certificado activo
 */
export async function hasCertificate(
  studentId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) || false;
  } catch (err) {
    logError("Error verificando certificado:", err);
    return false;
  }
}
