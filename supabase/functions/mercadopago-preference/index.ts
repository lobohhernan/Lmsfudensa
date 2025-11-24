import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface MercadoPagoRequest {
  courseId: string;
  courseTitle: string;
  price: number;
  userEmail: string;
  userName?: string;
}

interface MercadoPagoResponse {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  error?: string;
}

/**
 * Edge Function para crear preferencias de pago en Mercado Pago
 * Esto se ejecuta en el backend de Supabase de forma segura
 */
serve(async (req: Request): Promise<Response> => {
  // Configurar CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener datos del request
    const requestData: MercadoPagoRequest = await req.json();

    // Validar datos requeridos
    if (!requestData.courseId || !requestData.courseTitle || !requestData.price || !requestData.userEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Faltan campos requeridos: courseId, courseTitle, price, userEmail" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el Access Token desde variables de entorno
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("❌ Access Token no configurado");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuración de servidor incompleta" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construir la preferencia de pago
    const baseUrl = req.headers.get("origin") || "http://localhost:5173";
    
    const preference = {
      items: [
        {
          id: requestData.courseId,
          title: requestData.courseTitle,
          quantity: 1,
          unit_price: Math.round(requestData.price),
          currency_id: "ARS",
        },
      ],
      payer: {
        email: requestData.userEmail,
        first_name: requestData.userName?.split(" ")[0] || "Cliente",
        last_name: requestData.userName?.split(" ")[1] || "",
      },
      back_urls: {
        success: `${baseUrl}/#/checkout/success`,
        failure: `${baseUrl}/#/checkout/failure`,
        pending: `${baseUrl}/#/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: `FUDENSA-${requestData.courseId}-${Date.now()}`,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`, // Para webhook de notificaciones
    };

    console.log("📝 Creando preferencia de pago:", {
      courseId: requestData.courseId,
      courseTitle: requestData.courseTitle,
      price: requestData.price,
      email: requestData.userEmail,
    });

    // Llamar a la API de Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    // Verificar respuesta de Mercado Pago
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error de Mercado Pago:", response.status, errorData);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error de Mercado Pago: ${response.status}` 
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Procesar respuesta exitosa
    const preferenceData = await response.json();

    console.log("✅ Preferencia creada exitosamente:", preferenceData.id);

    const responseData: MercadoPagoResponse = {
      success: true,
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Error en Edge Function:", error);

    return new Response(
      JSON.stringify({ 
        success: false, 
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
