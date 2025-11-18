import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export default function CheckoutFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preferenceId = searchParams.get("preference_id");
  const paymentId = searchParams.get("payment_id");

  console.log("❌ Pago fallido:", {
    preferenceId,
    paymentId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pago No Completado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No pudimos procesar tu pago. Por favor, intenta nuevamente 
          o contacta con soporte.
        </p>

        <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
          <p className="text-sm text-red-800 font-semibold">
            Razones posibles:
          </p>
          <ul className="text-xs text-red-700 mt-2 text-left space-y-1">
            <li>• Fondos insuficientes</li>
            <li>• Tarjeta rechazada o expirada</li>
            <li>• Cancelaste la operación</li>
            <li>• Datos incorrectos</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/#/checkout")}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Intentar Nuevamente
          </Button>
          
          <Button
            onClick={() => navigate("/#/courses")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Ver Otros Cursos
          </Button>
          
          <Button
            onClick={() => navigate("/#/contact")}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Contactar Soporte
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si el problema persiste, escríbenos a support@fudensa.com
        </p>
      </div>
    </div>
  );
}
