import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Función para verificar la firma del webhook de Mercado Pago
 * Usa HMAC-SHA256 para validar que el webhook viene de Mercado Pago
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Convertir la clave secreta a bytes
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(secret);

    // Crear la clave HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Firmar el payload
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    // Convertir a hexadecimal
    const calculatedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Comparar firmas
    return calculatedSignature === signature.toLowerCase();
  } catch (error) {
    console.error("❌ Error verificando firma:", error);
    return false;
  }
}

/**
 * Edge Function para recibir webhooks de Mercado Pago
 * Se ejecuta cuando hay cambios en el estado de los pagos
 */
serve(async (req: Request): Promise<Response> => {
  // Configurar CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Signature",
      },
    });
  }

  // Solo permitir POST y GET
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Para verificar que el webhook está funcionando
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ status: "webhook activo" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener la firma del header
    const signature = req.headers.get("X-Signature");
    const requestId = req.headers.get("X-Request-Id");

    // Obtener el body como texto para verificar la firma
    const bodyText = await req.text();
    const data = JSON.parse(bodyText);

    console.log("📨 Webhook recibido:", {
      signature: signature ? "✅ Presente" : "❌ Faltante",
      requestId,
      type: data.type,
      action: data.action,
    });

    // Verificar la firma si está disponible
    const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(
        bodyText,
        signature,
        webhookSecret
      );

      if (!isValid) {
        console.error("❌ Firma de webhook inválida");
        return new Response(
          JSON.stringify({ error: "Firma inválida" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      console.log("✅ Firma verificada correctamente");
    } else {
      console.warn("⚠️ No se pudo verificar la firma del webhook");
    }

    // Obtener datos del webhook
    // (ya parsed arriba)

    console.log("📨 Webhook recibido de Mercado Pago:", {
      type: data.type,
      action: data.action,
      dataId: data.data?.id,
      timestamp: new Date().toISOString(),
    });

    // Procesar notificaciones de pago
    if (data.type === "payment" && data.action === "payment.created") {
      console.log("💰 Pago creado:", data.data?.id);
      
      // Aquí puedes:
      // 1. Guardar el pago en la base de datos
      // 2. Actualizar el estado del pedido
      // 3. Enviar email de confirmación
      // 4. Registrar la compra del curso

      const paymentId = data.data?.id;
      
      // Ejemplo: Log del evento
      console.log(`✅ Procesando pago #${paymentId}`);
    }

    if (data.type === "payment" && data.action === "payment.updated") {
      console.log("🔄 Pago actualizado:", data.data?.id);
      
      // Procesar cambios en el estado del pago
      const paymentId = data.data?.id;
      console.log(`📝 Actualizando pago #${paymentId}`);
    }

    // Responder a Mercado Pago que recibimos la notificación
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook procesado correctamente",
        receivedAt: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      }
    );
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      }
    );
  }
});
