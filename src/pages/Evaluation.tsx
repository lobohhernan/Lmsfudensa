import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  RotateCcw,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { courses, type EvaluationQuestion } from "../lib/data";
import { CertificateTemplate, type CertificateData } from "../components/CertificateTemplate";
import { generateCertificatePDF, generateCertificateId, formatCertificateDate, generateCertificatePreview } from "../utils/certificate";
import { toast } from "sonner@2.0.3";

interface EvaluationProps {
  onNavigate?: (page: string) => void;
  courseId?: string;
}

const defaultEvaluationData: EvaluationQuestion[] = [
  {
    id: 1,
    question: "¿Cuál es la profundidad correcta de las compresiones torácicas en un adulto durante la RCP?",
    options: [
      "Al menos 3 cm",
      "Al menos 5 cm",
      "Al menos 7 cm",
      "Al menos 10 cm",
    ],
    correctAnswer: 1,
    explanation: "Las compresiones torácicas en adultos deben tener una profundidad de al menos 5 cm según las guías AHA 2020.",
  },
  {
    id: 2,
    question: "¿Cuál es la frecuencia recomendada de compresiones torácicas por minuto?",
    options: [
      "60-80 compresiones por minuto",
      "80-100 compresiones por minuto",
      "100-120 compresiones por minuto",
      "120-140 compresiones por minuto",
    ],
    correctAnswer: 2,
    explanation: "La frecuencia óptima es de 100-120 compresiones por minuto para mantener un flujo sanguíneo efectivo.",
  },
  {
    id: 3,
    question: "¿Cuál es la relación correcta de compresiones-ventilaciones en RCP de un solo reanimador en adultos?",
    options: [
      "15:2",
      "30:2",
      "15:1",
      "30:1",
    ],
    correctAnswer: 1,
    explanation: "La relación recomendada es de 30 compresiones seguidas de 2 ventilaciones en adultos.",
  },
  {
    id: 4,
    question: "¿Qué debe hacer PRIMERO al encontrar a una persona inconsciente?",
    options: [
      "Iniciar compresiones torácicas inmediatamente",
      "Verificar la escena por seguridad y verificar respuesta",
      "Dar dos ventilaciones de rescate",
      "Buscar un DEA",
    ],
    correctAnswer: 1,
    explanation: "Siempre debe verificar primero que la escena sea segura y luego verificar la respuesta de la víctima.",
  },
  {
    id: 5,
    question: "¿Cuándo debe activarse el sistema de emergencias médicas?",
    options: [
      "Después de 5 minutos de RCP",
      "Inmediatamente después de verificar que la persona no responde y no respira normalmente",
      "Solo si tiene un DEA disponible",
      "Después de dar las primeras ventilaciones",
    ],
    correctAnswer: 1,
    explanation: "Debe activar el sistema de emergencias inmediatamente después de confirmar que la víctima necesita ayuda.",
  },
  {
    id: 6,
    question: "¿Qué significa DEA?",
    options: [
      "Dispositivo Eléctrico Automático",
      "Desfibrilador Externo Automático",
      "Detector de Emergencias Avanzado",
      "Dispositivo de Emergencia Ambulatoria",
    ],
    correctAnswer: 1,
    explanation: "DEA significa Desfibrilador Externo Automático, un dispositivo que analiza el ritmo cardíaco y puede administrar una descarga eléctrica si es necesario.",
  },
  {
    id: 7,
    question: "¿En qué posición debe colocarse a una persona inconsciente que respira normalmente?",
    options: [
      "Boca arriba con las piernas elevadas",
      "Posición lateral de seguridad",
      "Sentado con la cabeza hacia adelante",
      "Boca abajo",
    ],
    correctAnswer: 1,
    explanation: "La posición lateral de seguridad ayuda a mantener las vías respiratorias abiertas y previene la aspiración.",
  },
  {
    id: 8,
    question: "¿Cuál es el primer paso para ayudar a una persona que se está atragantando y aún puede toser?",
    options: [
      "Realizar compresiones abdominales inmediatamente",
      "Golpes en la espalda",
      "Animar a la persona a seguir tosiendo",
      "Realizar barrido digital en la boca",
    ],
    correctAnswer: 2,
    explanation: "Si la persona puede toser, debe animársele a continuar tosiendo ya que es el mecanismo más efectivo para despejar la obstrucción.",
  },
  {
    id: 9,
    question: "¿Qué debe verificar antes de usar un DEA en una víctima?",
    options: [
      "Que la víctima esté completamente seca y no sobre metal",
      "Que tenga el pulso débil",
      "Que haya pasado al menos 10 minutos desde el colapso",
      "Que haya más de 3 personas presentes",
    ],
    correctAnswer: 0,
    explanation: "Es fundamental que la víctima esté seca y no sobre una superficie metálica para evitar que la descarga se conduzca incorrectamente.",
  },
  {
    id: 10,
    question: "¿Hasta cuándo debe continuar la RCP?",
    options: [
      "Hasta que llegue ayuda calificada, la víctima se recupere, o esté demasiado exhausto para continuar",
      "Solo durante 5 minutos",
      "Hasta que llegue el DEA",
      "Hasta completar 10 ciclos de compresiones",
    ],
    correctAnswer: 0,
    explanation: "La RCP debe continuar hasta que llegue ayuda profesional, la víctima muestre signos de recuperación, o el reanimador esté demasiado exhausto para continuar de manera efectiva.",
  },
];

