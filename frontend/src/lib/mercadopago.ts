// Servicio para integración con Mercado Pago

interface MercadoPagoPreference {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url?: string;
}

/**
 * Inicializar Mercado Pago en el cliente
 */
export const initMercadoPago = async () => {
  try {
    const { loadMercadoPago } = await import("@mercadopago/sdk-js");
    
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error("❌ Public Key de Mercado Pago no configurada");
      return null;
    }
    
    await loadMercadoPago();
    console.log("✅ Mercado Pago SDK cargado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al cargar Mercado Pago SDK:", error);
    return null;
  }
};

/**
 * Crear preferencia de pago en el backend de Supabase
 * (Llamar a una Edge Function de Supabase)
 */
export const createMercadoPagoPreference = async (
  courseId: string,
  courseTitle: string,
  price: number,
  userEmail: string,
  userName?: string
): Promise<string | null> => {
  try {
    // Construir URLs de retorno basadas en el sitio actual
    const baseUrl = window.location.origin;
    
    const preference: MercadoPagoPreference = {
      items: [
        {
          id: courseId,
          title: courseTitle,
          quantity: 1,
          unit_price: Math.round(price),
        },
      ],
      payer: {
        email: userEmail,
        first_name: userName?.split(" ")[0] || "Cliente",
        last_name: userName?.split(" ")[1] || "",
      },
      back_urls: {
        success: `${baseUrl}/#/checkout/success`,
        failure: `${baseUrl}/#/checkout/failure`,
        pending: `${baseUrl}/#/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`, // Ajusta según tu setup
    };

    // Aquí llamarías a una Edge Function de Supabase o a tu servidor
    // Por ahora, retornamos un mock. Lo implementaremos después
    console.log("📝 Preferencia de pago:", preference);
    
    // TODO: Implementar llamada al backend para crear preferencia
    return null;
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return null;
  }
};

/**
 * Redirigir a Mercado Pago para pagar
 */
export const redirectToMercadoPago = (preferenceId: string) => {
  if (!preferenceId) {
    console.error("❌ ID de preferencia inválido");
    return;
  }

  // Redirigir a la página de pago de Mercado Pago
  window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
};

/**
 * Obtener información de pago desde Mercado Pago
 * (Para verificar el estado del pago)
 */
export const getMercadoPagoPaymentStatus = async (paymentId: string) => {
  try {
    // Esta llamada se hace desde el backend con el Access Token
    // No se puede hacer desde el cliente directamente por seguridad
    console.log("📦 Payment ID:", paymentId);
    
    // TODO: Implementar llamada al backend
    return null;
  } catch (error) {
    console.error("❌ Error al obtener estado:", error);
    return null;
  }
};

export default {
  initMercadoPago,
  createMercadoPagoPreference,
  redirectToMercadoPago,
  getMercadoPagoPaymentStatus,
};
