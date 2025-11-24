import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { initMercadoPago, createMercadoPagoPreference, redirectToMercadoPago } from "../lib/mercadopago";
import { AlertCircle, Loader2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Inicializar Mercado Pago SDK cuando el componente se monta
  useEffect(() => {
    const loadSDK = async () => {
      const loaded = await initMercadoPago();
      setSdkLoaded(!!loaded);
      if (!loaded) {
        setError("No se pudo cargar el SDK de Mercado Pago");
      }
    };

    loadSDK();
  }, []);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("💳 Iniciando proceso de pago...");
      console.log("Curso:", courseTitle);
      console.log("Precio:", price);
      console.log("Email:", userEmail);

      // Crear preferencia de pago llamando a la Edge Function
      const initPoint = await createMercadoPagoPreference(
        courseId,
        courseTitle,
        price,
        userEmail,
        userName
      );

      if (!initPoint) {
        throw new Error("No se pudo crear la preferencia de pago");
      }

      // Callback opcional
      if (onPaymentInitiated) {
        onPaymentInitiated();
      }

      // Redirigir a Mercado Pago
      redirectToMercadoPago(initPoint);
    } catch (err) {
      console.error("Error en pago:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar el pago"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Resumen del curso */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">{courseTitle}</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Precio:</span>
          <span className="text-2xl font-bold text-blue-600">
            ${price.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          <p>Email: {userEmail}</p>
          {userName && <p>Estudiante: {userName}</p>}
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botón de pago */}
      <Button
        onClick={handlePayment}
        disabled={isLoading || !sdkLoaded}
        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          "💳 Ir a Mercado Pago"
        )}
      </Button>

      {/* Nota de seguridad */}
      <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-200">
        <p className="font-semibold mb-1">🔒 Pago Seguro</p>
        <p>
          Serás redirigido a Mercado Pago para completar el pago de forma segura.
          Los datos de tu tarjeta no se comparten con FUDENSA.
        </p>
      </div>
    </div>
  );
}
