import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, cache-control, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Supabase Admin API credentials from environment
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

// Frontend URL for redirect
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://fudensa.pages.dev";

async function sendEmailViaResend(
  to: string,
  subject: string,
  htmlContent: string
) {
  console.log(`📨 Calling Resend API for email: ${to}`);
  
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    console.log(`📊 Resend API response status: ${response.status}`);

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ Resend API error (${response.status}):`, JSON.stringify(responseData));
      throw new Error(`Resend error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    console.log("✅ Resend API response successful");
    return responseData;
  } catch (err) {
    console.error("❌ Error calling Resend API:", err);
    throw err;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("📧 Starting send-reset-email handler");
    
    // Validate environment variables
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      throw new Error("RESEND_API_KEY no configurada");
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
      throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
    }

    if (!SUPABASE_URL) {
      console.error("❌ SUPABASE_URL not configured");
      throw new Error("SUPABASE_URL no configurada");
    }

    // Parse request body
    let requestData: { email?: string };
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { email } = requestData;

    if (!email || typeof email !== "string") {
      console.error("❌ Email missing or invalid in request");
      return new Response(
        JSON.stringify({ error: "Email requerido" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`📧 Processing reset request for email: ${email.substring(0, 3)}...`);

    // Initialize Supabase Admin client
    let adminClient;
    try {
      adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      console.log("✅ Supabase client initialized");
    } catch (clientError) {
      console.error("❌ Failed to create Supabase client:", clientError);
      throw new Error("Failed to initialize Supabase client");
    }

    // Generate recovery link using Supabase Admin API
    console.log("🔑 Generating recovery link...");
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${FRONTEND_URL}/reset-password`,
      },
    });

    if (error) {
      console.error("⚠️ Supabase generateLink error:", error);
      // Don't reveal if user exists or not (security)
      return new Response(
        JSON.stringify({
          success: true,
          message: "Si el email existe, recibirás un link de recuperación",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (!data || !data.properties) {
      console.error("❌ No data returned from generateLink");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Si el email existe, recibirás un link de recuperación",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const resetLink = data.properties.action_link;

    if (!resetLink) {
      console.error("❌ No reset link generated");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Si el email existe, recibirás un link de recuperación",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("✅ Recovery link generated successfully");

    // Prepare email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #1e467c 0%, #2c5a9e 100%); padding: 24px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🔐 Recupera tu Contraseña</h1>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Recibimos una solicitud para cambiar la contraseña de tu cuenta FUDENSA.
          </p>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Haz clic en el botón a continuación para establecer una nueva contraseña:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Cambiar Contraseña
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
            O copia y pega este link en tu navegador:<br>
            <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; word-break: break-all;">${resetLink}</code>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 10px 0;">
            ⏰ Este link expirará en 1 hora.<br>
            Si no solicitaste este cambio, puedes ignorar este email.
          </p>
        </div>

        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© FUDENSA - Plataforma de Educación en Línea</p>
          <p style="margin: 0;">
            <a href="https://fudensa.pages.dev" style="color: #1e467c; text-decoration: none;">fudensa.pages.dev</a>
          </p>
        </div>
      </div>
    `;

    // Send email via Resend
    console.log("📤 Sending email via Resend...");
    try {
      await sendEmailViaResend(
        email,
        "Recupera tu contraseña - FUDENSA",
        emailHtml
      );
      console.log("✅ Email sent successfully via Resend");
    } catch (sendError: unknown) {
      const sendErrorMessage = sendError instanceof Error ? sendError.message : String(sendError);
      console.error("❌ Resend delivery error:", sendErrorMessage);

      return new Response(
        JSON.stringify({
          success: false,
          message: "No pudimos enviar el email de recuperación. Intenta más tarde.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log("✅ Password reset email workflow completed successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Si el email existe en nuestra base de datos, recibirás un link de recuperación",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Unexpected error in send-reset-email:", errorMessage);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return new Response(
      JSON.stringify({
        success: false,
        message: "No pudimos procesar tu solicitud en este momento. Intenta más tarde.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
