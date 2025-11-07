import { Star, Clock, BarChart3, Globe, Award, Play, CheckCircle, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { instructors } from "../lib/data";

interface CourseDetailProps {
  onNavigate?: (page: string, courseId?: string) => void;
  isLoggedIn?: boolean;
  onAuthRequired?: (page: string, courseId?: string) => void;
}

const courseLessons = [
  { id: 1, title: "Introducción a RCP", duration: "15 min", type: "video" },
  { id: 2, title: "Anatomía del sistema cardiovascular", duration: "20 min", type: "video" },
  { id: 3, title: "Reconocimiento de paro cardíaco", duration: "18 min", type: "video" },
  { id: 4, title: "Compresiones torácicas efectivas", duration: "25 min", type: "video" },
  { id: 5, title: "Ventilaciones de rescate", duration: "22 min", type: "video" },
  { id: 6, title: "Uso del DEA", duration: "30 min", type: "video" },
  { id: 7, title: "RCP en casos especiales", duration: "20 min", type: "video" },
  { id: 8, title: "Evaluación de conocimientos", duration: "30 min", type: "quiz" },
];

const reviews = [
  {
    name: "Patricia Fernández",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
    rating: 5,
    date: "Hace 1 semana",
    comment: "Excelente curso, muy bien explicado y con ejemplos prácticos. El material es de alta calidad.",
  },
  {
    name: "Roberto Sánchez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    rating: 5,
    date: "Hace 2 semanas",
    comment: "Aprendí mucho, las técnicas están actualizadas según las guías AHA 2020. Totalmente recomendado.",
  },
  {
    name: "Laura Torres",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
    rating: 4,
    date: "Hace 3 semanas",
    comment: "Muy buen curso, solo me hubiera gustado más ejemplos de casos reales.",
  },
];

export function CourseDetail({ onNavigate, isLoggedIn, onAuthRequired }: CourseDetailProps) {
  // Por ahora usamos el primer instructor, pero esto debería venir del curso
  const courseInstructor = instructors[0];

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      // Usuario no autenticado, abrir modal de login
      onAuthRequired?.("checkout", "rcp-adultos-aha");
    } else {
      // Usuario autenticado, ir directamente a checkout
      onNavigate?.("checkout", "rcp-adultos-aha");
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
                <Badge className="border border-white/30 bg-[#0B5FFF]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(11,95,255,0.3)]">Salud</Badge>
                <Badge className="border border-white/30 bg-[#16A34A]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(22,163,74,0.3)]">RCP</Badge>
                <Badge className="border border-white/30 bg-[#22C55E]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(34,197,94,0.3)]">Certificado</Badge>
              </div>
              
              <h1 className="text-[#0F172A]">
                RCP Adultos AHA 2020 - Reanimación Cardiopulmonar
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[#64748B]">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-medium text-[#0F172A]">4.9</span>
                  <span className="hidden sm:inline">(2,450 valoraciones)</span>
                  <span className="sm:hidden">(2.4k)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span className="hidden sm:inline">12,450 estudiantes</span>
                  <span className="sm:hidden">12.4k estudiantes</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"
                alt="Curso preview"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <Button
                    size="lg"
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
                      <Globe className="h-4 w-4" />
                      <span>Español</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Certificado</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnrollClick}
                    >
                      <Award className="mr-2 h-5 w-5" />
                      Inscribirme Ahora
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Precio del curso</span>
                      <span className="text-xl font-bold text-[#0F172A]">ARS $29.900</span>
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
                <TabsTrigger value="instructor" className="flex-none">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#64748B]">
                      Aprende las técnicas de Reanimación Cardiopulmonar (RCP) para adultos según las
                      últimas guías de la American Heart Association (AHA) 2020. Este curso te
                      preparará para actuar con confianza en situaciones de emergencia cardíaca.
                    </p>
                    <p className="text-[#64748B]">
                      El curso incluye videos demostrativos de alta calidad, casos prácticos y
                      evaluaciones que te permitirán dominar las compresiones torácicas, ventilaciones
                      de rescate y el uso del DEA (Desfibrilador Externo Automático).
                    </p>

                    <div className="pt-4">
                      <h3 className="mb-3 text-[#0F172A]">Lo que aprenderás</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          "Reconocer un paro cardíaco",
                          "Realizar compresiones efectivas",
                          "Aplicar ventilaciones de rescate",
                          "Usar un DEA correctamente",
                          "RCP en casos especiales",
                          "Protocolo de actuación completo",
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#22C55E]" />
                            <span className="text-[#64748B]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4 pt-6">
                <Card>
                  <CardHeader className="bg-white/30 backdrop-blur-sm">
                    <CardTitle>Instructor del curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 bg-white/20">
                    {/* Perfil del instructor */}
                    <div className="flex flex-col sm:flex-row items-start gap-6 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
                      <Avatar className="h-24 w-24 border-2 border-[#0B5FFF]/20 shadow-lg">
                        <AvatarImage
                          src={courseInstructor.avatar}
                          alt={courseInstructor.name}
                        />
                        <AvatarFallback>{courseInstructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl text-[#0F172A]">{courseInstructor.name}</h3>
                          <p className="text-[#64748B]">{courseInstructor.title}</p>
                        </div>
                        
                        {/* Estadísticas del instructor */}
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 backdrop-blur-sm px-3 py-2">
                            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                            <span className="text-sm">{courseInstructor.rating} Valoración</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-[#0B5FFF]/20 bg-[#0B5FFF]/10 backdrop-blur-sm px-3 py-2">
                            <Users className="h-4 w-4 text-[#0B5FFF]" />
                            <span className="text-sm">{courseInstructor.students.toLocaleString()} Estudiantes</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-[#16A34A]/20 bg-[#16A34A]/10 backdrop-blur-sm px-3 py-2">
                            <Play className="h-4 w-4 text-[#16A34A]" />
                            <span className="text-sm">{courseInstructor.courses} Cursos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biografía */}
                    <div className="space-y-3">
                      <h4 className="text-[#0F172A]">Sobre el instructor</h4>
                      <p className="text-[#64748B] leading-relaxed">
                        {courseInstructor.biography}
                      </p>
                    </div>

                    {/* Credenciales y Certificaciones */}
                    {courseInstructor.credentials.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[#0F172A]">Credenciales y Certificaciones</h4>
                        <div className="grid gap-2">
                          {courseInstructor.credentials.map((credential, index) => (
                            <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200/50 bg-white/40 backdrop-blur-sm p-3">
                              <Award className="h-5 w-5 text-[#0B5FFF] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-[#0F172A]">{credential.title}</p>
                                <p className="text-xs text-[#64748B]">{credential.institution} - {credential.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experiencia Profesional */}
                    {courseInstructor.experience.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[#0F172A]">Experiencia Profesional</h4>
                        <div className="space-y-2 text-sm text-[#64748B]">
                          {courseInstructor.experience.map((exp, index) => (
                            <p key={index}>• {exp}</p>
                          ))}
                        </div>
                      </div>
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
                    <span>8 horas de contenido</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <BarChart3 className="h-5 w-5" />
                    <span>Nivel Básico</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Globe className="h-5 w-5" />
                    <span>Español</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Award className="h-5 w-5" />
                    <span>Certificado al finalizar</span>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#64748B]">Precio del curso</span>
                    <span className="text-2xl font-bold text-[#0F172A]">ARS $29.900</span>
                  </div>
                  
                  <Button
                    className="w-full bg-[#0066FF] hover:bg-[#0052CC]"
                    size="lg"
                    onClick={handleEnrollClick}
                  >
                    Inscribirme Ahora
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
