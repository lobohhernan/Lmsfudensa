import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

interface MercadoPagoCheckoutProps {
  courseId: string;
  courseTitle: string;
  price: number;
  userEmail: string;
  userName?: string;
  onPaymentInitiated?: () => void;
}

export function MercadoPagoCheckout({
  courseId,
  courseTitle,
  price,
  userEmail,
  userName,
  onPaymentInitiated,
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMercadoPagoReady, setIsMercadoPagoReady] = useState(false);

  // Inicializar Mercado Pago SDK
  useEffect(() => {
    const initMP = async () => {
      try {
        const { loadMercadoPago } = await import(
          "@mercadopago/sdk-js"
        );
        const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

        if (!publicKey) {
          console.error("❌ Public Key de Mercado Pago no configurada");
          return;
        }

        await loadMercadoPago();
        setIsMercadoPagoReady(true);
        console.log("✅ Mercado Pago SDK inicializado");
      } catch (error) {
        console.error("❌ Error inicializando Mercado Pago:", error);
        toast.error("Error al cargar el sistema de pagos");
      }
    };

    initMP();
  }, []);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

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
        console.error("❌ Error creando preferencia:", error);
        toast.error("No se pudo procesar el pago. Intenta nuevamente.");
        setIsLoading(false);
        return;
      }

      if (data?.initPoint) {
        console.log("✅ Preferencia creada:", data.preferenceId);
        onPaymentInitiated?.();
        
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        toast.error("No se pudo inicializar el pago");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Error en pago:", error);
      toast.error("Error procesando el pago");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💳 Mercado Pago</h3>
        <p className="text-sm text-blue-800 mb-4">
          Paga de forma segura con tu cuenta de Mercado Pago o tarjeta de crédito/débito.
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Curso:</span>
            <span className="font-medium">{courseTitle}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Total a pagar:</span>
            <span className="font-bold text-lg text-blue-600">
              ${price.toFixed(2)} ARS
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isLoading || !isMercadoPagoReady}
        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando pago...
          </>
        ) : (
          "Ir a Mercado Pago"
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Serás redirigido a Mercado Pago para completar el pago de forma segura.
      </p>
    </div>
  );
}
