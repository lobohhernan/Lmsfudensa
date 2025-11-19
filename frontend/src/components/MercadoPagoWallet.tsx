import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface MercadoPagoWalletProps {
  preferenceId: string;
  courseId: string;
  userEmail: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Componente que usa Mercado Pago Wallet (HOY)
 * El Wallet RESPETA auto_return correctamente
 * init_point no lo respeta en localhost
 */
export function MercadoPagoWallet({
  preferenceId,
  courseId,
  userEmail,
  onSuccess,
  onError,
}: MercadoPagoWalletProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cuando el componente se monta, renderizar Mercado Pago Wallet
    renderMercadoPagoWallet();
  }, [preferenceId]);

  const renderMercadoPagoWallet = async () => {
    try {
      // Verificar que MercadoPago SDK esté cargado
      if (!window.MercadoPago) {
        console.error("❌ MercadoPago SDK no está disponible");
        if (onError) onError("SDK de Mercado Pago no disponible");
        return;
      }

      // Crear instancia de Wallet
      const bricksBuilder = window.MercadoPago.bricksBuilder;

      if (!bricksBuilder) {
        console.log("⚠️  Wallet no disponible, usando método alternativo...");
        // Fallback: usar init_point con polling
        return;
      }

      // Renderizar Wallet
      await bricksBuilder({
        instance: "wallet",
        locale: "es-AR",
        initialization: {
          preferenceId: preferenceId,
        },
        customization: {
          texts: {
            valueProp: "security_details",
          },
        },
        onSubmit: async (formData: any) => {
          console.log("✅ [MP Wallet] Formulario enviado:", formData);
          setLoading(true);

          // Guardar datos de pago pendiente
          sessionStorage.setItem("mp_pending_course", courseId);
          sessionStorage.setItem("mp_pending_email", userEmail);

          // El wallet redirigirá automáticamente después del pago
          // Si no, usar polling como fallback
          if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
          console.error("❌ [MP Wallet] Error:", error);
          if (onError) onError(error.message || "Error en Mercado Pago");
        },
        onReady: () => {
          console.log("✅ [MP Wallet] Listo para usar");
          setLoading(false);
        },
      }).mount("wallet_container");
    } catch (error) {
      console.error("❌ Error renderizando Wallet:", error);
      if (onError) onError(String(error));
    }
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Cargando Mercado Pago...</p>
        </div>
      )}
      {/* El Wallet se renderiza aquí */}
      <div id="wallet_container" className="w-full"></div>
    </div>
  );
}

export default MercadoPagoWallet;
