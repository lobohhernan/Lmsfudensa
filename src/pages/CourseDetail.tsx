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

interface CourseDetailProps {
  onNavigate?: (page: string, courseId?: string) => void;
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

export function CourseDetail({ onNavigate }: CourseDetailProps) {
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
                <BreadcrumbLink onClick={() => onNavigate?.("catalog")} className="cursor-pointer">
                  Catálogo
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>RCP Adultos AHA 2020</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#0B5FFF] text-white">Salud</Badge>
                <Badge className="bg-[#16A34A] text-white">RCP</Badge>
                <Badge className="bg-[#22C55E] text-white">Certificado</Badge>
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
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-white text-[#0B5FFF] hover:bg-blue-50"
                  onClick={() => onNavigate?.("lesson")}
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>

            {/* Mobile CTA Buttons - Show only on mobile */}
            <div className="lg:hidden">
              <Card>
                <CardContent className="space-y-4 p-4">
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
                      onClick={() => onNavigate?.("lesson")}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Estudiar Gratis
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => onNavigate?.("checkout")}
                    >
                      <Award className="mr-2 h-5 w-5" />
                      Obtener Certificado
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Precio certificado</span>
                      <span className="text-xl font-bold text-[#0F172A]">ARS $29.900</span>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">
                      * Pago procesado mediante Mercado Pago
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
                <TabsTrigger value="reviews" className="flex-none">Reseñas</TabsTrigger>
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

              <TabsContent value="content" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contenido del curso</CardTitle>
                    <CardDescription>8 lecciones • 3h 10min de contenido</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {courseLessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-[#F8FAFC]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B5FFF]/10">
                              {lesson.type === "video" ? (
                                <Play className="h-4 w-4 text-[#0B5FFF]" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-[#F59E0B]" />
                              )}
                            </div>
                            <div>
                              <p className="text-[#0F172A]">
                                {index + 1}. {lesson.title}
                              </p>
                              <p className="text-sm text-[#64748B]">{lesson.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de estudiantes</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="text-2xl">4.9</span>
                      </div>
                      <div className="text-[#64748B]">2,450 valoraciones</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {reviews.map((review, index) => (
                      <div key={index} className="space-y-3 border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={review.avatar} alt={review.name} />
                              <AvatarFallback>{review.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-[#0F172A]">{review.name}</p>
                              <p className="text-sm text-[#64748B]">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#64748B]">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tu instructor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor"
                          alt="Dr. Juan Pérez"
                        />
                        <AvatarFallback>JP</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-[#0F172A]">Dr. Juan Pérez</h3>
                        <p className="mb-2 text-[#64748B]">
                          Médico Emergentólogo • Instructor AHA
                        </p>
                        <div className="flex gap-4 text-sm text-[#64748B]">
                          <span>⭐ 4.9 calificación</span>
                          <span>👨‍🎓 25,000 estudiantes</span>
                          <span>📚 12 cursos</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#64748B]">
                      Médico especialista en emergencias con más de 15 años de experiencia.
                      Instructor certificado de la American Heart Association con amplia trayectoria
                      en la formación de profesionales de la salud en técnicas de soporte vital.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden space-y-6 lg:block">
            <Card className="sticky top-24">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
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
                    <span>Certificado incluido</span>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-6">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => onNavigate?.("lesson")}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Estudiar Gratis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => onNavigate?.("checkout")}
                  >
                    <Award className="mr-2 h-5 w-5" />
                    Obtener Certificado
                  </Button>
                </div>

                <div className="space-y-3 border-t pt-6">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Precio certificado</span>
                    <span className="text-xl font-bold text-[#0F172A]">ARS $29.900</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    * Pago procesado en Pesos Argentinos mediante Mercado Pago
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
