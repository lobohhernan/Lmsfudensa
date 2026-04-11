import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { resolveCourseIdToSlug } from "../lib/courseResolver";

interface CheckoutSuccessProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string) => void;
}

export default function CheckoutSuccess({ onNavigate }: CheckoutSuccessProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);
  const [enrolledCourseSlug, setEnrolledCourseSlug] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(2);

  useEffect(() => {
    // AUTO-REDIRECT cuando la inscripción se confirma
    if (enrolledCourseId && !isVerifying && !enrollmentError) {
      console.log("🚀 Iniciando redirección automática al curso:", enrolledCourseId);
      console.log("⏳ Esperando 1.5 segundos para mostrar el mensaje...");
      
      // Countdown de 1.5 segundos (más rápido que los 2 segundos de MP)
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirigir después de 1.5 segundos (antes que MP intente redirigir)
      const redirectTimer = setTimeout(() => {
        console.log("🔄 Ejecutando redirección (antes de Mercado Pago)...");
        if (onNavigate) {
          console.log("✅ Usando onNavigate con courseId y courseSlug");
          onNavigate("course", enrolledCourseId, enrolledCourseSlug || undefined);
        } else {
          console.log("⚠️ onNavigate no disponible, usando window.location.hash");
          window.location.hash = `/#/curso/${enrolledCourseId}`;
        }
      }, 1500); // Reducido a 1.5 segundos para ser MÁS rápido que Mercado Pago

      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [enrolledCourseId, enrolledCourseSlug, isVerifying, enrollmentError, onNavigate]);

  useEffect(() => {
    const verifyEnrollment = async () => {
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

        // Parsear external_reference (contiene JSON con courseId y userId)
        let courseId: string;
        try {
          const externalRefData = JSON.parse(decodeURIComponent(externalRef));
          courseId = externalRefData.courseId;
          console.log("✅ Parsed external_reference:", { courseId, userId: externalRefData.userId });
        } catch (e) {
          // Si falla el parse, asumir que es solo courseId (compatibilidad backwards)
          courseId = externalRef;
          console.warn("⚠️ No se pudo parsear external_reference, usando como courseId:", courseId);
        }

        // Obtener usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setEnrollmentError("No hay usuario autenticado");
          setIsVerifying(false);
          return;
        }

        // IMPORTANTE: El frontend crea la inscripción directamente si no existe
        // Esto es un failsafe en caso de que el webhook no se ejecute
        console.log(`📝 Creando inscripción del usuario ${user.id} en curso ${courseId}...`);
        
        const { data: existing } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (existing) {
          console.log("✅ Inscripción ya existe");
          setEnrolledCourseId(courseId);
        } else {
          // Crear inscripción
          const { data: newEnrollment, error: insertError } = await supabase
            .from("enrollments")
            .insert({
              user_id: user.id,
              course_id: courseId,
            })
            .select();

          if (insertError) {
            console.error("❌ Error creando inscripción:", insertError);
            setEnrollmentError("Error al crear inscripción: " + insertError.message);
            setIsVerifying(false);
            return;
          }

          console.log("✅ Inscripción creada por frontend:", newEnrollment?.[0]?.id);
          setEnrolledCourseId(courseId);
        }

        // Resolver courseId a slug para navegación completa
        const slug = await resolveCourseIdToSlug(courseId);
        if (slug) {
          console.log(`✅ Slug resuelto: ${courseId} → ${slug}`);
          setEnrolledCourseSlug(slug);
        } else {
          console.warn(`⚠️ No se pudo resolver slug para courseId: ${courseId}`);
        }

        setIsVerifying(false); // ← IMPORTANTE: Establecer false para activar el useEffect de redirección
      } catch (err) {
        console.error("❌ Error en verificación:", err);
        setEnrollmentError(
          err instanceof Error ? err.message : "Error desconocido"
        );
        setIsVerifying(false);
      }
    };

    verifyEnrollment();
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
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span>Verificando pago e inscribiendo...</span>
                </div>
                <div className="text-xs text-gray-500">
                  Esto puede tomar algunos segundos
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-semibold">
                    ✅ Acceso al curso activado
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    En {redirectCountdown} segundo{redirectCountdown !== 1 ? 's' : ''} serás redirigido a FUDENSA
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando lecciones</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-3">
          {enrollmentError && (
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
              Intentar de Nuevo
            </Button>
          )}
          {!enrollmentError && isVerifying && (
            <Button
              disabled
              className="w-full bg-gray-400"
              size="lg"
            >
              Esperando redirección...
            </Button>
          )}
          {!enrollmentError && !isVerifying && (
            <Button
              onClick={() => {
                if (onNavigate && enrolledCourseId) {
                  onNavigate("course", enrolledCourseId);
                } else if (onNavigate) {
                  onNavigate("catalog");
                } else {
                  window.location.hash = `/#/curso/${enrolledCourseId}`;
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Ir al Curso Ahora
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Se envió un email de confirmación a tu cuenta
        </p>
      </div>
    </div>
  );
}
