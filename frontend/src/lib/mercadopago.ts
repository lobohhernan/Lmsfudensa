// Servicio para integración con Mercado Pago - VERSIÓN MINIMAL OFICIAL

import { supabase } from "./supabase";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

/**
 * Inicializar SDK de Mercado Pago (cargado desde CDN en index.html)
 */
export const initMercadoPago = async () => {
  try {
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    if (!publicKey) {
      console.error("❌ Public Key de Mercado Pago no configurada");
      return null;
    }

    if (typeof window !== 'undefined' && window.MercadoPago) {
      console.log("✅ Mercado Pago SDK disponible");
      return true;
    }

    console.error("❌ SDK de Mercado Pago no disponible");
    return null;
  } catch (error) {
    console.error("❌ Error al inicializar Mercado Pago:", error);
    return null;
  }
};

/**
 * Crear preferencia de pago (Edge Function maneja la comunicación con MP)
 */
export const createMercadoPagoPreference = async (
  courseId: string,
  courseTitle: string,
  price: number,
  userEmail: string
): Promise<string | null> => {
  try {
    console.log("🛒 Creando preferencia de pago:", { courseId, courseTitle, price, userEmail });
    
    if (!supabase) {
      throw new Error("Supabase no inicializado");
    }

    const baseUrl = window.location.origin;
    console.log("📍 Base URL:", baseUrl);
    
    const { data, error } = await supabase.functions.invoke(
      "mercadopago-preference",
      {
        body: {
          courseId,
          courseTitle,
          price,
          userEmail,
          baseUrl,
        },
      }
    );

    if (error) {
      console.error("❌ Error en Edge Function:", error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || "Error al crear preferencia");
    }

    console.log("✅ Preferencia creada:", data.preferenceId);
    return data.initPoint || null;
  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
};

/**
 * Redirigir a Mercado Pago - auto_return maneja el regreso automaticamente
 */
export const redirectToMercadoPago = (initPoint: string) => {
  if (!initPoint) {
    console.error("❌ Init Point inválido");
    return;
  }

  console.log("🔄 Redirigiendo a Mercado Pago...");
  window.location.href = initPoint;
};

export default {
  initMercadoPago,
  createMercadoPagoPreference,
  redirectToMercadoPago,
};
