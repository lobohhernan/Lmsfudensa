// Para desplegar esta función en Supabase:
// supabase functions deploy mercadopago-preference

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

interface PreferenceRequest {
  courseId: string;
  courseTitle: string;
  price: number;
  userEmail: string;
  userName?: string;
}

serve(async (req) => {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: PreferenceRequest = await req.json();
    
    const { courseId, courseTitle, price, userEmail, userName } = body;

    // Validar datos
    if (!courseId || !courseTitle || !price || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Datos incompletos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Token de Mercado Pago no configurado" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener la URL base desde los headers
    const origin = req.headers.get("origin") || "https://fudensa.netlify.app";

    // Crear preferencia en Mercado Pago
    const preferenceData = {
      items: [
        {
          id: courseId,
          title: courseTitle,
          quantity: 1,
          unit_price: Math.round(price),
          currency_id: "ARS", // Peso argentino
        },
      ],
      payer: {
        email: userEmail,
        first_name: userName?.split(" ")[0] || "Cliente",
        last_name: userName?.split(" ")[1] || "",
      },
      back_urls: {
        success: `${origin}/#/checkout/success`,
        failure: `${origin}/#/checkout/failure`,
        pending: `${origin}/#/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: `FUDENSA-${courseId}-${Date.now()}`,
      notification_url: `${origin}/api/webhooks/mercadopago`,
    };

    // Llamar a la API de Mercado Pago
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferenceData),
      }
    );

    if (!mpResponse.ok) {
      const error = await mpResponse.text();
      console.error("Error de Mercado Pago:", error);
      throw new Error(`Mercado Pago error: ${mpResponse.status}`);
    }

    const preference = await mpResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
