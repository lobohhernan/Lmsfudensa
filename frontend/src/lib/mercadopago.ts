// Servicio para integración con Mercado Pago

import { supabase } from "./supabase";

// Declarar el tipo de window.MercadoPago
declare global {
  interface Window {
    MercadoPago?: any;
  }
}

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
  notification_url?: string;
  external_reference?: string;
}

/**
 * Inicializar Mercado Pago en el cliente
 */
export const initMercadoPago = async () => {
  try {
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error("❌ Public Key de Mercado Pago no configurada");
      return null;
    }

    // El SDK se carga desde el CDN en index.html
    // Verificar que window.MercadoPago está disponible
    if (typeof window !== 'undefined' && window.MercadoPago) {
      console.log("✅ Mercado Pago SDK disponible");
      return true;
    }

    // Si no está disponible, esperar un poco e intentar de nuevo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (typeof window !== 'undefined' && window.MercadoPago) {
      console.log("✅ Mercado Pago SDK cargado correctamente");
      return true;
    }

    console.error("❌ SDK de Mercado Pago no disponible en window.MercadoPago");
    return null;
  } catch (error) {
    console.error("❌ Error al inicializar Mercado Pago:", error);
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
    console.log("🌍 [MP] createMercadoPagoPreference iniciado");
    console.log("🌍 [MP] Parámetros recibidos:", { courseId, courseTitle, price, userEmail, userName });
    
    console.log("📝 Creando preferencia de pago en backend...");
    
    // Verificar que Supabase esté disponible
    if (!supabase) {
      console.error("🌍 [MP] ❌ Supabase no disponible");
      throw new Error("Supabase no inicializado");
    }

    console.log("🌍 [MP] Llamando a Edge Function: mercadopago-preference");
    
    // Obtener la URL base actual del navegador
    let baseUrl = window.location.origin;
    
    // En Netlify, asegurar que usamos HTTPS
    if (window.location.hostname === 'fudensa.netlify.app' || window.location.protocol === 'https:') {
      baseUrl = baseUrl.replace('http://', 'https://');
    }
    
    console.log("🌍 [MP] Base URL del frontend:", baseUrl);
    console.log("🌍 [MP] Hostname:", window.location.hostname);
    console.log("🌍 [MP] Protocol:", window.location.protocol);
    
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
          baseUrl, // Enviar la URL base del frontend
        },
      }
    );

    console.log("🌍 [MP] Respuesta de Edge Function:", { data, error });

    if (error) {
      console.error("🌍 [MP] ❌ Error en Edge Function:", error);
      console.error("🌍 [MP] ❌ Error details:", error instanceof Error ? error.message : JSON.stringify(error));
      throw new Error(error.message || JSON.stringify(error));
    }

    if (!data) {
      console.error("🌍 [MP] ❌ Data es null en respuesta");
      throw new Error("Respuesta vacía de Edge Function");
    }

    if (!data?.success) {
      console.error("🌍 [MP] ❌ Error al crear preferencia - Success false");
      console.error("🌍 [MP] ❌ Error message:", data?.error);
      console.error("🌍 [MP] ❌ Error details:", data?.details);
      throw new Error(data?.error || "Error desconocido al crear preferencia");
    }

    console.log("🌍 [MP] ✅ Preferencia creada:", data.preferenceId);
    console.log("🌍 [MP] 📍 Init Point:", data.initPoint);
    
    return data.initPoint || null;
  } catch (error) {
    console.error("🌍 [MP] ❌ Error al crear preferencia:", error);
    console.error("🌍 [MP] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("🌍 [MP] Error message:", error instanceof Error ? error.message : String(error));
    return null;
  }
};

/**
 * Configurar listener para detectar completitud del pago vía webhook
 * Como Mercado Pago no soporta auto_return en localhost, usamos polling
 */
export const setupPaymentPolling = (courseId: string, maxWaitSeconds: number = 120): Promise<boolean> => {
  return new Promise((resolve) => {
    let pollCount = 0;
    const maxPolls = Math.ceil(maxWaitSeconds / 2); // Polear cada 2 segundos
    
    const pollForCompletion = () => {
      pollCount++;
      
      // Comprobar si el pago fue completado (via webhook)
      const paymentCompleted = sessionStorage.getItem(`mp_payment_completed_${courseId}`);
      
      if (paymentCompleted === "true") {
        console.log("✅ [MP] Pago completado detectado via webhook");
        sessionStorage.removeItem(`mp_payment_completed_${courseId}`);
        resolve(true);
        return;
      }
      
      if (pollCount < maxPolls) {
        console.log(`⏳ [MP] Esperando confirmación del pago... (intento ${pollCount})`);
        setTimeout(pollForCompletion, 2000); // Esperar 2 segundos y reintentar
      } else {
        console.log("⏰ [MP] Timeout esperando confirmación del pago");
        resolve(false); // Timeout
      }
    };
    
    // Iniciar polling
    pollForCompletion();
  });
};

/**
 * Redirigir a Mercado Pago para pagar
 * Abre en una nueva ventana y monitorea el regreso
 */
export const redirectToMercadoPago = (initPoint: string) => {
  if (!initPoint) {
    console.error("❌ Init Point inválido");
    return;
  }

  console.log("🔄 [MP] Redirigiendo a Mercado Pago:", initPoint);
  
  // ESTRATEGIA: Abre en nueva ventana y monitorea
  const mpWindow = window.open(initPoint, "mercadopago_checkout", "width=800,height=600");

  if (!mpWindow) {
    console.error("❌ No se pudo abrir ventana");
    return;
  }

  // Monitorear cuando el usuario cierra la ventana o navega de vuelta
  const checkWindowStatus = setInterval(() => {
    try {
      // Verificar si la ventana se cerró
      if (mpWindow.closed) {
        console.log("✅ [MP] Usuario cerró ventana de Mercado Pago");
        clearInterval(checkWindowStatus);

        // El usuario completó el pago (o canceló)
        // Redirigir a payment-callback para polling
        // El webhook debería haber procesado el pago si fue exitoso
        const courseId = sessionStorage.getItem("mp_pending_course");
        const userEmail = sessionStorage.getItem("mp_pending_email");

        if (courseId && userEmail) {
          console.log("🔄 [MP] Redirigiendo a payment-callback para verificar pago...");
          window.location.href = "/payment-callback";
        } else {
          console.error("❌ [MP] Datos de pago no encontrados");
          window.location.href = "/";
        }

        return;
      }

      // Intentar acceder a la URL (puede fallar por CORS pero nos da pistas)
      try {
        const windowUrl = mpWindow.location.href;
        console.log("📍 [MP Window] URL:", windowUrl);
      } catch (e) {
        // Normal por CORS - ventana de otro dominio
      }
    } catch (e) {
      // Error al acceder a la ventana (puede ser por CORS)
      console.log("⚠️  No se puede acceder a URL de ventana (CORS esperado)");
    }
  }, 1000); // Verificar cada segundo

  // Timeout: Si después de 10 minutos no se cerró, asumir que se completó
  setTimeout(() => {
    clearInterval(checkWindowStatus);
    if (!mpWindow.closed) {
      console.log("⏰ [MP] Timeout - redirigiendo a payment-callback");
      window.location.href = "/payment-callback";
    }
  }, 600000); // 10 minutos
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
