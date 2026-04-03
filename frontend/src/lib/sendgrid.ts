// Service for sending emails via Resend (simpler and more reliable)
export async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  htmlContent: string,
  fromEmail?: string,
  fromName?: string,
  replyTo?: string
) {
  // Use Resend API directly from frontend (key stored in .env.local, never hardcoded)
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY as string;
  
  if (!resendApiKey) {
    throw new Error("Resend API key not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "noreply@fudensa.com",
      to: to,
      subject: subject,
      html: htmlContent,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Resend error: ${JSON.stringify(errorData)}`);
  }

  return response;
}

