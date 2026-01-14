import { Clock, BarChart3, Award, Play, CheckCircle, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
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
  const [courseData, setCourseData] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(courseSlug);
  const [userEnrolled, setUserEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  // ✅ PASO 1: Resolver courseSlug a courseId si es necesario
  useEffect(() => {
    const resolveSlug = async () => {
      // Si ya tenemos courseId, no hacer nada
      if (courseId) return;
      
      // Si no tenemos courseId pero sí slug, resolver
      if (!courseId && courseSlug) {
        debug(`🔄 [CourseDetail] Resolviendo slug: ${courseSlug}`);
        const resolvedId = await resolveCourseSlugToId(courseSlug);
        
        if (resolvedId) {
          debug(`✅ [CourseDetail] Slug resuelto: ${courseSlug} → ${resolvedId}`);
          setCourseId(resolvedId);
          setCurrentSlug(courseSlug);
        } else {
          setError(`No se encontró curso con slug: ${courseSlug}`);
          setLoading(false);
        }
      } else if (!courseId && !courseSlug) {
        // No hay ni courseId ni courseSlug
        setError("No se proporcionó información del curso");
        setLoading(false);
      }
    };
    
    resolveSlug();
  }, [courseSlug, courseId]);

  // ✅ PASO 1.5: Resolver courseId a slug si tenemos ID pero no slug
  useEffect(() => {
    const resolveIdToSlug = async () => {
      // Si ya tenemos slug, no hacer nada
      if (currentSlug) return;
      
      // Si tenemos courseId pero no slug, resolver
      if (courseId && !currentSlug) {
        debug(`🔄 [CourseDetail] Resolviendo courseId a slug: ${courseId}`);
        const resolvedSlug = await resolveCourseIdToSlug(courseId);
        
        if (resolvedSlug) {
          debug(`✅ [CourseDetail] CourseId resuelto: ${courseId} → ${resolvedSlug}`);
          setCurrentSlug(resolvedSlug);
        } else {
          debug(`⚠️ [CourseDetail] No se pudo resolver slug para courseId: ${courseId}`);
          // No es un error crítico, continuar sin slug
        }
      }
    };
    
    resolveIdToSlug();
  }, [courseId, currentSlug]);

  // ✅ PASO 1.7: Verificar si el usuario está inscrito (solo si está logueado)
  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (!isLoggedIn || !courseId) {
        setUserEnrolled(false);
        return;
      }

      try {
        setCheckingEnrollment(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserEnrolled(false);
          return;
        }
        
        debug(`🔍 [CourseDetail] Verificando inscripción: usuario ${user.id} en curso ${courseId}`);
        const enrolled = await isUserEnrolled(user.id, courseId);
        
        if (enrolled) {
          debug(`✅ [CourseDetail] Usuario inscrito en curso`);
        } else {
          debug(`ℹ️ [CourseDetail] Usuario NO inscrito en curso`);
        }
        
        setUserEnrolled(enrolled);
      } catch (err) {
        logError("Error verificando inscripción:", err);
        setUserEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    
    checkUserEnrollment();
  }, [courseId, isLoggedIn]);

  // ✅ PASO 2: Cargar datos del curso cuando tengamos courseId
  useEffect(() => {
    // Esperar a tener courseId antes de cargar
    if (!courseId) {
      return;
    }

    const loadCourseData = async () => {
      try {
        setLoading(true);
        debug("Cargando curso con ID:", courseId);
        
        // Cargar datos del curso
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) {
          logError("Error al cargar curso:", courseError);
          throw courseError;
        }
        
        debug("Curso cargado:", course);
        setCourseData(course);

        // Cargar lecciones del curso (ordenar por order_index, no 'order')
        const { data: courseLessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });

        if (lessonsError) {
          logError("Error al cargar lecciones:", lessonsError);
          // No bloquear si no hay lecciones
          setLessons([]);
        } else {
          debug("Lecciones cargadas:", courseLessons?.length || 0);
          setLessons(courseLessons || []);
        }
        
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando curso...</div>
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
