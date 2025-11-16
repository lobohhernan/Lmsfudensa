import { supabase } from "../lib/supabase";
import { supabaseAdmin, isAdminClientConfigured } from "../lib/supabaseAdmin";
import { debug, info, error as logError } from '../lib/logger'

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
 * Inserta un registro en la tabla `certificates` con hash generado automáticamente.
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

  try {
    // Usar admin client si está configurado (para evitar problemas de RLS)
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    // Llamar a la función SQL que genera el hash
    const { data: hashData, error: hashError } = await client.rpc(
      "generate_certificate_hash"
    );

    if (hashError) {
      logError("Error generando hash:", hashError);
      throw new Error("No se pudo generar el hash del certificado");
    }

    const hash = hashData as string;

    // Insertar certificado
    const { data, error } = await client
      .from("certificates")
      .insert([
        {
          student_id: studentId,
          course_id: courseId,
          hash,
          student_name: studentName,
          course_title: courseTitle,
          completion_date: completionDate,
          grade,
          status: "active",
          pdf_generated: false,
          pdf_url: null,
        },
      ])
      .select()
      .single();

    if (error) {
      logError("Error insertando certificado:", error);
      throw error;
    }

    info("✅ Certificado emitido:", data);
    return data;
  } catch (err: any) {
    logError("❌ Error en issueCertificate:", err);
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
