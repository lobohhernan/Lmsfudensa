import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Inicializar cliente Supabase con service role
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Edge Function para recibir webhooks de Mercado Pago - V2
 * Procesa notificaciones de pagos y crea inscripciones
 */
serve(async (req: Request): Promise<Response> => {
  console.log("🔔 [WEBHOOK] Solicitud recibida:", {
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Configurar CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Signature",
      },
    });
  }

  // Permitir GET para health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "webhook activo", timestamp: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener el body
    const bodyText = await req.text();

    if (!bodyText) {
      console.warn("⚠️ [WEBHOOK] Body vacío");
      return successResponse({ status: "body_empty" });
    }

    // Parsear JSON
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("❌ [WEBHOOK] Error parseando JSON:", parseError);
      return successResponse({ status: "invalid_json" });
    }

    console.log("📨 [WEBHOOK] Notificación recibida:", {
      type: data.type,
      action: data.action,
      paymentId: data.data?.id,
    });

    // Solo procesar notificaciones de pago
    if (data.type !== "payment") {
      console.log("⏭️ [WEBHOOK] Ignorando tipo no-pago:", data.type);
      return successResponse({ status: "ignored_type" });
    }

    // Obtener ID del pago
    const paymentId = data.data?.id;
    if (!paymentId) {
      console.warn("⚠️ [WEBHOOK] Sin ID de pago");
      return successResponse({ status: "no_payment_id" });
    }

    console.log("💰 [WEBHOOK] Procesando pago:", paymentId);

    // Obtener detalles del pago desde MP
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("❌ [WEBHOOK] No hay Access Token de MP");
      return successResponse({ status: "no_mp_token", error: true });
    }

    console.log("🔍 [WEBHOOK] Obteniendo detalles de MP...");

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mpToken}`,
        },
      }
    );

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("❌ [WEBHOOK] Error de MP:", mpResponse.status, errorText.substring(0, 200));
      return successResponse({ status: "mp_error", code: mpResponse.status, error: true });
    }

    const paymentData = await mpResponse.json();
    console.log("📊 [WEBHOOK] Status del pago:", paymentData.status);

    // Solo procesar pagos aprobados
    if (paymentData.status !== "approved") {
      console.log("⏭️ [WEBHOOK] Pago no aprobado:", paymentData.status);
      return successResponse({ status: "not_approved", payment_status: paymentData.status });
    }

    // Extraer datos
    const userEmail = paymentData.payer?.email;
    
    // El external_reference es JSON: {"courseId": "...", "userId": "..."}
    let externalRef: { courseId?: string; userId?: string } = {};
    if (paymentData.external_reference) {
      try {
        externalRef = JSON.parse(decodeURIComponent(paymentData.external_reference));
      } catch (e) {
        // Si falla el parse, asumir que es solo courseId
        externalRef = { courseId: paymentData.external_reference };
      }
    }

    const courseId = externalRef.courseId || paymentData.external_reference;
    const userId = externalRef.userId;

    console.log("👤 [WEBHOOK] Email:", userEmail);
    console.log("📚 [WEBHOOK] Curso:", courseId);
    console.log("🆔 [WEBHOOK] User ID:", userId);

    if (!userEmail || !courseId) {
      console.error("❌ [WEBHOOK] Faltan email o courseId");
      return successResponse({ status: "missing_data", error: true });
    }

    // Crear inscripción
    try {
      await createEnrollment(userId, courseId, userEmail, paymentId);
      console.log("✅ [WEBHOOK] Inscripción procesada exitosamente");
    } catch (enrollError) {
      console.error("❌ [WEBHOOK] Error en inscripción:", enrollError);
      // No fallar el webhook si hay error en inscripción
      return successResponse({ status: "enrollment_error", error: true });
    }

    return successResponse({ status: "success", paymentId });
  } catch (error) {
    console.error("❌ [WEBHOOK] Error general:", error);
    return successResponse({ status: "general_error", error: true });
  }
});

/**
 * Helper para retornar respuesta exitosa (200 OK)
 */
function successResponse(data: Record<string, unknown>) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

/**
 * Crear inscripción del usuario en el curso
 */
async function createEnrollment(
  userId: string | undefined,
  courseId: string,
  userEmail: string,
  paymentId: string
) {
  console.log("📝 [WEBHOOK] Creando inscripción:", { userId, courseId });

  try {
    // Verificar que la inscripción no exista (si tenemos userId)
    if (userId) {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) {
        console.log("⚠️ [WEBHOOK] Inscripción ya existe");
        return;
      }
    }

    // Crear inscripción
    const { data, error } = await supabase.from("enrollments").insert({
      user_id: userId || null,
      course_id: courseId,
      user_email: userEmail,
      payment_id: paymentId,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select();

    if (error) {
      console.error("❌ [WEBHOOK] Error en BD:", error.message, error.details);
      throw error;
    }

    console.log("✅ [WEBHOOK] Inscripción creada:", data?.[0]?.id);
  } catch (error) {
    console.error("❌ [WEBHOOK] Error en createEnrollment:", error);
    throw error;
  }
}
