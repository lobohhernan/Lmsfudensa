import { useState, useEffect } from "react";
import { CreditCard, Award, Check, ChevronRight, ShieldCheck, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Badge } from "../components/ui/badge";
import { MercadoPagoCheckout } from "../components/MercadoPagoCheckout";
import { supabase } from "../lib/supabase";
import { debug, error as logError } from '../lib/logger'
import { isUserEnrolled, enrollUser } from "../lib/enrollments";
import { resolveCourseSlugToId } from "../lib/courseResolver"

interface CheckoutProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => void;
  courseId?: string;
  courseSlug?: string;
  userData?: { email: string; name: string } | null;
  isInitializing?: boolean;
}

export function Checkout({ onNavigate, courseId: initialCourseId, courseSlug, userData, isInitializing = false }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("AR");
  // paymentMethod removed (not used)
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);

  console.log('🛒 [Checkout] Props:', { courseId, courseSlug, hasUserData: !!userData, isInitializing });

  // ✅ PASO 1: Resolver courseSlug a courseId si es necesario
  useEffect(() => {
    const resolveSlug = async () => {
      // Si ya tenemos courseId, no hacer nada
      if (courseId) return;
      
      // Si no tenemos courseId pero sí slug, resolver
      if (!courseId && courseSlug) {
        console.log(`🔄 [Checkout] Resolviendo slug: ${courseSlug}`);
        const resolvedId = await resolveCourseSlugToId(courseSlug);
        
        if (resolvedId) {
          console.log(`✅ [Checkout] Slug resuelto: ${courseSlug} → ${resolvedId}`);
          setCourseId(resolvedId);
        } else {
          setError(`No se encontró curso con slug: ${courseSlug}`);
          setLoading(false);
        }
      } else if (!courseId && !courseSlug) {
        setError("No se proporcionó información del curso");
        setLoading(false);
      }
    };
    
    resolveSlug();
  }, [courseSlug, courseId]);

  // Mostrar loader mientras se inicializa la sesión
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1e467c] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // ✅ PASO 2: Cargar datos del curso desde Supabase
  useEffect(() => {
    // Esperar a tener courseId antes de cargar
    if (!courseId) {
      return;
    }

    const loadCourseData = async () => {
      try {
        setLoading(true);
        debug("Cargando curso en checkout con ID:", courseId);
        
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) {
          logError("Error al cargar curso:", courseError);
          throw courseError;
        }
        
        debug("Curso cargado en checkout:", course);
        setCourseData(course);
        setError(null);
      } catch (err: any) {
        console.error("Error cargando curso:", err);
        setError(err.message || "Error al cargar los datos del curso");
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // Verificar si el usuario ya está inscrito
  useEffect(() => {
    if (!courseId || !userData) return;

    const checkEnrollment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const enrolled = await isUserEnrolled(user.id, courseId);
        if (enrolled) {
          console.log("✅ [Checkout] Usuario ya inscrito, redirigiendo a lección 1...");
          toast.info("Ya estás inscrito en este curso", {
            description: "Te redirigiremos a la lección",
          });
          setTimeout(() => {
            // ✅ Pasar courseId, courseSlug y lessonId para URL correcta
            onNavigate?.("lesson", courseId, courseSlug, "1");
          }, 1000); // Reducido a 1 segundo
        }
      } catch (err) {
        console.error("Error verificando inscripción:", err);
      }
    };

    checkEnrollment();
  }, [courseId, userData, onNavigate]);

  const currencies: Record<string, string> = {
    AR: "ARS",
    UY: "ARS",
    MX: "ARS",
    CO: "ARS",
    US: "ARS",
  };

  const price = courseData?.price || 0;
  const currency = currencies[country] || currencies.US;

  const handlePayment = () => {
    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      (async () => {
        try {
          // Intentar inscribir al usuario en el curso
          const { data: { user } } = await supabase.auth.getUser();
          if (user && courseId) {
            const res = await enrollUser(user.id, courseId);
            if (res.success) {
              debug("✅ Usuario inscrito correctamente en el curso");
              toast.success("¡Pago procesado exitosamente!");
              
              setIsProcessing(false);
              
              // ✅ REDIRIGIR DIRECTO A LA PRIMERA LECCIÓN DEL CURSO
              // El certificado solo se mostrará al completar el curso + evaluación
              setTimeout(() => {
                onNavigate?.("lesson", courseId, courseSlug, "1");
              }, 800);
            } else {
              console.warn("No se pudo inscribir automáticamente:", res.error);
              toast.error("Error al procesar la inscripción");
              setIsProcessing(false);
            }
          } else {
            console.warn("No hay usuario autenticado o courseId no disponible para inscribir");
            toast.error("Error de autenticación");
            setIsProcessing(false);
          }
        } catch (err) {
          console.error("Error durante el flujo de pago/inscripción:", err);
          toast.error("Ocurrió un error procesando la inscripción");
          setIsProcessing(false);
        }
      })();
    }, 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0B5FFF]" />
          <p className="text-[#64748B]">Cargando información del curso...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Curso no encontrado"}</p>
          <Button onClick={() => onNavigate?.("catalog")}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  // ✅ ELIMINADO: step === 3 (certificado)
  // El certificado ahora solo aparece después de completar el curso + evaluación

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumbs */}
      <div className="border-b bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate?.("home")} className="cursor-pointer">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate?.("course")} className="cursor-pointer">
                  Curso
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= stepNum
                      ? "bg-[#0B5FFF] text-white"
                      : "bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 2 && (
                  <ChevronRight
                    className={`mx-2 h-5 w-5 ${
                      step > stepNum ? "text-[#0B5FFF]" : "text-[#64748B]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-[#64748B]">
              Paso {step} de 2: {step === 1 ? "Resumen del pedido" : "Método de pago"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Content */}
          <div className="space-y-6">
            {step === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-[#E2E8F0]">
                        <img
                          src={courseData?.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=200"}
                          alt={courseData?.title || "Curso"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 text-[#0F172A]">
                          {courseData?.title || "Curso"}
                        </h3>
                        <p className="text-sm text-[#64748B]">{courseData?.duration || "N/A"} • Nivel {courseData?.level || "N/A"}</p>
                        {courseData?.certified && (
                          <Badge className="mt-2 bg-[#22C55E] text-white">
                            <Award className="mr-1 h-3 w-3" />
                            Certificado Incluido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selecciona tu País</CardTitle>
                    <CardDescription>
                      Todos los pagos se procesan en Pesos Argentinos (ARS) mediante Mercado Pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                        <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                        <SelectItem value="MX">🇲🇽 México</SelectItem>
                        <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                        <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cupón de Descuento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingresa tu código"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="outline">Aplicar</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                  <CardDescription>
                    Completa tu pago de forma segura con Mercado Pago
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MercadoPagoCheckout
                    courseId={courseId!}
                    courseTitle={courseData?.title || "Curso"}
                    price={price}
                    userEmail={userData?.email || ""}
                    userName={userData?.name}
                    onPaymentInitiated={() => {
                      console.log("💳 Pago iniciado en Mercado Pago");
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <aside>
            <Card className="sticky top-24 border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(11,95,255,0.12)]">
              {/* Glass effect top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
              
              <CardHeader className="relative bg-white/50 backdrop-blur-sm">
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white/30">
                <div className="space-y-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Certificado</span>
                    <span className="text-[#0F172A]">
                      $ {price.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Descuento</span>
                    <span className="text-[#22C55E]">-$ 0</span>
                  </div>
                  <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#0F172A]">Total ({currency})</span>
                    <span className="text-xl font-bold text-[#0F172A]">
                      $ {price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/20 backdrop-blur-sm border border-[#22C55E]/30">
                      <ShieldCheck className="h-5 w-5 text-[#22C55E]" />
                    </div>
                    <span className="text-[#64748B] mt-1">
                      Pago seguro y encriptado
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B5FFF]/20 backdrop-blur-sm border border-[#0B5FFF]/30">
                      <Award className="h-5 w-5 text-[#0B5FFF]" />
                    </div>
                    <span className="text-[#64748B] mt-1">
                      Certificado verificable con blockchain
                    </span>
                  </div>
                </div>

                {step === 1 && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    Continuar al Pago
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Volver al Resumen
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
