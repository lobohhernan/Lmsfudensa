// Servicio para integración con Mercado Pago

import { supabase } from "./supabase";

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
 * Crear preferencia de pago llamando a una Edge Function de Supabase
 * La Edge Function maneja la comunicación con Mercado Pago de forma segura
 */
export const createMercadoPagoPreference = async (
  courseId: string,
  courseTitle: string,
  price: number,
  userEmail: string,
  userName?: string
): Promise<string | null> => {
  try {
    console.log("📝 Creando preferencia de pago en backend...");
    
    // Llamar a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke(
      "mercadopago-preference",
      {
        body: {
          courseId,
          courseTitle,
          price,
          userEmail,
          userName,
        },
      }
    );

    if (error) {
      console.error("❌ Error en Edge Function:", error);
      throw new Error(error.message);
    }

    if (!data?.success) {
      console.error("❌ Error al crear preferencia:", data?.error);
      throw new Error(data?.error || "Error desconocido");
    }

    console.log("✅ Preferencia creada:", data.preferenceId);
    return data.initPoint || null;
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return null;
  }
};

/**
 * Redirigir a Mercado Pago para pagar
 */
export const redirectToMercadoPago = (initPoint: string) => {
  if (!initPoint) {
    console.error("❌ Init Point inválido");
    return;
  }

  // Redirigir a la página de pago de Mercado Pago
  window.location.href = initPoint;
};

/**
 * Obtener información de pago desde Mercado Pago
 */
export const getMercadoPagoPaymentStatus = async (paymentId: string) => {
  try {
    console.log("📦 Payment ID:", paymentId);
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