export function Evaluation({ onNavigate, courseId = "1" }: EvaluationProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [evaluationData, setEvaluationData] = useState<EvaluationQuestion[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState<string>("");
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load evaluation questions for the specific course
    const course = courses.find((c) => c.id === courseId);
    if (course && course.evaluation && course.evaluation.length > 0) {
      setEvaluationData(course.evaluation);
      setCourseTitle(course.title);
    } else {
      // Fallback to default evaluation if course doesn't have one
      setEvaluationData(defaultEvaluationData);
      setCourseTitle("RCP Adultos AHA 2020");
    }
  }, [courseId]);

  const totalQuestions = evaluationData.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: parseInt(value),
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredQuestions < totalQuestions) {
      setShowSubmitDialog(true);
    } else {
      setIsSubmitted(true);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    setIsSubmitted(true);
    
    // Calculate score to check if passed
    const score = calculateScore();
    const passed = score.percentage >= 70;
    
    // Generate certificate if passed
    if (passed) {
      const course = courses.find((c) => c.id === courseId);
      const certData: CertificateData = {
        studentName: "Juan Pérez", // TODO: Obtener del usuario logueado
        dni: "12.345.678", // TODO: Obtener del usuario logueado
        courseName: courseTitle || course?.title || "Curso Completado",
        courseHours: course?.duration || "40",
        issueDate: formatCertificateDate(),
        certificateId: generateCertificateId(),
      };
      setCertificateData(certData);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    evaluationData.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    };
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setIsSubmitted(false);
    setTimeElapsed(0);
    setCertificateData(null);
    setShowCertificatePreview(false);
    setCertificatePreviewUrl("");
  };

  const handleViewCertificate = async () => {
    if (!certificateRef.current) {
      toast.error("No se pudo generar la vista previa");
      return;
    }

    try {
      const previewUrl = await generateCertificatePreview(certificateRef.current);
      setCertificatePreviewUrl(previewUrl);
      setShowCertificatePreview(true);
    } catch (error) {
      toast.error("Error al generar la vista previa");
      console.error("Error:", error);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || !certificateData) {
      toast.error("No se pudo generar el certificado");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateCertificatePDF(certificateRef.current, certificateData);
      toast.success("Certificado descargado exitosamente");
    } catch (error) {
      toast.error("Error al generar el certificado. Por favor, intente nuevamente.");
      console.error("Error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Results View
  if (isSubmitted) {
    const score = calculateScore();
    const passed = score.percentage >= 70;

    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F5F9]">
                {passed ? (
                  <CheckCircle2 className="h-12 w-12 text-[#55a5c7]" />
                ) : (
                  <XCircle className="h-12 w-12 text-[#EF4444]" />
                )}
              </div>
              <CardTitle className="text-[#0F172A]">
                {passed ? "¡Felicitaciones! Has aprobado" : "No has alcanzado el puntaje mínimo"}
              </CardTitle>
              <CardDescription>
                {passed
                  ? "Has completado exitosamente la evaluación del curso"
                  : "Necesitas un 70% o más para aprobar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-[#F8FAFC] p-4 text-center">
                  <div className="text-3xl text-[#1e467c]">{score.percentage}%</div>
                  <p className="text-sm text-[#64748B]">Puntaje</p>
                </div>
                <div className="rounded-lg bg-[#F8FAFC] p-4 text-center">
                  <div className="text-3xl text-[#0F172A]">
                    {score.correct}/{score.total}
                  </div>
                  <p className="text-sm text-[#64748B]">Respuestas Correctas</p>
                </div>
                <div className="rounded-lg bg-[#F8FAFC] p-4 text-center">
                  <div className="text-3xl text-[#0F172A]">
                    {totalQuestions - score.correct}
                  </div>
                  <p className="text-sm text-[#64748B]">Respuestas Incorrectas</p>
                </div>
              </div>

              {/* Review Answers */}
              <div className="space-y-4">
                <h3 className="text-[#0F172A]">Revisión de Respuestas</h3>
                {evaluationData.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const wasAnswered = userAnswer !== undefined;

                  return (
                    <Card key={question.id} className={!wasAnswered ? "opacity-60" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {wasAnswered ? (
                              isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-[#55a5c7]" />
                              ) : (
                                <XCircle className="h-5 w-5 text-[#EF4444]" />
                              )
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-[#CBD5E1]" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-[#0F172A]">
                              {index + 1}. {question.question}
                            </p>
                            {wasAnswered && (
                              <>
                                <p className="text-sm text-[#64748B]">
                                  Tu respuesta:{" "}
                                  <span
                                    className={
                                      isCorrect ? "text-[#55a5c7]" : "text-[#EF4444]"
                                    }
                                  >
                                    {question.options[userAnswer]}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm text-[#64748B]">
                                    Respuesta correcta:{" "}
                                    <span className="text-[#55a5c7]">
                                      {question.options[question.correctAnswer]}
                                    </span>
                                  </p>
                                )}
                                {question.explanation && (
                                  <p className="text-sm text-[#64748B] italic">
                                    {question.explanation}
                                  </p>
                                )}
                              </>
                            )}
                            {!wasAnswered && (
                              <p className="text-sm text-[#EF4444]">No respondida</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Certificate Section - Only if passed */}
              {passed && certificateData && (
                <Card className="bg-gradient-to-br from-[#55a5c7]/5 to-[#1e467c]/5 border-[#55a5c7]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1e467c]">
                      <Award className="h-6 w-6" />
                      Tu Certificado está Listo
                    </CardTitle>
                    <CardDescription>
                      ¡Felicitaciones! Has completado exitosamente el curso. Visualiza y descarga tu certificado oficial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={handleViewCertificate}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Ver Certificado
                    </Button>
                    <Button 
                      onClick={handleDownloadCertificate}
                      disabled={isGeneratingPDF}
                      size="lg"
                      className="w-full"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      {isGeneratingPDF ? "Generando PDF..." : "Descargar PDF"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {passed ? (
                  <>
                    <Button
                      onClick={() => onNavigate?.("profile")}
                      className="flex-1"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Ver Mis Certificados
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate?.("lesson")}
                      className="flex-1"
                    >
                      Volver al Curso
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleRetry} className="flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reintentar Evaluación
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate?.("lesson")}
                      className="flex-1"
                    >
                      Revisar Lecciones
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden Certificate Template for PDF Generation */}
        {certificateData && (
          <div className="fixed -left-[10000px] top-0">
            <CertificateTemplate ref={certificateRef} data={certificateData} />
          </div>
        )}

        {/* Certificate Preview Dialog */}
        <Dialog open={showCertificatePreview} onOpenChange={setShowCertificatePreview}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1e467c]">Vista Previa del Certificado</DialogTitle>
              <DialogDescription>
                Revisa tu certificado antes de descargarlo
              </DialogDescription>
            </DialogHeader>
            <div className="w-full overflow-auto">
              {certificatePreviewUrl && (
                <img 
                  src={certificatePreviewUrl} 
                  alt="Vista previa del certificado" 
                  className="w-full h-auto border-2 border-[#E2E8F0] rounded-lg shadow-lg"
                />
              )}
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowCertificatePreview(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setShowCertificatePreview(false);
                  handleDownloadCertificate();
                }}
                disabled={isGeneratingPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Check if there are questions
  if (evaluationData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F5F9]">
                <XCircle className="h-12 w-12 text-[#64748B]" />
              </div>
              <CardTitle className="text-[#0F172A]">No hay evaluación disponible</CardTitle>
              <CardDescription>
                Este curso aún no tiene una evaluación configurada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate?.("lesson")} className="w-full">
                Volver al Curso
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Question View
  const currentQuestionData = evaluationData[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Volver al contenido</span>
              </Button>
              <div>
                <h1 className="text-[#0F172A]">Evaluación Final</h1>
                <p className="text-sm text-[#64748B]">{courseTitle}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {answeredQuestions}/{totalQuestions}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#64748B]">
              <span>Progreso de la evaluación</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge className="bg-[#1e467c]">
                Pregunta {currentQuestion + 1} de {totalQuestions}
              </Badge>
              {selectedAnswer !== undefined && (
                <Badge variant="outline" className="border-[#55a5c7] text-[#55a5c7]">
                  Respondida
                </Badge>
              )}
            </div>
            <CardTitle className="text-[#0F172A]">
              {currentQuestionData.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options */}
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={handleAnswerChange}
            >
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                      selectedAnswer === index
                        ? "border-[#1e467c] bg-[#F8FAFC]"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-[#0F172A]"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 border-t pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {currentQuestion === totalQuestions - 1 ? (
                  <Button onClick={handleSubmit}>Finalizar Evaluación</Button>
                ) : (
                  <Button onClick={handleNext}>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Navegador de Preguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {evaluationData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border-2 transition-all ${
                    currentQuestion === index
                      ? "border-[#1e467c] bg-[#1e467c] text-white"
                      : answers[index] !== undefined
                      ? "border-[#55a5c7] bg-[#55a5c7] text-white"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de enviar la evaluación?</AlertDialogTitle>
            <AlertDialogDescription>
              Has respondido {answeredQuestions} de {totalQuestions} preguntas.
              {answeredQuestions < totalQuestions && (
                <span className="block mt-2 text-[#EF4444]">
                  Aún tienes {totalQuestions - answeredQuestions} pregunta(s) sin responder.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Enviar de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Abandonar el examen?</AlertDialogTitle>
            <AlertDialogDescription>
              Si abandonas ahora, perderás todo el progreso de esta evaluación. 
              Tendrás que comenzar nuevamente si deseas realizarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continuar examen</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowExitDialog(false);
              onNavigate?.("lesson");
            }}>
              Sí, abandonar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
