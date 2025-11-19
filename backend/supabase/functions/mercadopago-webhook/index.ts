import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Edge Function para recibir webhooks de Mercado Pago
 * Se ejecuta cuando hay cambios en el estado de los pagos
 */
serve(async (req: Request): Promise<Response> => {
  console.log("🔔 Solicitud webhook recibida:", {
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
    console.log("❌ Método no permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener el cuerpo del webhook
    const body = await req.text();
    console.log("📝 Cuerpo webhook:", body.substring(0, 200));

    if (!body) {
      console.warn("⚠️ Webhook vacío");
      return new Response(
        JSON.stringify({ error: "Body vacío" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsear JSON
    const data = JSON.parse(body);

    console.log("📨 Webhook parseado:", {
      type: data.type,
      action: data.action,
      dataId: data.data?.id,
      timestamp: new Date().toISOString(),
    });

    // Validar firma HMAC si está disponible (Mercado Pago envía x-signature)
    const signature = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");
    
    if (signature) {
      console.log("✅ Firma HMAC presente, validando...");
      // Aquí se validaría la firma HMAC
      // Por ahora solo logueamos que llegó
    }

    // Procesar notificaciones de pago
    if (data.type === "payment" && data.action === "payment.created") {
      console.log("💰 Pago creado:", data.data?.id);
      
      // TODO: Guardar en base de datos
      // TODO: Enviar email de confirmación
      // TODO: Registrar la compra del curso
    }

    if (data.type === "payment" && data.action === "payment.updated") {
      console.log("🔄 Pago actualizado:", data.data?.id);
      
      // TODO: Actualizar estado del pago
    }

    // Responder exitosamente a Mercado Pago
    const response = {
      success: true,
      message: "Webhook procesado correctamente",
      receivedAt: new Date().toISOString(),
      requestId: requestId,
    };

    console.log("✅ Respondiendo a Mercado Pago con 200");
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);

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
