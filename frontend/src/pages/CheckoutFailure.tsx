import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "../components/ui/button";

interface CheckoutFailureProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

export default function CheckoutFailure({ onNavigate }: CheckoutFailureProps) {
  const [externalRef, setExternalRef] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("Razón desconocida");

  useEffect(() => {
    // Obtener parámetros de Mercado Pago desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const extRef = urlParams.get("external_reference");
    const payId = urlParams.get("payment_id");
    const failReason = urlParams.get("reason") || "Razón desconocida";

    setExternalRef(extRef);
    setPaymentId(payId);
    setReason(failReason);

    console.log("❌ Pago rechazado desde Mercado Pago:", {
      preferenceId: urlParams.get("preference_id"),
      paymentId: payId,
      externalRef: extRef,
      reason: failReason,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pago No Procesado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No pudimos procesar tu pago. Por favor, intenta nuevamente.
        </p>

        <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0">⚠️</div>
            <div className="text-left">
              <p className="text-sm text-red-800 font-semibold">
                {reason}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Posibles causas: fondos insuficientes, datos incorrectos o límite de transacciones
              </p>
            </div>
          </div>
        </div>

        {paymentId && (
          <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>ID de Transacción:</strong> {paymentId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => {
              if (onNavigate && externalRef) {
                onNavigate("checkout", externalRef);
              } else if (onNavigate) {
                onNavigate("catalog");
              } else {
                window.location.hash = "/#/cursos";
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            Intentar de Nuevo
          </Button>
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate("home");
              } else {
                window.location.hash = "/#/home";
              }
            }}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Volver al Inicio
          </Button>
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate("contact");
              } else {
                window.location.hash = "/#/contacto";
              }
            }}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Contactar Soporte
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si persiste el problema, por favor contacta con nuestro equipo de soporte
        </p>
      </div>
    </div>
  );
}

