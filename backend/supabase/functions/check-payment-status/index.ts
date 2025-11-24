import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // Obtener courseId y userEmail del body
    const body = await req.json();
    const { courseId, userEmail } = body;

    console.log("📋 [Check Payment] Verificando pago:", { courseId, userEmail });

    if (!courseId || !userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Parámetros incompletos", enrolled: false }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase credentials missing");
      return new Response(
        JSON.stringify({ success: false, error: "Configuración incompleta", enrolled: false }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar si hay un enrollment para este usuario y curso
    // El webhook debería haber creado este registro cuando el pago se completó
    const { data: enrollmentData, error: queryError } = await supabase
      .from("enrollments")
      .select("id, course_id, user_email, status, created_at")
      .eq("course_id", courseId)
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("📋 [Check Payment] Resultado de búsqueda:", { enrollmentData, queryError });

    if (queryError) {
      console.error("❌ Error al consultar enrollments:", queryError);
      return new Response(
        JSON.stringify({ success: false, error: "Error al verificar estado", enrolled: false }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Si existe enrollment, el pago fue procesado
    const isEnrolled = enrollmentData && enrollmentData.length > 0;

    console.log("📋 [Check Payment] Estado final:", { isEnrolled, enrollmentData });

    return new Response(
      JSON.stringify({
        success: true,
        enrolled: isEnrolled,
        message: isEnrolled ? "Pago procesado exitosamente" : "Pago aún no procesado",
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error en check-payment-status:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error interno", enrolled: false }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
