import { ArrowRight, Award, CheckCircle, MessageCircle, Star, Play, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Progress } from "../components/ui/progress";
import cprTrainingImage from "../assets/section-home.png";
import { useCoursesRealtime } from "../hooks/useCoursesRealtime";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface HomeProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string) => void;
  isLoggedIn?: boolean;
}

interface CourseInProgress {
  id: string;
  title: string;
  slug: string;
  image: string;
  progress: number;
  currentLesson: string;
  totalLessons: number;
  completedLessons: number;
}

const testimonials = [
  {
    name: "María González",
    role: "Enfermera Profesional",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content: "Excelente plataforma. Los cursos son muy completos y el certificado es válido internacionalmente. Totalmente recomendado.",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    role: "Paramédico",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    content: "La calidad del contenido es excepcional. Pude certificarme sin salir de casa y con soporte constante del equipo.",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    role: "Estudiante de Medicina",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    content: "Los videos son muy didácticos y las evaluaciones realmente ponen a prueba lo aprendido. Gran experiencia de aprendizaje.",
    rating: 5,
  },
];

export function Home({ onNavigate, isLoggedIn = false }: HomeProps) {
  const { courses: allCourses } = useCoursesRealtime();
  const [coursesInProgress, setCoursesInProgress] = useState<CourseInProgress[]>([]);
  
  // Cargar cursos en progreso del usuario desde enrollments
  useEffect(() => {
    if (!isLoggedIn) {
      setCoursesInProgress([]);
      return;
    }

    const loadUserCourses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: enrollments, error } = await supabase
          .from("enrollments")
          .select(`
            id,
            course_id,
            progress,
            last_lesson_id,
            courses (
              id,
              title,
              slug,
              image
            )
          `)
          .eq("user_id", user.id)
          .order('last_accessed_at', { ascending: false })
          .limit(2);

        if (!error && enrollments) {
          const mapped: CourseInProgress[] = enrollments
            .filter((e: any) => e.courses)
            .map((e: any) => ({
              id: e.courses.id,
              title: e.courses.title,
              slug: e.courses.slug,
              image: e.courses.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400",
              progress: e.progress || 0,
              currentLesson: "Continuar donde lo dejaste",
              totalLessons: 8, // TODO: Calcular del curso real
              completedLessons: Math.floor((e.progress || 0) / 100 * 8),
            }));
          setCoursesInProgress(mapped);
        }
      } catch (err) {
        console.error("Error cargando cursos en progreso:", err);
      }
    };

    loadUserCourses();
  }, [isLoggedIn]);
  
  // Mostrar los primeros 6 cursos en la sección destacada
  const displayCourses = allCourses.slice(0, 6).map(course => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    image: course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
    duration: course.duration || "8 horas",
    level: (course.level || "Básico") as "Básico" | "Intermedio" | "Avanzado",
    certified: course.certified || false,
    students: course.students,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-16 min-h-screen flex items-center text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={cprTrainingImage}
            alt="Entrenamiento de RCP con maniquí"
            className="h-full w-full object-cover"
          />
          {/* Vignette Effect - Brand Color */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_40%,rgba(30,70,124,0.4)_70%,rgba(30,70,124,0.8)_100%)]"></div>
          
          {/* Vertical Gradient - 3 Zonas: Azul intenso arriba, Centro transparente, Blanco sólido abajo */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(30,70,124,0.95)_0%,rgba(30,70,124,0.65)_20%,rgba(30,70,124,0.25)_40%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0.75)_80%,rgba(255,255,255,0.98)_100%)]"></div>
          
          {/* Gradient Overlay for Liquid Glass Effect - Reduced opacity for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e467c]/25 via-[#2d5f93]/15 to-[#55a5c7]/20"></div>
          
          {/* Liquid Glass Morphism Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3 backdrop-blur-[1px]"></div>
          
          {/* Top Glass Highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="flex items-center justify-center">
            <div className="max-w-3xl space-y-6 lg:space-y-8 text-center">
              <h1 className="hero-h1 drop-shadow-lg">
                Formación profesional en salud certificada
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-white/95 font-[Montserrat] drop-shadow-md">
                Cursos online certificados en RCP, primeros auxilios y atención médica de emergencia. Reconocidos internacionalmente y 100% a tu ritmo con soporte continuo.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row justify-center mt-6 lg:mt-8">
                {isLoggedIn ? (
                  <>
                    <Button
                      size="lg"
                      className="bg-[#FCD34D] text-[#1e467c] hover:bg-[#FDE047] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      onClick={() => onNavigate?.("lesson")}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Aprendiendo
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar más cursos
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="bg-[#FCD34D] text-[#1e467c] hover:bg-[#FDE047] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar Cursos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
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
        <section className="border-b bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-[#0F172A]">Continuar Aprendiendo</h2>
                <p className="text-[#64748B]">
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

            <div className="grid gap-6 sm:grid-cols-2">
              {coursesInProgress.map((course) => (
                <Card key={course.id} className="group relative overflow-hidden border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#0B5FFF]/40 hover:shadow-[0_8px_32px_0_rgba(11,95,255,0.15)] hover:scale-105 cursor-pointer">
                  {/* Glass effect top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
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
                          onClick={() => onNavigate?.("course", course.id, course.slug)}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6 bg-white/30 backdrop-blur-sm">
                      <h3 className="mb-3 text-[#0F172A] line-clamp-2">{course.title}</h3>
                      <div className="mb-3 flex items-center gap-2 text-sm text-[#64748B]">
                        <Clock className="h-4 w-4" />
                        <span>Lección actual: {course.currentLesson}</span>
                      </div>
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#64748B]">
                            {course.completedLessons} de {course.totalLessons} lecciones
                          </span>
                          <span className="font-semibold text-[#0B5FFF]">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <Button
                          className="mt-3 w-full"
                          onClick={() => onNavigate?.("course", course.id, course.slug)}
                        >
                          Continuar Curso
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-[#0F172A]">
                {isLoggedIn ? "Cursos Recomendados para Ti" : "Cursos Destacados"}
              </h2>
              <p className="text-[#64748B]">
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayCourses.length > 0 ? (
              displayCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  {...course}
                  onClick={() => onNavigate?.("course", course.id, course.slug)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-[#64748B]">
                Cargando cursos...
              </div>
            )}
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
      <section className="border-y bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="group relative border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#0B5FFF]/40 hover:shadow-[0_8px_32px_0_rgba(11,95,255,0.15)] hover:scale-105 cursor-pointer flex flex-col h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
              <CardContent className="space-y-3 p-6 text-center bg-white/20 flex flex-col items-center h-full">
                <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-[#0B5FFF]/30 bg-[#0B5FFF]/20 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <CheckCircle className="h-8 w-8 text-[#0B5FFF]" />
                </div>
                <h3 className="text-[#0F172A] min-h-[2rem] flex items-center">100% Online</h3>
                <p className="text-[#64748B] flex-1">
                  Estudia desde cualquier lugar, a tu propio ritmo y en tus horarios
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border border-[#16A34A]/20 bg-gradient-to-br from-white to-[#16A34A]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#16A34A]/40 hover:shadow-[0_8px_32px_0_rgba(22,163,74,0.15)] hover:scale-105 cursor-pointer flex flex-col h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#16A34A]/30 to-transparent" />
              <CardContent className="space-y-3 p-6 text-center bg-white/20 flex flex-col items-center h-full">
                <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-[#16A34A]/30 bg-[#16A34A]/20 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <Award className="h-8 w-8 text-[#16A34A]" />
                </div>
                <h3 className="text-[#0F172A] min-h-[2rem] flex items-center">Certificados Verificables</h3>
                <p className="text-[#64748B] flex-1">
                  Obtén certificaciones reconocidas internacionalmente con verificación blockchain
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border border-[#22C55E]/20 bg-gradient-to-br from-white to-[#22C55E]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#22C55E]/40 hover:shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] hover:scale-105 cursor-pointer flex flex-col h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent" />
              <CardContent className="space-y-3 p-6 text-center bg-white/20 flex flex-col items-center h-full">
                <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/20 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <MessageCircle className="h-8 w-8 text-[#22C55E]" />
                </div>
                <h3 className="text-[#0F172A] min-h-[2rem] flex items-center">Soporte WhatsApp</h3>
                <p className="text-[#64748B] flex-1">
                  Asistencia inmediata por WhatsApp para todas tus consultas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[#0F172A]">Lo que dicen nuestros estudiantes</h2>
            <p className="text-[#64748B]">
              Miles de profesionales ya confían en FUDENSA
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group relative border border-[#F59E0B]/20 bg-gradient-to-br from-white to-[#F59E0B]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#F59E0B]/40 hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] hover:scale-105 cursor-pointer flex flex-col h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/30 to-transparent" />
                <CardContent className="space-y-4 p-6 bg-white/20 flex flex-col h-full">
                  <div className="flex gap-1 flex-shrink-0">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <p className="text-[#64748B] flex-1 line-clamp-4">{testimonial.content}</p>
                  <div className="flex items-center gap-3 pt-4 flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-[#0F172A] truncate">{testimonial.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] py-24 text-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#55a5c7]/20 blur-3xl"></div>
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-[Montserrat] font-bold text-[24px]">¿Listo para comenzar tu certificación?</h2>
          <p className="mb-8 text-lg text-blue-100 font-[Montserrat]">
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
