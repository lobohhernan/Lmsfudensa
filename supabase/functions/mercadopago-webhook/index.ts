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

    // ⚡ RESPUESTA INMEDIATA (sin esperar procesamiento)
    // Mercado Pago necesita respuesta rápida (máx 2-3 segundos)
    // El procesamiento se hace en background
    
    // IMPORTANTE: Responder INMEDIATAMENTE para que auto_return no espere
    const responsePromise = successResponse({ 
      status: "accepted", // Aceptado para procesamiento async
      paymentId,
      message: "Pago recibido, procesando inscripción en background"
    });

    // Procesar en background (sin esperar)
    processPaymentAsync(paymentId, data)
      .catch(err => console.error("❌ [WEBHOOK] Error async:", err));

    return responsePromise;
  } catch (error) {
    console.error("❌ [WEBHOOK] Error general:", error);
    return successResponse({ status: "general_error", error: true });
  }

/**
 * Procesar pago de forma ASINCRÓNICA (en background)
 * No bloquea la respuesta HTTP
 */
async function processPaymentAsync(paymentId: string, data: unknown): Promise<void> {
  try {
    console.log("🔄 [WEBHOOK] Iniciando procesamiento async para:", paymentId);

    // Obtener detalles del pago desde MP
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("❌ [WEBHOOK] No hay Access Token de MP");
      return;
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
      return;
    }

    const paymentData = await mpResponse.json();
    console.log("📊 [WEBHOOK] Status del pago:", paymentData.status);

    // Solo procesar pagos aprobados
    if (paymentData.status !== "approved") {
      console.log("⏭️ [WEBHOOK] Pago no aprobado:", paymentData.status);
      return;
    }

    // Extraer datos
    const userEmail = paymentData.payer?.email;
    const payerName = paymentData.payer?.first_name || "Usuario";
    
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
      return;
    }

    // Crear inscripción
    try {
      await createEnrollment(userId, courseId, userEmail, paymentId);
      console.log("✅ [WEBHOOK] Inscripción procesada exitosamente (async)");
    } catch (enrollError) {
      console.error("❌ [WEBHOOK] Error en inscripción:", enrollError);
    }
  } catch (error) {
    console.error("❌ [WEBHOOK] Error en procesamiento async:", error);
  }
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
  console.log("📝 [WEBHOOK] Creando inscripción:", { userId, courseId, userEmail });

  try {
    // Si tenemos userId, verificar que la inscripción no exista
    if (userId) {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) {
        console.log("⚠️ [WEBHOOK] Inscripción ya existe para userid:", userId);
        return;
      }

      // Crear inscripción (solo con los campos que existen en la tabla)
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select();

      if (error) {
        console.error("❌ [WEBHOOK] Error creando inscripción:", error.message, error.details);
        throw error;
      }

      console.log("✅ [WEBHOOK] Inscripción creada para user_id:", userId, data?.[0]?.id);
    } else {
      // Si no tenemos userId, registrar el pago pero NO crear inscripción automática
      console.warn("⚠️ [WEBHOOK] No hay user_id, registrando pago sin inscripción");
      console.log("   Email del pagador:", userEmail);
      console.log("   Payment ID:", paymentId);
      // El usuario podría estar sin autenticar en el dashboard
      return;
    }
  } catch (error) {
    console.error("❌ [WEBHOOK] Error en createEnrollment:", error);
    throw error;
  }
}
