import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Play, Pause, Volume2, Maximize, Award, List } from "lucide-react";
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
  const [showSidebar, setShowSidebar] = useState(false);
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
          <div className="mx-auto w-full max-w-5xl p-4 lg:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                {/* Bottom Controls - Liquid Glass Effect */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.3)] p-4">
                  {/* Glass effect top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <Progress value={lessonProgress} className="mb-3 h-1" />
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 hover:backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
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
                        className="text-white hover:bg-white/20 hover:backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 hover:backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
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
