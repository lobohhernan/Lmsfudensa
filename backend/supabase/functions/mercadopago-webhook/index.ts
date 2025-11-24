import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Inicializar cliente Supabase con service role
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Edge Function para recibir webhooks de Mercado Pago
 * Se ejecuta cuando hay cambios en el estado de los pagos
 */
serve(async (req: Request): Promise<Response> => {
  console.log("🔔 [WEBHOOK] Solicitud webhook recibida:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // Configurar CORS - permitir que Mercado Pago nos contacte
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, x-signature",
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

  // Solo permitir POST para webhooks
  if (req.method !== "POST") {
    console.log("❌ [WEBHOOK] Método no permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener el cuerpo del webhook
    const body = await req.text();
    console.log("📝 [WEBHOOK] Cuerpo:", body.substring(0, 300));

    if (!body) {
      console.warn("⚠️ [WEBHOOK] Body vacío");
      return new Response(
        JSON.stringify({ error: "Body vacío" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsear JSON
    const data = JSON.parse(body);

    console.log("📨 [WEBHOOK] Parseado:", {
      type: data.type,
      action: data.action,
      dataId: data.data?.id,
    });

    // Solo procesamos notificaciones de pago
    if (data.type !== "payment") {
      console.log("⏭️ [WEBHOOK] Ignorando tipo:", data.type);
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener ID del pago
    const paymentId = data.data?.id;
    if (!paymentId) {
      console.warn("⚠️ [WEBHOOK] No hay ID de pago");
      return new Response(JSON.stringify({ success: true, noPaymentId: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("💰 [WEBHOOK] Procesando pago:", paymentId);

    // Obtener detalles del pago desde Mercado Pago API
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
    
    console.log("🔍 [WEBHOOK] Obteniendo detalles del pago desde MP API...");
    
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpToken}`,
      },
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("❌ [WEBHOOK] Error obteniendo pago de MP:", mpResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "No se pudo obtener el pago de MP" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const paymentData = await mpResponse.json();
    console.log("📊 [WEBHOOK] Status del pago:", paymentData.status);
    console.log("📊 [WEBHOOK] External reference:", paymentData.external_reference);

    // Solo procesar pagos aprobados
    if (paymentData.status !== "approved") {
      console.log("⏭️ [WEBHOOK] Pago no aprobado, status:", paymentData.status);
      return new Response(JSON.stringify({ success: true, notApproved: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parsear external_reference (contiene JSON con courseId y userId)
    let courseId: string;
    let userId: string;
    
    try {
      const externalRefData = JSON.parse(paymentData.external_reference);
      courseId = externalRefData.courseId;
      userId = externalRefData.userId;
      console.log("✅ [WEBHOOK] Parsed external_reference:", { courseId, userId });
    } catch (e) {
      // Si falla el parse, asumir que es solo courseId (compatibilidad backwards)
      courseId = paymentData.external_reference;
      console.warn("⚠️ [WEBHOOK] No se pudo parsear external_reference, usando como courseId:", courseId);
      
      // Sin userId, intentar obtener por email
      const userEmail = paymentData.payer?.email;
      if (!userEmail) {
        console.error("❌ [WEBHOOK] No hay userId ni email disponible");
        return new Response(
          JSON.stringify({ error: "No se puede identificar al usuario" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Obtener el usuario por email
      console.log("🔎 [WEBHOOK] Buscando usuario por email...");
      
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !users) {
        console.warn("⚠️ [WEBHOOK] Usuario no encontrado:", userEmail);
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      userId = users.id;
    }

    console.log("✅ [WEBHOOK] Datos extraídos:", { courseId, userId });

    // Crear la inscripción
    const userEmail = paymentData.payer?.email || "unknown@mercadopago.com";
    await createEnrollment(userId, courseId, userEmail, paymentId);

    console.log("✅ [WEBHOOK] Pago procesado correctamente");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pago procesado correctamente",
        paymentId: paymentId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ [WEBHOOK] Error general:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

/**
 * Crear inscripción del usuario en el curso
 * Maneja el caso de duplicados
 */
async function createEnrollment(
  userId: string,
  courseId: string,
  userEmail: string,
  paymentId: string
) {
  console.log("📝 [WEBHOOK] Creando inscripción:", { userId, courseId });

  // Primero verificar si ya existe la inscripción
  const { data: existingEnrollment, error: checkError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (existingEnrollment) {
    console.warn("⚠️ [WEBHOOK] Inscripción ya existe, actualizando...");
    
    // Actualizar si ya existe
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: "active",
        payment_id: paymentId,
        enrolled_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Error actualizando inscripción:", updateError);
      throw updateError;
    }

    console.log("✅ [WEBHOOK] Inscripción actualizada");
    return;
  }

  // Crear inscripción nueva
  const { data: enrollment, error: enrollError } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      status: "active",
      payment_id: paymentId,
      enrolled_at: new Date().toISOString(),
    })
    .select();

  if (enrollError) {
    // Si el error es por duplicate key, significa que otra instancia la creó
    if (enrollError.message?.includes("duplicate")) {
      console.warn("⚠️ [WEBHOOK] Inscripción creada por otro proceso, ignorando error");
      return;
    }
    
    console.error("❌ [WEBHOOK] Error creando inscripción:", enrollError);
    throw enrollError;
  }

  console.log("✅ [WEBHOOK] Inscripción creada:", enrollment?.[0]?.id);
}
