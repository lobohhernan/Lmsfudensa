const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

async function sendEmailViaSendGrid(
  apiKey: string,
  to: string,
  subject: string,
  htmlContent: string,
  fromEmail: string = "noreply@fudensa.com",
  fromName: string = "FUDENSA",
  replyTo?: string
) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      content: [
        {
          type: "text/html",
          value: htmlContent,
        },
      ],
      reply_to: replyTo ? { email: replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`SendGrid error: ${response.status} - ${errorData}`);
  }

  return response;
}

export const handler = async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contactMessage: ContactMessage = await req.json();

    // Get SendGrid API key from environment
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    // Prepare email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nuevo Mensaje de Contacto</h2>
        <p><strong>Nombre:</strong> ${contactMessage.name}</p>
        <p><strong>Email:</strong> ${contactMessage.email}</p>
        <p><strong>Teléfono:</strong> ${contactMessage.phone || "No proporcionado"}</p>
        <p><strong>Asunto:</strong> ${contactMessage.subject}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <h3>Mensaje:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${contactMessage.message}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Recibido: ${new Date().toLocaleString("es-AR")}</p>
      </div>
    `;

    // Send email via SendGrid
    await sendEmailViaSendGrid(
      sendGridApiKey,
      "fudensa.fundacion@gmail.com",
      `Nuevo mensaje de contacto: ${contactMessage.subject}`,
      emailHtml,
      "noreply@fudensa.com",
      "FUDENSA",
      contactMessage.email
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error sending email:", errorMessage);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

