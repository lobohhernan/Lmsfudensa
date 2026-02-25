import { ArrowRight, Award, CheckCircle, MessageCircle, Star, Play, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import cprTrainingImage from "../assets/section-home.png";
import { useCoursesRealtime } from "../hooks/useCoursesRealtime";
import { useEnrollmentProgress } from "../hooks/useEnrollmentProgress";
import { useMemo, useRef } from "react";
import { debug } from "../lib/logger";

interface HomeProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => void;
  isLoggedIn?: boolean;
}

// ❌ Eliminados cursos hardcodeados - ahora se cargan desde enrollments reales

const testimonials = [
  {
    name: "María González",
    role: "Enfermera Profesional",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces",
    content: "Excelente plataforma. Los cursos son muy completos y el certificado es válido internacionalmente. Totalmente recomendado.",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    role: "Paramédico",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces",
    content: "La calidad del contenido es excepcional. Pude certificarme sin salir de casa y con soporte constante del equipo.",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    role: "Estudiante de Medicina",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=faces",
    content: "Los videos son muy didácticos y las evaluaciones realmente ponen a prueba lo aprendido. Gran experiencia de aprendizaje.",
    rating: 5,
  },
];

export function Home({ onNavigate, isLoggedIn = false }: HomeProps) {
  const { courses: allCourses, loading, error } = useCoursesRealtime();
  const { courses: coursesInProgress, loading: loadingEnrollments } = useEnrollmentProgress(isLoggedIn, 2);
  const continueLearningSectionRef = useRef<HTMLDivElement>(null);

  // Función para hacer scroll suave a la sección de Continuar Aprendiendo
  const scrollToContinueLearning = () => {
    if (continueLearningSectionRef.current) {
      const targetElement = continueLearningSectionRef.current;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;
      const elementHeight = targetElement.offsetHeight;
      const scrollPosition = targetPosition - (windowHeight - elementHeight) / 2;

      const startPosition = window.scrollY;
      const distance = scrollPosition - startPosition;
      const duration = 1000; // 1 segundo
      let start: number | null = null;

      const smoothScroll = (currentTime: number) => {
        if (start === null) start = currentTime;
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function para movimiento más suave (ease-in-out)
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (elapsed < duration) {
          requestAnimationFrame(smoothScroll);
        }
      };

      requestAnimationFrame(smoothScroll);
    }
  };
  
  debug('🏠 [Home] Renderizando:', { coursesCount: allCourses.length, loading, error, isLoggedIn, enrollmentsCount: coursesInProgress.length })
  
  // Mostrar los primeros 6 cursos en la sección destacada (memoized)
  const displayCourses = useMemo(() => allCourses.slice(0, 6).map(course => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    image: course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
    duration: course.duration || "8 horas",
    level: (course.level || "Básico") as "Básico" | "Intermedio" | "Avanzado",
    certified: course.certified || false,
    students: course.students,
  })), [allCourses]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-16 min-h-screen flex items-center text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={cprTrainingImage}
            alt="Grupo de profesionales de la salud practicando reanimación cardiopulmonar (RCP) utilizando un maniquí de entrenamiento realista"
            loading="eager"
            className="h-full w-full object-cover"
          />
          {/* Vignette Effect - Brand Color */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_40%,rgba(30,70,124,0.4)_70%,rgba(30,70,124,0.8)_100%)]"></div>
          
          {/* Vertical Gradient - 3 Zonas: Azul intenso arriba, Centro transparente, Blanco sólido abajo */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(30,70,124,0.95)_0%,rgba(30,70,124,0.65)_20%,rgba(30,70,124,0.25)_40%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0.75)_80%,rgba(255,255,255,0.98)_100%)]"></div>
          
          {/* Gradient Overlay for Liquid Glass Effect - Reduced opacity for better image visibility */}
          <div className="absolute inset-0 bg-linear-to-br from-[#1e467c]/25 via-[#2d5f93]/15 to-[#55a5c7]/20"></div>
          
          {/* Liquid Glass Morphism Layer */}
          <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-white/3 backdrop-blur-[1px]"></div>
          
          {/* Top Glass Highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="flex items-center justify-center">
            <div className="max-w-3xl space-y-4 sm:space-y-6 lg:space-y-8 text-center">
              <h1 className="hero-h1 drop-shadow-lg">
                Formación profesional en salud certificada
              </h1>
              <p className="body-lg text-white font-[Montserrat] drop-shadow-md">
                Cursos online certificados en RCP, primeros auxilios y atención médica de emergencia. Reconocidos internacionalmente y 100% a tu ritmo con soporte continuo.
              </p>
              <div className="flex flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center mt-6 lg:mt-8">
                {isLoggedIn ? (
                  <>
                    <Button
                      size="lg"
                      className="w-auto bg-[#FCD34D] text-[#1e467c] hover:bg-[#FDE047] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      onClick={scrollToContinueLearning}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Aprendiendo
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-auto border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar más cursos
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-auto bg-[#FCD34D] text-[#1e467c] hover:bg-[#FDE047] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar Cursos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-auto border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                      onClick={() => onNavigate?.("contact")}
                    >
                      Contáctanos
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses In Progress - Only show when logged in */}
      {isLoggedIn && (
        <section ref={continueLearningSectionRef} className="border-b bg-white py-12" role="region" aria-labelledby="continue-learning-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 id="continue-learning-heading" className="heading-h4 mb-2 text-gray-900">Continuar Aprendiendo</h2>
                <p className="body-sm text-gray-600">
                  Retoma tus cursos donde los dejaste
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.("profile")}
                className="hidden sm:flex"
              >
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {loadingEnrollments ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="border border-[#0B5FFF]/20 bg-linear-to-br from-white to-[#0B5FFF]/5 overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Skeleton de imagen - h-48 para layout horizontal */}
                      <div className="relative h-48 w-full sm:h-auto sm:w-48 shrink-0">
                        <Skeleton className="h-full w-full" />
                      </div>
                      <div className="flex flex-1 flex-col p-4 gap-3">
                        {/* Skeleton de título */}
                        <Skeleton className="h-5 w-3/4" />
                        {/* Skeleton de lección actual */}
                        <Skeleton className="h-4 w-1/2" />
                        <div className="mt-auto space-y-3">
                          {/* Skeleton de progreso */}
                          <Skeleton className="h-4 w-full" />
                          {/* Skeleton de botón */}
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2" role="list" aria-label="Cursos en progreso">
                {coursesInProgress.map((course) => (
                <Card key={course.id} role="listitem" className="group relative overflow-hidden border border-info-200 bg-linear-to-br from-white to-info-50 backdrop-blur-sm transition-all duration-300 hover:border-info-300 hover:shadow-[0_8px_32px_0_rgba(14,165,233,0.15)] hover:scale-105 cursor-pointer">
                  {/* Glass effect top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-info-200 to-transparent" />
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 w-full sm:h-auto sm:w-48">
                      <ImageWithFallback
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          size="lg"
                          className="rounded-full"
                          onClick={() => {
                            if (course.id && course.slug) {
                              onNavigate?.("lesson", course.id, course.slug, "1");
                            }
                          }}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6 bg-white/30 backdrop-blur-sm">
                      <h3 className="mb-3 text-gray-900 line-clamp-2">{course.title}</h3>
                      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Lección actual: {course.currentLesson}</span>
                      </div>
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {course.completedLessons} de {course.totalLessons} lecciones
                          </span>
                          <span className="font-semibold text-info-500">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <Button
                          className="mt-3 w-full"
                          onClick={() => {
                            if (course.id && course.slug) {
                              onNavigate?.("lesson", course.id, course.slug, "1");
                            } else {
                              console.error('❌ [Home] No se pudo navegar: courseId o slug faltante', course);
                            }
                          }}
                        >
                          Continuar Curso
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Courses */}
        <section className="border-b py-12" role="region" aria-labelledby="featured-courses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="featured-courses-heading" className="heading-h3 mb-2 text-gray-900">
                {isLoggedIn ? "Cursos Recomendados para Ti" : "Cursos Destacados"}
              </h2>
              <p className="body-sm text-[#64748B]">
                {isLoggedIn 
                  ? "Basados en tu progreso y preferencias" 
                  : "Los cursos más populares de nuestra plataforma"}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => onNavigate?.("catalog")}
              className="hidden sm:flex"
            >
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Cursos destacados">
            {loading && (
              <>
                {[...Array(displayCourses.length || 3)].map((_, i) => (
                  <Card key={i} className="border border-[#0B5FFF]/20 bg-linear-to-br from-white to-[#0B5FFF]/5 overflow-hidden">
                    {/* Skeleton de imagen */}
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      {/* Skeleton de título */}
                      <Skeleton className="h-5 w-3/4" />
                      {/* Skeleton de descripción */}
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      {/* Skeleton de nivel */}
                      <Skeleton className="h-4 w-1/3 mt-2" />
                    </div>
                  </Card>
                ))}
              </>
            )}
            {error && (
              <div className="col-span-full text-center py-12">
                <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
                  <p className="font-semibold mb-2">Error al cargar cursos</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-3 text-red-600">Verifica que las políticas RLS estén aplicadas en Supabase</p>
                </div>
              </div>
            )}
            {!loading && !error && displayCourses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No hay cursos disponibles</p>
                <p className="text-sm text-gray-400 mt-2">Puede que las políticas RLS estén bloqueando el acceso</p>
              </div>
            )}
            {!loading && !error && displayCourses.length > 0 && displayCourses.map((course) => (
              <CourseCard
                key={course.id}
                role="listitem"
                {...course}
                onClick={() => onNavigate?.("course", course.id, course.slug)}
              />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Button
              variant="ghost"
              onClick={() => onNavigate?.("catalog")}
              className="w-full"
            >
              Ver todos los cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y bg-white py-16" role="region" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="benefits-heading" className="sr-only">Por qué elegir FUDENSA</h2>
          <div className="grid gap-8 md:grid-cols-3" role="list" aria-label="Beneficios de la plataforma">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-linear-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card role="listitem" className="text-card-foreground flex flex-col gap-6 rounded-xl border relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">100% Online</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Estudia desde cualquier lugar, a tu propio ritmo y en tus horarios
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-linear-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card role="listitem" className="text-card-foreground flex flex-col gap-6 rounded-xl border relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Cursos Certificados</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Obtén certificaciones avaladas para sumar a tu perfil profesional
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-linear-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card role="listitem" className="text-card-foreground flex flex-col gap-6 rounded-xl border relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Soporte WhatsApp</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Asistencia inmediata por WhatsApp para todas tus consultas
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16" role="region" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 id="testimonials-heading" className="heading-h4 mb-2 text-[#0F172A]">Lo que dicen nuestros estudiantes</h2>
            <p className="body-sm text-[#64748B]">
              Miles de profesionales ya confían en FUDENSA
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3" role="list" aria-label="Testimonios de estudiantes">
            {testimonials.map((testimonial, index) => (
              <Card key={index} role="listitem" className="group relative border border-warning-200 bg-linear-to-br from-white to-warning-50 backdrop-blur-sm transition-all duration-300 hover:border-warning-300 hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] hover:scale-105 cursor-pointer flex flex-col h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#F59E0B]/30 to-transparent" />
                <CardContent className="space-y-4 p-6 bg-white/20 flex flex-col h-full">
                  <div className="flex gap-1 shrink-0">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <p className="body-sm text-[#64748B] flex-1 line-clamp-4">{testimonial.content}</p>
                  <div className="flex items-center gap-3 pt-4 shrink-0">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="label-md text-[#0F172A] truncate">{testimonial.name}</p>
                      <p className="body-xs text-[#64748B] truncate">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] py-24 text-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#55a5c7]/20 blur-3xl"></div>
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-[Montserrat] font-bold text-[24px]">¿Listo para comenzar tu certificación?</h2>
          <p className="mb-8 text-lg text-white font-[Montserrat]">
            Únete a más de 50,000 profesionales certificados en toda América Latina
          </p>
          <Button
            size="lg"
            className="bg-[#FCD34D] text-[#1e467c] hover:bg-[#FDE047] shadow-lg"
            onClick={() => onNavigate?.("catalog")}
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
