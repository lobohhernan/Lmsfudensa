import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Headers CORS
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    console.log("📥 [MP] Recibido request:", req.method);

    // Parse body
    const body = await req.json();
    console.log("📥 [MP] Body:", body);

    // Get token
    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");


    if (!token) {
      console.log("[MP] Token no configurado");
      return new Response(
        JSON.stringify({ success: false, error: "Token no configurado" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Detect base URL from request body (preferred) or headers
    let baseUrl = body.baseUrl || req.headers.get("origin") || "http://localhost:3000";
    
    // CRITICAL FIX: Remove trailing slash - Mercado Pago is strict about URL format
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log("📌 [MP] Base URL recibido en body:", body.baseUrl);
    console.log("📌 [MP] Origin header:", req.headers.get("origin"));
    console.log("📌 [MP] Base URL final a usar:", baseUrl);

    // Build preference with official required fields ONLY
    const preference = {
      items: [
        {
          id: body.courseId,
          title: body.courseTitle,
          quantity: 1,
          unit_price: Math.round(body.price),
        },
      ],
      payer: {
        email: body.userEmail,
      },
      back_urls: {
        success: `${baseUrl}/`,
        failure: `${baseUrl}/`,
        pending: `${baseUrl}/`,
      },
      auto_return: "approved",
      external_reference: JSON.stringify({
        courseId: body.courseId,
        userId: body.userId,
      }),
    };




    // Call MP API
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preference),
      }
    );



    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.log("[MP] Error MP:", errorText);

      return new Response(
        JSON.stringify({
          success: false,
          error: `MP API error: ${mpResponse.status}`,
          details: errorText,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const mpData = await mpResponse.json();


    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: mpData.id,
        initPoint: mpData.init_point,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[MP] Error:", error);
    const msg = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: msg,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
