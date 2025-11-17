import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Award, List, Youtube, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { LessonList, Lesson } from "../components/LessonList";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { resolveCourseSlugToId } from "../lib/courseResolver"
import { isUserEnrolled } from "../lib/enrollments"
import { toast } from "sonner"

interface LessonPlayerProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => void;
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
}

// Extendemos el tipo Lesson para incluir youtubeId
interface LessonWithYoutube extends Lesson {
  youtubeId?: string;
}

// comments placeholder removed (unused)

export function LessonPlayer({ onNavigate, courseId: initialCourseId, courseSlug, lessonId }: LessonPlayerProps) {
  const [lessons, setLessons] = useState<LessonWithYoutube[]>([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState(lessonId || "1");
  const [showSidebar, setShowSidebar] = useState(false);
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [savingProgress, setSavingProgress] = useState(false);

  // ✅ PASO 1: Resolver courseSlug a courseId si es necesario
  useEffect(() => {
    const resolveSlug = async () => {
      // Si ya tenemos courseId, no hacer nada
      if (courseId) return;
      
      // Si no tenemos courseId pero sí slug, resolver
      if (!courseId && courseSlug) {
        console.log(`🔄 [LessonPlayer] Resolviendo slug: ${courseSlug}`);
        const resolvedId = await resolveCourseSlugToId(courseSlug);
        
        if (resolvedId) {
          console.log(`✅ [LessonPlayer] Slug resuelto: ${courseSlug} → ${resolvedId}`);
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

  // ✅ PASO 2: Cargar curso y lecciones desde Supabase
  useEffect(() => {
    // Esperar a tener courseId antes de cargar
    if (!courseId) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // ✅ VERIFICAR SI EL USUARIO ESTÁ INSCRITO ANTES DE CARGAR
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const enrolled = await isUserEnrolled(user.id, courseId);
          
          if (!enrolled) {
            // ❌ Usuario NO inscrito → Redirigir a la página del curso
            console.log('⚠️ [LessonPlayer] Usuario no inscrito, redirigiendo a CourseDetail');
            toast.error("Debes inscribirte en el curso para acceder a las lecciones");
            setLoading(false);
            setTimeout(() => {
              // ✅ Mantener courseId y courseSlug al redirigir
              onNavigate?.("course", courseId, courseSlug);
            }, 1500);
            return;
          }
          
          console.log('✅ [LessonPlayer] Usuario inscrito, cargando lecciones...');
        } else {
          // ❌ Usuario NO autenticado → Redirigir a CourseDetail
          console.log('⚠️ [LessonPlayer] Usuario no autenticado, redirigiendo');
          toast.error("Debes iniciar sesión para acceder al curso");
          setLoading(false);
          setTimeout(() => {
            // ✅ Mantener courseId y courseSlug al redirigir
            onNavigate?.("course", courseId, courseSlug);
          }, 1500);
          return;
        }

        // Cargar curso
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

        // Cargar lecciones
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });

        if (lessonsError) throw lessonsError;

        // ✅ Cargar progreso del usuario desde user_progress
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .eq("completed", true);

        // Crear Set de lecciones completadas para búsqueda O(1)
        const completedIds = new Set(
          (progressData || []).map((p: any) => p.lesson_id)
        );
        setCompletedLessons(completedIds);

        console.log(`✅ [LessonPlayer] Progreso cargado: ${completedIds.size} lecciones completadas`);

        // Mapear a formato esperado y marcar completadas
        const mappedLessons: LessonWithYoutube[] = (lessonsData || []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "N/A",
          type: lesson.type || "video",
          completed: completedIds.has(lesson.id), // ✅ Marcar desde DB
          locked: lesson.locked || false,
          youtubeId: lesson.youtube_id || null,
        }));

        setLessons(mappedLessons);
        setError(null);
      } catch (err: any) {
        console.error("Error cargando datos:", err);
        setError(err.message || "Error al cargar el curso");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const currentLessonData = lessons.find((l) => l.id === currentLesson);
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson);
  const isCurrentLessonCompleted = currentLessonData?.completed || false;

  // Función para marcar la lección actual como completada
  const handleMarkComplete = async () => {
    try {
      setSavingProgress(true);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión para guardar tu progreso");
        return;
      }

      if (!courseId) {
        toast.error("No se pudo identificar el curso");
        return;
      }

      // ✅ Guardar en base de datos usando la función SQL
      const { error: saveError } = await supabase.rpc('mark_lesson_complete', {
        p_user_id: user.id,
        p_course_id: courseId,
        p_lesson_id: currentLesson
      });

      if (saveError) {
        console.error('❌ Error guardando progreso:', saveError);
        toast.error("Error al guardar tu progreso");
        return;
      }

      // ✅ Actualizar estado local
      setCompletedLessons(prev => new Set(prev).add(currentLesson));
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === currentLesson 
            ? { ...lesson, completed: true }
            : lesson
        )
      );

      console.log(`✅ [LessonPlayer] Progreso guardado: Lección ${currentLesson} completada`);
      toast.success("¡Lección completada! Tu progreso ha sido guardado");

    } catch (err: any) {
      console.error('❌ Error al marcar como completada:', err);
      toast.error("Error al guardar tu progreso");
    } finally {
      setSavingProgress(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#0B5FFF]" />
          <p className="text-[#64748B]">Cargando lección...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error || "Curso no encontrado"}</p>
          <Button onClick={() => onNavigate?.("catalog")}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("course", courseId, courseSlug)}
            >
              <ChevronLeft className="h-5 w-5" />
              Volver al curso
            </Button>
            <div className="hidden md:block">
              <h2 className="text-[#0F172A]">{courseData?.title || "Curso"}</h2>
              <p className="text-sm text-[#64748B]">Lección {currentIndex + 1} de {lessons.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 lg:p-6">
            {/* Video Player */}
            <div className="relative mb-6 overflow-hidden rounded-lg bg-black shadow-2xl">
              <div className="relative aspect-video">
                {currentLessonData?.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentLessonData.youtubeId}?rel=0&modestbranding=1&fs=1&cc_load_policy=1`}
                    title={currentLessonData.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                    style={{ border: 0 }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e467c] to-[#55a5c7]">
                    <div className="text-center text-white p-8">
                      <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl mb-2">Contenido no disponible</p>
                      <p className="text-sm opacity-75">Este contenido no tiene video asignado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-[#0F172A]">{currentLessonData?.title}</h1>
                {currentLessonData?.youtubeId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${currentLessonData.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0066FF] transition-colors"
                  >
                    <Youtube className="h-4 w-4" />
                    Ver en YouTube
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  onClick={handleMarkComplete}
                  variant={isCurrentLessonCompleted ? "default" : "default"}
                  className={isCurrentLessonCompleted ? "bg-[#22C55E] hover:bg-[#16A34A]" : ""}
                  disabled={savingProgress || isCurrentLessonCompleted}
                >
                  {savingProgress ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  {savingProgress ? "Guardando..." : (isCurrentLessonCompleted ? "Completada ✓" : "Marcar como completada")}
                </Button>
                {currentIndex < lessons.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentLesson(lessons[currentIndex + 1].id)}
                  >
                    Siguiente lección
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                {/* Mobile Course Content Button */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <List className="mr-2 h-5 w-5" />
                  Contenido del curso
                </Button>
              </div>
            </div>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#64748B]">
                  En esta lección aprenderás a reconocer los signos y síntomas de un paro
                  cardíaco. Es fundamental identificar rápidamente la situación para poder
                  actuar de manera efectiva y aumentar las posibilidades de supervivencia de
                  la víctima.
                </p>
                <div>
                  <h3 className="mb-3 text-[#0F172A]">Puntos clave:</h3>
                  <ul className="space-y-2 text-[#64748B]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#55a5c7]" />
                      <span>Evaluación de consciencia y respiración</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#55a5c7]" />
                      <span>Activación del sistema de emergencias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#55a5c7]" />
                      <span>Verificación del pulso carotídeo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#55a5c7]" />
                      <span>Reconocimiento de signos de paro cardíaco</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <aside className={`${showSidebar ? 'fixed inset-0 z-50 bg-white' : 'hidden'} w-full lg:relative lg:block lg:w-96 lg:border-l`}>
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between lg:block">
              <h3 className="text-[#0F172A]">Contenido del curso</h3>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <LessonList
              lessons={lessons}
              currentLessonId={currentLesson}
              onLessonClick={(id) => {
                setCurrentLesson(id);
                setShowSidebar(false);
              }}
            />
            
            {/* Evaluation Button */}
            <div className="mt-6 space-y-3 rounded-lg border-2 border-[#1e467c] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-[#1e467c]">
                <Award className="h-5 w-5" />
                <h4 className="font-semibold">Evaluación Final</h4>
              </div>
              <p className="text-sm text-[#64748B]">
                Completa la evaluación para obtener tu certificado
              </p>
              <Button 
                onClick={() => onNavigate?.("evaluation")}
                className="w-full"
              >
                Iniciar Evaluación
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
