import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Play, Pause, Volume2, Maximize, Award } from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { LessonList, Lesson } from "../components/LessonList";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface LessonPlayerProps {
  onNavigate?: (page: string) => void;
}

const lessons: Lesson[] = [
  { id: "1", title: "Introducción a RCP", duration: "15 min", type: "video", completed: true, locked: false },
  { id: "2", title: "Anatomía del sistema cardiovascular", duration: "20 min", type: "video", completed: true, locked: false },
  { id: "3", title: "Reconocimiento de paro cardíaco", duration: "18 min", type: "video", completed: false, locked: false },
  { id: "4", title: "Compresiones torácicas efectivas", duration: "25 min", type: "video", completed: false, locked: false },
  { id: "5", title: "Ventilaciones de rescate", duration: "22 min", type: "video", completed: false, locked: true },
  { id: "6", title: "Uso del DEA", duration: "30 min", type: "video", completed: false, locked: true },
  { id: "7", title: "RCP en casos especiales", duration: "20 min", type: "video", completed: false, locked: true },
  { id: "8", title: "Evaluación de conocimientos", duration: "30 min", type: "quiz", completed: false, locked: true },
];

const comments = [
  {
    id: 1,
    author: "María López",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria2",
    time: "Hace 2 horas",
    content: "Excelente explicación, muy clara y concisa. Gracias!",
    replies: 2,
  },
  {
    id: 2,
    author: "Carlos Mendez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos2",
    time: "Hace 5 horas",
    content: "Una pregunta: ¿cuántas compresiones por minuto se recomiendan?",
    replies: 1,
  },
];

export function LessonPlayer({ onNavigate }: LessonPlayerProps) {
  const [currentLesson, setCurrentLesson] = useState("3");
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(35);
  const currentLessonData = lessons.find((l) => l.id === currentLesson);
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson);
  const completedCount = lessons.filter((l) => l.completed).length;
  const courseProgress = (completedCount / lessons.length) * 100;

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("course")}
            >
              <ChevronLeft className="h-5 w-5" />
              Volver al curso
            </Button>
            <div className="hidden md:block">
              <h2 className="text-[#0F172A]">RCP Adultos AHA 2020</h2>
              <p className="text-sm text-[#64748B]">
                {completedCount} de {lessons.length} lecciones completadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden w-48 md:block">
              <Progress value={courseProgress} className="h-2" />
            </div>
            <span className="text-sm text-[#64748B]">{Math.round(courseProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 lg:p-6">
            {/* Video Player */}
            <div className="relative mb-6 overflow-hidden rounded-lg bg-black">
              <div className="relative aspect-video">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"
                  alt="Video lesson"
                  className="h-full w-full object-cover opacity-80"
                />
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                </div>
                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <Progress value={lessonProgress} className="mb-3 h-1" />
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <span className="text-sm">5:20 / 15:00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Info */}
            <div className="mb-6">
              <h1 className="mb-2 text-[#0F172A]">{currentLessonData?.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={() => setLessonProgress(100)}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Marcar como completada
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
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="comments">
                  Comentarios ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="help">Ayuda</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-[#64748B]">
                      En esta lección aprenderás a reconocer los signos y síntomas de un paro
                      cardíaco. Es fundamental identificar rápidamente la situación para poder
                      actuar de manera efectiva y aumentar las posibilidades de supervivencia de
                      la víctima.
                    </p>
                    <div className="mt-6">
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
              </TabsContent>

              <TabsContent value="comments" className="space-y-4 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deja tu comentario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Escribe tu pregunta o comentario..."
                      className="min-h-[100px]"
                    />
                    <Button>Publicar comentario</Button>
                  </CardContent>
                </Card>

                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={comment.avatar} alt={comment.author} />
                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[#0F172A]">{comment.author}</p>
                            <p className="text-sm text-[#64748B]">{comment.time}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mb-3 text-[#64748B]">{comment.content}</p>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {comment.replies} respuestas
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="help" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>¿Necesitas ayuda?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-[#0F172A]">Preguntas frecuentes</h3>
                      <div className="space-y-3 text-[#64748B]">
                        <div>
                          <p className="font-medium text-[#0F172A]">
                            ¿Cómo marco una lección como completada?
                          </p>
                          <p>
                            Haz clic en el botón "Marcar como completada" al finalizar la lección.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">
                            ¿Puedo volver a ver las lecciones?
                          </p>
                          <p>Sí, puedes acceder al contenido las veces que necesites.</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="mb-2 text-[#0F172A]">Contacto</h3>
                      <p className="text-[#64748B]">
                        Si tienes alguna pregunta, contáctanos por WhatsApp: +54 11 1234-5678
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <aside className="hidden w-96 border-l bg-white lg:block">
          <div className="h-full overflow-y-auto p-6">
            <h3 className="mb-4 text-[#0F172A]">Contenido del curso</h3>
            <LessonList
              lessons={lessons}
              currentLessonId={currentLesson}
              onLessonClick={setCurrentLesson}
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
