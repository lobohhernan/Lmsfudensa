import { useEffect } from "react";

interface MercadoPagoSuccessProps {
  onNavigate?: (page: string) => void;
}

/**
 * Esta página se abre cuando el usuario completa el pago en Mercado Pago
 * Detecta los parámetros de éxito y redirige automáticamente a payment-callback
 */
export function MercadoPagoSuccess({ onNavigate }: MercadoPagoSuccessProps) {
  useEffect(() => {
    // Los parámetros están en la URL: ?status=approved&payment_id=XXX&external_reference=XXX
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const paymentId = urlParams.get("payment_id");
    const externalRef = urlParams.get("external_reference");

    console.log("📍 [MP Success] URL params:", { status, paymentId, externalRef });

    // Si el pago fue aprobado, redirigir a payment-callback
    if (status === "approved" || paymentId) {
      console.log("✅ [MP Success] Pago detectado, redirigiendo a payment-callback...");
      
      // El sessionStorage ya tiene los datos (courseId, email)
      // Redirigir a payment-callback que hará polling
      if (onNavigate) {
        onNavigate("payment-callback");
      } else {
        window.location.href = "/payment-callback";
      }
    } else {
      console.log("❌ [MP Success] Pago no aprobado, redirigiendo a home...");
      if (onNavigate) {
        onNavigate("home");
      } else {
        window.location.href = "/";
      }
    }
  }, [onNavigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p className="mt-4 text-lg text-gray-700">Redirigiendo...</p>
      </div>
    </div>
  );
}

export default MercadoPagoSuccess;
