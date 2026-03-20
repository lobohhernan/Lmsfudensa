import { Clock, BarChart3, Award, Play, CheckCircle, Users, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../lib/supabase";
import { debug, error as logError } from '../lib/logger'
import { resolveCourseSlugToId, resolveCourseIdToSlug } from "../lib/courseResolver"
import { isUserEnrolled } from "../lib/enrollments"
import { useState, useEffect } from "react";

interface CourseDetailProps {
  courseId?: string;
  courseSlug?: string;
  onNavigate?: (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => void;
  isLoggedIn?: boolean;
  onAuthRequired?: (page: string, courseId?: string) => void;
}

export function CourseDetail({ courseId: initialCourseId, courseSlug, onNavigate, isLoggedIn, onAuthRequired }: CourseDetailProps) {
  const [courseData, setCourseData] = useState<Record<string, unknown> | null>(null);
  const [lessons, setLessons] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(courseSlug);
  const [userEnrolled, setUserEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  // ✅ Efecto consolidado: resuelve IDs, carga datos y verifica inscripción en paralelo
  useEffect(() => {
    let cancelled = false;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setCheckingEnrollment(true);

        // ── Paso 1: resolver courseId (si solo tenemos slug) ──
        let resolvedId = initialCourseId;
        let resolvedSlug = courseSlug;

        if (!resolvedId && courseSlug) {
          debug(`🔄 [CourseDetail] Resolviendo slug: ${courseSlug}`);
          const id = await resolveCourseSlugToId(courseSlug);
          if (!id) {
            if (!cancelled) {
              setError(`No se encontró curso con slug: ${courseSlug}`);
              setLoading(false);
            }
            return;
          }
          resolvedId = id;
          debug(`✅ [CourseDetail] Slug resuelto: ${courseSlug} → ${resolvedId}`);
        } else if (!resolvedId) {
          if (!cancelled) {
            setError("No se proporcionó información del curso");
            setLoading(false);
          }
          return;
        }

        // ── Paso 2: curso, lecciones, slug inverso e inscripción en paralelo ──
        const coursePromise = supabase
          .from("courses").select("*").eq("id", resolvedId).single();

        const lessonsPromise = supabase
          .from("lessons").select("*").eq("course_id", resolvedId)
          .order("order_index", { ascending: true });

        const slugPromise = resolvedSlug
          ? Promise.resolve(resolvedSlug)
          : resolveCourseIdToSlug(resolvedId);

        const enrollPromise = isLoggedIn
          ? supabase.auth.getUser()
              .then(async ({ data: { user } }) => {
                if (!user) return false;
                debug(`🔍 [CourseDetail] Verificando inscripción: usuario ${user.id} en curso ${resolvedId}`);
                return isUserEnrolled(user.id, resolvedId!);
              })
              .catch(() => false)
          : Promise.resolve(false as boolean);

        const [courseResult, lessonsResult, slug, enrolled] = await Promise.all([
          coursePromise, lessonsPromise, slugPromise, enrollPromise,
        ]);

        if (cancelled) return;

        // ── Procesar resultados ──
        if (courseResult.error) {
          logError("Error al cargar curso:", courseResult.error);
          throw courseResult.error;
        }

        const course = courseResult.data;
        if (course.instructor_id) {
          try {
            // Intentar buscar primero en la tabla teachers (pública)
            const { data: teacherData, error: teacherError } = await supabase
              .from("teachers")
              .select("full_name")
              .or(`id.eq.${course.instructor_id},user_id.eq.${course.instructor_id}`)
              .maybeSingle();

            if (teacherData && teacherData.full_name) {
              course.instructor_name = teacherData.full_name;
            } else {
              // Fallback a profiles (podría fallar por RLS si no está autenticado o no es admin)
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", course.instructor_id)
                .maybeSingle();
                
              if (profileData && profileData.full_name) {
                course.instructor_name = profileData.full_name;
              }
            }
          } catch (e) {
            debug("Error fetching instructor:", e);
          }
        }

        setCourseId(resolvedId);
        setCourseData(course);
        setCurrentSlug(slug ?? undefined);
        setUserEnrolled(!!enrolled);

        if (lessonsResult.error) {
          logError("Error al cargar lecciones:", lessonsResult.error);
          setLessons([]);
        } else {
          debug("Lecciones cargadas:", lessonsResult.data?.length || 0);
          setLessons(lessonsResult.data || []);
        }

        setError(null);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          logError("Error cargando curso:", message);
          setError(message || "Error al cargar los datos del curso");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCheckingEnrollment(false);
        }
      }
    };

    loadCourse();
    return () => { cancelled = true; };
  }, [initialCourseId, courseSlug, isLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0B5FFF] animate-spin" />
          <div className="text-center">
            <p className="text-[#0F172A] font-medium">Cargando curso</p>
            <p className="text-[#64748B] text-sm mt-1">Un momento por favor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Curso no encontrado"}</div>
      </div>
    );
  }

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      // Usuario no autenticado, abrir modal de login
      onAuthRequired?.("checkout", courseId);
    } else if (userEnrolled) {
      // Usuario ya inscrito, ir a la primera lección
      onNavigate?.("lesson", courseId, currentSlug, "1");
    } else {
      // Usuario autenticado pero no inscrito, ir directamente a checkout
      onNavigate?.("checkout", courseId, currentSlug);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumbs */}


      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {courseData.category && (
                  <Badge className="border border-white/30 bg-[#0B5FFF]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(11,95,255,0.3)]">
                    {courseData.category}
                  </Badge>
                )}
                {courseData.level && (
                  <Badge className="border border-white/30 bg-[#16A34A]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(22,163,74,0.3)]">
                    {courseData.level}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-[#0F172A]">
                {courseData.title}
              </h1>

              <div className="text-sm font-medium text-[#64748B]">
                {courseData.instructor_name ? (
                  <span>Profesor: <span className="text-[#0F172A]">{String(courseData.instructor_name)}</span></span>
                ) : (
                  <span className="italic">Aún no se identificó el profesor de este curso</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[#64748B]">
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>{lessons.length} lecciones</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <ImageWithFallback
                src={courseData.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"}
                alt={courseData.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <Button
                    className="h-16 w-16 rounded-full bg-white text-[#0B5FFF] hover:bg-blue-50 mb-3"
                    onClick={handleEnrollClick}
                  >
                    <Play className="h-8 w-8" />
                  </Button>
                  <p className="text-sm text-white">Vista previa del curso</p>
                </div>
              </div>
            </div>

            {/* Mobile CTA Buttons - Show only on mobile */}
            <div className="lg:hidden">
              <Card className="border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(11,95,255,0.12)]">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
                <CardContent className="space-y-4 p-4 bg-white/20">
                  <div className="grid grid-cols-2 gap-3 text-sm text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>8 horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Básico</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Certificado</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <Button
                      className={`w-full ${userEnrolled ? 'bg-[#16A34A] hover:bg-[#15803d]' : ''}`}
                      size="lg"
                      onClick={handleEnrollClick}
                      disabled={checkingEnrollment}
                    >
                      <Award className="mr-2 h-5 w-5" />
                      {checkingEnrollment ? 'Verificando...' : userEnrolled ? 'Empezar Curso' : 'Inscribirme Ahora'}
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Precio del curso</span>
                      <span className="text-xl font-bold text-[#0F172A]">
                        {courseData.price ? `ARS $${courseData.price.toLocaleString()}` : "Gratis"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">
                      Certificado emitido al completar el curso y aprobar la evaluación
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description" className="flex-none">Descripción</TabsTrigger>
                <TabsTrigger value="content" className="flex-none">Contenido</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#64748B]">
                      {courseData.full_description || courseData.description || "Sin descripción disponible"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contenido del curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lessons.length > 0 ? (
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0B5FFF]/10 flex items-center justify-center text-[#0B5FFF] font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[#0F172A]">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-[#64748B] mt-1">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#64748B] text-center py-4">No hay lecciones disponibles</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden space-y-6 lg:block">
            <Card className="sticky top-24 border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(11,95,255,0.12)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
              <CardContent className="space-y-6 p-6 bg-white/20">
                <div className="space-y-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Clock className="h-5 w-5" />
                    <span>{courseData.duration || "8 horas"} de contenido</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <BarChart3 className="h-5 w-5" />
                    <span>Nivel {courseData.level || "Básico"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Award className="h-5 w-5" />
                    <span>{courseData.certified ? "Certificado al finalizar" : "Sin certificado"}</span>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#64748B]">Precio del curso</span>
                    <span className="text-2xl font-bold text-[#0F172A]">
                      {courseData.price ? `ARS $${courseData.price.toLocaleString()}` : "Gratis"}
                    </span>
                  </div>
                  
                  <Button
                    className={`w-full ${userEnrolled ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-[#0066FF] hover:bg-[#0052CC]'}`}
                    onClick={handleEnrollClick}
                    disabled={checkingEnrollment}
                  >
                    {checkingEnrollment ? 'Verificando...' : userEnrolled ? 'Empezar Curso' : 'Inscribirme Ahora'}
                  </Button>
                  
                  <p className="text-xs text-[#64748B] text-center">
                    Certificado emitido al completar el curso y aprobar la evaluación
                  </p>
                </div>

                <div className="space-y-2 border-t pt-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#64748B]">
                      Acceso inmediato a todas las lecciones
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#64748B]">
                      Certificado digital oficial al aprobar
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#64748B]">
                      Pago seguro con Mercado Pago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
