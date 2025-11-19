import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { enrollUser } from "../lib/enrollments";

interface CheckoutSuccessProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

export default function CheckoutSuccess({ onNavigate }: CheckoutSuccessProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndEnroll = async () => {
      try {
        // Obtener parámetros de Mercado Pago desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const preferenceId = urlParams.get("preference_id");
        const paymentId = urlParams.get("payment_id");
        const externalRef = urlParams.get("external_reference");

        console.log("✅ Pago exitoso desde Mercado Pago:", {
          preferenceId,
          paymentId,
          externalRef,
        });

        if (!externalRef) {
          setEnrollmentError("No se encontró referencia del curso");
          setIsVerifying(false);
          return;
        }

        // Obtener usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setEnrollmentError("No hay usuario autenticado");
          setIsVerifying(false);
          return;
        }

        // Inscribir al usuario en el curso
        console.log(`📚 Inscribiendo usuario ${user.id} en curso ${externalRef}...`);
        const res = await enrollUser(user.id, externalRef);

        if (res.success) {
          console.log("✅ Usuario inscrito correctamente");
          setEnrolledCourseId(externalRef);
        } else {
          console.error("⚠️ Error en inscripción:", res.error);
          setEnrollmentError(res.error || "Error al inscribirse en el curso");
        }

        setIsVerifying(false);
      } catch (err) {
        console.error("❌ Error en verificación:", err);
        setEnrollmentError(
          err instanceof Error ? err.message : "Error desconocido"
        );
        setIsVerifying(false);
      }
    };

    verifyAndEnroll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {enrollmentError ? (
          <>
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pago Procesado
            </h1>
            <p className="text-gray-600 mb-6">
              Tu pago fue exitoso, pero hay un problema con la inscripción:
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold">
                {enrollmentError}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Por favor contacta con soporte o intenta nuevamente
              </p>
            </div>
          </>
        ) : (
          <>
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
                <span>Verificando pago e inscribiendo...</span>
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
          </>
        )}

        <div className="space-y-3">
          {!enrollmentError && (
            <Button
              onClick={() => {
                if (onNavigate && enrolledCourseId) {
                  onNavigate("course", enrolledCourseId);
                } else if (onNavigate) {
                  onNavigate("catalog");
                } else {
                  window.location.hash = "/#/cursos";
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Ir al Curso
            </Button>
          )}
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
            {enrollmentError ? "Intentar de Nuevo" : "Volver al Inicio"}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Se envió un email de confirmación a tu cuenta
        </p>
      </div>
    </div>
  );
}
