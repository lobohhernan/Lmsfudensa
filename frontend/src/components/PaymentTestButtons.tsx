import { useState, useCallback, memo } from "react";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { simulatePayment } from "../lib/paymentSimulator";

interface PaymentTestButtonsProps {
  userId: string;
  courseId: string;
  userEmail: string;
  onPaymentSimulated?: (status: "approved" | "pending" | "rejected") => void;
}

function PaymentTestButtonsComponent({
  userId,
  courseId,
  userEmail,
  onPaymentSimulated,
}: PaymentTestButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Only show in development mode - always show for testing
  // NOTE: Remove this check to always show in production for testing
  // if (import.meta.env.MODE !== "development") {
  //   return null;
  // }

  const handleSimulation = useCallback(async (
    status: "approved" | "pending" | "rejected"
  ) => {
    try {
      setIsProcessing(true);

      const result = await simulatePayment(
        userId,
        courseId,
        userEmail,
        status
      );

      if (result.success) {
        toast.success(result.message);
        onPaymentSimulated?.(status);
      } else {
        toast.error(result.error || "Error en simulación de pago");
      }
    } catch (error) {
      console.error("Error en simulación:", error);
      toast.error("Error al simular el pago");
    } finally {
      setIsProcessing(false);
    }
  }, [userId, courseId, userEmail, onPaymentSimulated]);

  return (
    <div className="w-full rounded-xl border-2 border-amber-300 bg-linear-to-br from-amber-50 to-amber-100 p-6 mt-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-200">
          <AlertCircle className="h-6 w-6 text-amber-700" />
        </div>
        <div>
          <p className="font-bold text-lg text-amber-900">Testing: Simular Pago</p>
          <p className="text-xs text-amber-700">Prueba los 3 escenarios de pago</p>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Approved Button */}
        <button
          onClick={() => handleSimulation("approved")}
          disabled={isProcessing}
          style={{ backgroundColor: '#16a34a' }}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-lg hover:brightness-110 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <CheckCircle className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">Aprobado</span>
        </button>

        {/* Pending Button */}
        <button
          onClick={() => handleSimulation("pending")}
          disabled={isProcessing}
          style={{ backgroundColor: '#2563eb' }}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-lg hover:brightness-110 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Clock className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">Pendiente</span>
        </button>

        {/* Rejected Button */}
        <button
          onClick={() => handleSimulation("rejected")}
          disabled={isProcessing}
          style={{ backgroundColor: '#dc2626' }}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-lg hover:brightness-110 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <AlertTriangle className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">Rechazado</span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs text-amber-700 text-center">
        🔧 Simula exactamente la respuesta de Mercado Pago sin llamar a APIs reales
      </p>
    </div>
  );
}

export const PaymentTestButtons = memo(PaymentTestButtonsComponent);
