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
    console.log("[WEBHOOK] Método no permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener el cuerpo del webhook
    const body = await req.text();


    if (!body) {

      return new Response(
        JSON.stringify({ error: "Body vacío" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsear JSON
    const data = JSON.parse(body);


      type: data.type,
      action: data.action,
      dataId: data.data?.id,
    });

    // Solo procesamos notificaciones de pago
    if (data.type !== "payment") {

      return new Response(JSON.stringify({ success: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener ID del pago
    const paymentId = data.data?.id;
    if (!paymentId) {

      return new Response(JSON.stringify({ success: true, noPaymentId: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("💰 [WEBHOOK] Procesando pago:", paymentId);

    // Obtener detalles del pago desde Mercado Pago API
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
    

    
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpToken}`,
      },
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("[WEBHOOK] Error obteniendo pago de MP:", mpResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "No se pudo obtener el pago de MP" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const paymentData = await mpResponse.json();



    // Parsear external_reference (contiene JSON con courseId y userId)
    let courseId: string;
    let userId: string;
    
    try {
      const externalRefData = JSON.parse(paymentData.external_reference);
      courseId = externalRefData.courseId;
      userId = externalRefData.userId;

    } catch (e) {
      // Si falla el parse, asumir que es solo courseId (compatibilidad backwards)
      courseId = paymentData.external_reference;

      
      // Sin userId, intentar obtener por email
      const userEmail = paymentData.payer?.email;
      if (!userEmail) {
        console.error("[WEBHOOK] No hay userId ni email disponible");
        return new Response(
          JSON.stringify({ error: "No se puede identificar al usuario" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Obtener el usuario por email
      console.log("🔎 [WEBHOOK] Buscando usuario por email...");
      
      const { data: profile, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !profile) {

        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      userId = profile.id;
    }



    const userEmail = paymentData.payer?.email || "unknown@mercadopago.com";
    const payerName = [
      paymentData.payer?.first_name || "",
      paymentData.payer?.last_name  || "",
    ].join(" ").trim() || null;

    // ── Persistir pago en la tabla payments (todos los estados) ──────────
    const validStatus = ["approved", "pending", "rejected", "cancelled"];
    const paymentStatus = validStatus.includes(paymentData.status)
      ? paymentData.status
      : "pending";

    const { error: upsertError } = await supabase
      .from("payments")
      .upsert(
        {
          user_id:           userId,
          course_id:         courseId,
          mp_payment_id:     String(paymentId),
          mp_preference_id:  paymentData.preference_id || null,
          status:            paymentStatus,
          amount:            paymentData.transaction_amount ?? 0,
          currency:          paymentData.currency_id || "ARS",
          payer_email:       userEmail,
          payer_name:        payerName,
          payment_method:    paymentData.payment_method_id || null,
          updated_at:        new Date().toISOString(),
        },
        { onConflict: "mp_payment_id" }
      );

    if (upsertError) {
      // Log but don't block—enrollment is more critical

    } else {

    }

    // ── Crear enrollment solo para pagos aprobados ───────────────────────
    if (paymentData.status !== "approved") {

      return new Response(JSON.stringify({ success: true, status: paymentData.status }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await createEnrollment(userId, courseId, userEmail, paymentId);



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
    console.error("[WEBHOOK] Error general:", error);

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


  // Primero verificar si ya existe la inscripción
  const { data: existingEnrollment, error: checkError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (existingEnrollment) {

    
    // Actualizar si ya existe (solo enrolled_at, sin status ni payment_id que no existen)
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        enrolled_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (updateError) {
      console.error("[WEBHOOK] Error actualizando inscripción:", updateError);
      throw updateError;
    }


    return;
  }

  // Crear inscripción nueva con TODOS los campos
  const enrollmentData: any = {
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    user_email: userEmail,
    payment_id: String(paymentId),
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };



  const { data: enrollment, error: enrollError } = await supabase
    .from("enrollments")
    .insert(enrollmentData)
    .select();

  if (enrollError) {
    // Si el error es por duplicate key, significa que otra instancia la creó
    if (enrollError.message?.includes("duplicate") || enrollError.code === "23505") {

      
      // Intentar actualizar con los datos de pago
      const { error: updateErr } = await supabase
        .from("enrollments")
        .update({
          user_email: userEmail,
          payment_id: String(paymentId),
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("course_id", courseId);
      
      if (updateErr) {
        console.error("[WEBHOOK] Error actualizando después de duplicate:", updateErr);
        throw updateErr;
      }
      

      return;
    }
    
    console.error("[WEBHOOK] Error creando inscripción:", {
      message: enrollError.message,
      code: enrollError.code,
      details: enrollError.details,
    });
    throw enrollError;
  }


    id: enrollment?.[0]?.id,
    user_id: enrollment?.[0]?.user_id,
    course_id: enrollment?.[0]?.course_id,
    payment_id: enrollment?.[0]?.payment_id,
  });
}
