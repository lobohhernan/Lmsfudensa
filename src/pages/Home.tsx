import { ArrowRight, Award, CheckCircle, MessageCircle, Star, Play, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Progress } from "../components/ui/progress";

interface HomeProps {
  onNavigate?: (page: string, courseId?: string) => void;
  isLoggedIn?: boolean;
}

const featuredCourses = [
  {
    id: "1",
    title: "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar",
    image: "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcHIlMjB0cmFpbmluZyUyMGR1bW15fGVufDF8fHx8MTc2MTg2MTMzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "8 horas",
    level: "Básico" as const,
    certified: true,
    students: 12450,
  },
  {
    id: "2",
    title: "RCP Neonatal - Soporte Vital Pediátrico Avanzado",
    image: "https://images.unsplash.com/photo-1725870475677-7dc91efe9f93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdHJhaW5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzYxODU4NjgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "12 horas",
    level: "Avanzado" as const,
    certified: true,
    students: 8320,
  },
  {
    id: "3",
    title: "Primeros Auxilios Básicos - Manejo de Emergencias",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJzdCUyMGFpZCUyMGNvdXJzZXxlbnwxfHx8fDE3NjE4NjEzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "6 horas",
    level: "Básico" as const,
    certified: true,
    students: 15680,
  },
  {
    id: "4",
    title: "Emergencias Médicas - Atención Prehospitalaria",
    image: "https://images.unsplash.com/photo-1644488483724-4daed4a30390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWVyZ2VuY3klMjBtZWRpY2FsJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzYxODYxMzMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "10 horas",
    level: "Intermedio" as const,
    certified: true,
    students: 9540,
  },
  {
    id: "5",
    title: "Certificación en Soporte Vital Cardiovascular",
    image: "https://images.unsplash.com/photo-1722235623200-59966a71af50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwY2VydGlmaWNhdGlvbnxlbnwxfHx8fDE3NjE4NjEzMzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "15 horas",
    level: "Avanzado" as const,
    certified: true,
    students: 6720,
  },
  {
    id: "6",
    title: "Atención de Heridas y Quemaduras - Técnicas Avanzadas",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJzdCUyMGFpZCUyMGNvdXJzZXxlbnwxfHx8fDE3NjE4NjEzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "8 horas",
    level: "Intermedio" as const,
    certified: true,
    students: 11230,
  },
];

const coursesInProgress = [
  {
    id: "1",
    title: "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar",
    image: "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcHIlMjB0cmFpbmluZyUyMGR1bW15fGVufDF8fHx8MTc2MTg2MTMzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 65,
    currentLesson: "Compresiones torácicas efectivas",
    totalLessons: 8,
    completedLessons: 5,
  },
  {
    id: "3",
    title: "Primeros Auxilios Básicos - Manejo de Emergencias",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJzdCUyMGFpZCUyMGNvdXJzZXxlbnwxfHx8fDE3NjE4NjEzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 30,
    currentLesson: "Vendajes y curaciones",
    totalLessons: 6,
    completedLessons: 2,
  },
];

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
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e467c] to-[#0f2847] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="hero-h1">
                {isLoggedIn 
                  ? "¡Bienvenido de nuevo a FUDENSA!" 
                  : "Aprendé y certifícate con FUDENSA"}
              </h1>
              <p className="text-lg text-blue-100 font-[Montserrat] text-[18px]">
                {isLoggedIn 
                  ? "Continúa tu formación profesional en salud. Tienes 2 cursos en progreso y nuevas recomendaciones esperándote." 
                  : "Cursos online certificados en RCP, primeros auxilios y atención médica de emergencia. Reconocidos internacionalmente y 100% a tu ritmo."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {isLoggedIn ? (
                  <>
                    <Button
                      size="lg"
                      className="bg-white text-[#0B5FFF] hover:bg-blue-50"
                      onClick={() => onNavigate?.("lesson")}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Aprendiendo
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white bg-transparent text-white hover:bg-white/10"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar más cursos
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="bg-white text-[#0B5FFF] hover:bg-blue-50"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Explorar Cursos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white bg-transparent text-white hover:bg-white/10"
                      onClick={() => onNavigate?.("catalog")}
                    >
                      Ver Programas
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1613151096599-b234757eb4d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnR8ZW58MXx8fHwxNzYxODI4MTM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Estudiante en línea"
                className="rounded-2xl shadow-2xl"
              />
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
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          onClick={() => onNavigate?.("lesson")}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
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
                          onClick={() => onNavigate?.("lesson")}
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
            {featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onClick={() => onNavigate?.("course", course.id)}
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
      <section className="border-y bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none shadow-none">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B5FFF]/10">
                  <CheckCircle className="h-8 w-8 text-[#0B5FFF]" />
                </div>
                <h3 className="text-[#0F172A]">100% Online</h3>
                <p className="text-[#64748B]">
                  Estudia desde cualquier lugar, a tu propio ritmo y en tus horarios
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10">
                  <Award className="h-8 w-8 text-[#16A34A]" />
                </div>
                <h3 className="text-[#0F172A]">Certificados Verificables</h3>
                <p className="text-[#64748B]">
                  Obtén certificaciones reconocidas internacionalmente con verificación blockchain
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/10">
                  <MessageCircle className="h-8 w-8 text-[#22C55E]" />
                </div>
                <h3 className="text-[#0F172A]">Soporte WhatsApp</h3>
                <p className="text-[#64748B]">
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
              <Card key={index}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <p className="text-[#64748B]">{testimonial.content}</p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#0F172A]">{testimonial.name}</p>
                      <p className="text-xs text-[#64748B]">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#0B5FFF] to-[#0849CC] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4">¿Listo para comenzar tu certificación?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Únete a más de 50,000 profesionales certificados en toda América Latina
          </p>
          <Button
            size="lg"
            className="bg-white text-[#0B5FFF] hover:bg-blue-50"
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
