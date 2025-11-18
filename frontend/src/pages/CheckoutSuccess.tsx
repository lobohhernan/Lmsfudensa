import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Obtener parámetros de Mercado Pago
    const preferenceId = searchParams.get("preference_id");
    const paymentId = searchParams.get("payment_id");
    const externalRef = searchParams.get("external_reference");

    console.log("✅ Pago exitoso:", {
      preferenceId,
      paymentId,
      externalRef,
    });

    // Aquí puedes:
    // 1. Verificar el pago en tu backend
    // 2. Activar el acceso al curso
    // 3. Guardar el registro de pago
    // 4. Enviar email de confirmación

    // Simular verificación
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu compra se ha procesado correctamente. 
          {isVerifying && " Estamos verificando..."}
        </p>

        {isVerifying ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span>Verificando pago...</span>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <p className="text-sm text-green-800 font-semibold">
              ✅ Acceso al curso activado
            </p>
            <p className="text-xs text-green-700 mt-1">
              Puedes comenzar a ver las lecciones inmediatamente
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/#/courses")}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Ver Mis Cursos
          </Button>
          
          <Button
            onClick={() => navigate("/#/home")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Volver al Inicio
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Se envió un email de confirmación a tu cuenta
        </p>
      </div>
    </div>
  );
}
