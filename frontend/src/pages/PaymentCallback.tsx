import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { supabase } from "../lib/supabase";

interface PaymentCallbackProps {
  onNavigate?: (page: string) => void;
}

export function PaymentCallback({ onNavigate }: PaymentCallbackProps) {
  const [status, setStatus] = useState<"waiting" | "success" | "error">("waiting");
  const [message, setMessage] = useState("Procesando pago...");

  useEffect(() => {
    // Obtener datos de sessionStorage
    const pendingCourse = sessionStorage.getItem("mp_pending_course");
    const pendingEmail = sessionStorage.getItem("mp_pending_email");

    // Obtener parámetros de URL (enviados por Mercado Pago)
    const urlParams = new URLSearchParams(window.location.search);
    const mpStatus = urlParams.get("status");
    const paymentId = urlParams.get("payment_id");

    console.log("📍 [PaymentCallback] URL params:", { mpStatus, paymentId });
    console.log("📍 [PaymentCallback] SessionStorage:", { pendingCourse, pendingEmail });

    if (!pendingCourse || !pendingEmail) {
      console.error("❌ Datos de pago incompletos");
      setStatus("error");
      setMessage("Error: Datos de pago no encontrados.");
      return;
    }

    // Si Mercado Pago envió parámetros de éxito, podemos confiar en eso
    if (mpStatus === "approved" || paymentId) {
      console.log("✅ [PaymentCallback] Pago aprobado según parámetros MP");
      // Aún así, hacer polling para confirmar que el webhook procesó
      // porque Mercado Pago puede estar equivocado
    }

    // Iniciar polling para verificar si el pago fue procesado
    let pollAttempts = 0;
    const maxAttempts = 60; // 2 minutos máximo

    const checkPaymentStatus = async () => {
      try {
        pollAttempts++;
        console.log(`⏳ [PaymentCallback] Intento ${pollAttempts} de ${maxAttempts}`);

        // Llamar a la Edge Function de check-payment-status
        const { data, error } = await supabase.functions.invoke(
          "check-payment-status",
          {
            body: { courseId: pendingCourse, userEmail: pendingEmail },
          }
        );

        console.log("📊 [PaymentCallback] Respuesta:", { data, error });

        if (error) {
          throw new Error(error.message || "Error desconocido");
        }

        if (data?.enrolled) {
          setStatus("success");
          setMessage("¡Pago procesado exitosamente! Redirigiendo...");

          // Limpiar sessionStorage
          sessionStorage.removeItem("mp_pending_course");
          sessionStorage.removeItem("mp_pending_email");

          // Redirigir al home después de 2 segundos
          setTimeout(() => {
            if (onNavigate) {
              onNavigate("home");
            } else {
              window.location.href = "/";
            }
          }, 2000);

          return;
        }

        // Si no está completado, reintentar
        if (pollAttempts < maxAttempts) {
          setTimeout(checkPaymentStatus, 2000); // Esperar 2 segundos e intentar de nuevo
        } else {
          setStatus("error");
          setMessage(
            "Timeout esperando confirmación del pago. El pago puede estar siendo procesado. Por favor, intenta de nuevo más tarde."
          );
        }
      } catch (error) {
        console.error("❌ [PaymentCallback] Error al verificar pago:", error);

        // Reintentar en caso de error
        if (pollAttempts < maxAttempts) {
          setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus("error");
          setMessage("Error al verificar el estado del pago. Por favor, intenta de nuevo.");
        }
      }
    };

    // Iniciar verificación
    checkPaymentStatus();
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle>
            {status === "waiting" && "Procesando Pago"}
            {status === "success" && "¡Pago Completado!"}
            {status === "error" && "Error en el Pago"}
          </CardTitle>
          <CardDescription>
            {status === "waiting" && "Por favor espera mientras confirmamos tu pago..."}
            {status === "success" && "Tu pago ha sido procesado exitosamente."}
            {status === "error" && "Ocurrió un problema al procesar tu pago."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {status === "waiting" && (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            )}
            {status === "success" && <CheckCircle className="w-12 h-12 text-green-500" />}
            {status === "error" && <AlertCircle className="w-12 h-12 text-red-500" />}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">{message}</p>

            {status === "waiting" && (
              <p className="text-xs text-slate-400">
                (puede tomar entre 10-30 segundos)
              </p>
            )}
          </div>

          {status !== "waiting" && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription className="text-sm">
                {status === "success"
                  ? "Ya puedes acceder al curso desde tu perfil."
                  : "Por favor, intenta realizar el pago nuevamente. Si el problema persiste, contacta con soporte."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 pt-2">
            {status !== "waiting" && (
              <>
                <Button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate("home");
                    } else {
                      window.location.href = "/";
                    }
                  }}
                  variant={status === "error" ? "outline" : "default"}
                  className="w-full"
                >
                  {status === "error" ? "Volver al inicio" : "Ir al Home"}
                </Button>

                {status === "error" && (
                  <Button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("checkout");
                      } else {
                        window.history.back();
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Intentar de nuevo
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentCallback;
