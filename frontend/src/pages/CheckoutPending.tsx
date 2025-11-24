import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "../components/ui/button";

export default function CheckoutPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preferenceId = searchParams.get("preference_id");
  const paymentId = searchParams.get("payment_id");

  console.log("⏳ Pago pendiente:", {
    preferenceId,
    paymentId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pago Pendiente
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Esto puede tomar algunos minutos.
          Te notificaremos cuando se complete.
        </p>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
          <p className="text-sm text-yellow-800 font-semibold">
            ⏳ Estado: En Revisión
          </p>
          <p className="text-xs text-yellow-700 mt-2">
            Algunos métodos de pago requieren verificación adicional. 
            Estamos verificando tu transacción.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/#/courses")}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Ir a Mis Cursos
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
          Te enviaremos un email cuando tu pago se confirme.
          Puedes continuar navegando mientras tanto.
        </p>
      </div>
    </div>
  );
}
