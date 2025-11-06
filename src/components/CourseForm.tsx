import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Save, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import type { FullCourse, CourseLesson, EvaluationQuestion } from "../lib/data";

interface CourseFormProps {
  course?: FullCourse;
  instructors: any[]; // Lista de instructores disponibles
  onSave: (course: FullCourse) => void;
  onCancel: () => void;
}

export function CourseForm({ course, instructors, onSave, onCancel }: CourseFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<FullCourse>>(
    course || {
      title: "",
      slug: "",
      image: "",
      duration: "",
      level: "Básico",
      certified: true,
      students: 0,
      category: "",
      rating: 0,
      reviews: 0,
      price: 0,
      instructor: "",
      description: "",
      fullDescription: "",
      requirements: [""],
      learningOutcomes: [""],
      lessons: [],
      evaluation: [],
    }
  );

  const [lessons, setLessons] = useState<CourseLesson[]>(
    course?.lessons || [
      { id: "1", title: "", duration: "", type: "video", completed: false, locked: false },
    ]
  );

  const [questions, setQuestions] = useState<EvaluationQuestion[]>(
    course?.evaluation || [
      {
        id: 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. Máximo 5MB");
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
      toast.success("Imagen cargada exitosamente");
    };
    reader.onerror = () => {
      toast.error("Error al cargar la imagen");
    };
    reader.readAsDataURL(file);
  };

  const handleArrayChange = (field: "requirements" | "learningOutcomes", index: number, value: string) => {
    const array = [...(formData[field] || [])];
    array[index] = value;
    setFormData({ ...formData, [field]: array });
  };

  const addArrayItem = (field: "requirements" | "learningOutcomes") => {
    const array = [...(formData[field] || []), ""];
    setFormData({ ...formData, [field]: array });
  };

  const removeArrayItem = (field: "requirements" | "learningOutcomes", index: number) => {
    const array = [...(formData[field] || [])];
    array.splice(index, 1);
    setFormData({ ...formData, [field]: array });
  };

  // Lesson handlers
  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        id: String(lessons.length + 1),
        title: "",
        duration: "",
        type: "video",
        completed: false,
        locked: false,
      },
    ]);
  };

  const updateLesson = (index: number, field: keyof CourseLesson, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    const updated = [...lessons];
    updated.splice(index, 1);
    setLessons(updated);
  };

  // Question handlers
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof EvaluationQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.slug || !formData.category) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    // Generate slug from title if not provided
    const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-");

    const completeCourse: FullCourse = {
      id: course?.id || String(Date.now()),
      title: formData.title,
      slug,
      image: formData.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
      duration: formData.duration || "0 horas",
      level: formData.level || "Básico",
      certified: formData.certified ?? true,
      students: formData.students || 0,
      category: formData.category,
      rating: formData.rating || 0,
      reviews: formData.reviews || 0,
      price: formData.price || 0,
      instructorId: formData.instructorId || "",
      description: formData.description || "",
      fullDescription: formData.fullDescription,
      requirements: formData.requirements?.filter((r) => r.trim() !== ""),
      learningOutcomes: formData.learningOutcomes?.filter((l) => l.trim() !== ""),
      lessons: lessons.filter((l) => l.title.trim() !== ""),
      evaluation: questions.filter((q) => q.question.trim() !== ""),
    };

    onSave(completeCourse);
    toast.success(course ? "Curso actualizado exitosamente" : "Curso creado exitosamente");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#0F172A]">
            {course ? "Editar Curso" : "Crear Nuevo Curso"}
          </h2>
          <p className="text-[#64748B]">
            Completa la información del curso, lecciones y evaluación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {course ? "Guardar Cambios" : "Crear Curso"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="lessons">Lecciones</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluación</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica del Curso</CardTitle>
              <CardDescription>
                Información general que aparecerá en el catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Curso *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: RCP Adultos AHA 2020"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL amigable)</Label>
                  <Input
                    id="slug"
                    placeholder="rcp-adultos-aha-2020"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Corta *</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción breve que aparecerá en las tarjetas del curso"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Input
                    id="category"
                    placeholder="RCP, Primeros Auxilios..."
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange("level", value)}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    placeholder="8 horas"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (ARS)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="29900"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) => handleInputChange("instructorId", value)}
                  >
                    <SelectTrigger id="instructorId">
                      <SelectValue placeholder="Selecciona un instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {instructors.length === 0 && (
                    <p className="text-xs text-[#F59E0B]">
                      ⚠️ No hay instructores disponibles. Crea uno primero en la sección de Instructores.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen del Curso</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {formData.image ? "Cambiar Imagen" : "Seleccionar Imagen"}
                </Button>
                <p className="text-xs text-[#64748B]">
                  Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
                {formData.image && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#55a5c7]">
                      ✓ Imagen cargada correctamente
                    </p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descripción Completa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Descripción Detallada</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Descripción completa del curso que aparecerá en la página de detalles"
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange("fullDescription", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
              <CardDescription>Qué necesita el estudiante antes de tomar el curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.requirements?.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ej: No se requiere experiencia previa"
                    value={req}
                    onChange={(e) => handleArrayChange("requirements", index, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem("requirements", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem("requirements")}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Requisito
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivos de Aprendizaje</CardTitle>
              <CardDescription>Qué aprenderá el estudiante al completar el curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.learningOutcomes?.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ej: Dominar las técnicas de RCP"
                    value={outcome}
                    onChange={(e) => handleArrayChange("learningOutcomes", index, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem("learningOutcomes", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem("learningOutcomes")}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Objetivo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lecciones del Curso</CardTitle>
              <CardDescription>
                Configura las lecciones que componen el curso ({lessons.length} lecciones)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.map((lesson, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-[#64748B]" />
                          <Badge>Lección {index + 1}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLesson(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2 space-y-2">
                          <Label>Título de la Lección</Label>
                          <Input
                            placeholder="Ej: Introducción a RCP"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duración</Label>
                          <Input
                            placeholder="15 min"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(index, "duration", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={lesson.type}
                            onValueChange={(value) => updateLesson(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="document">Documento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Descripción (opcional)</Label>
                          <Input
                            placeholder="Descripción breve"
                            value={lesson.description || ""}
                            onChange={(e) => updateLesson(index, "description", e.target.value)}
                          />
                        </div>
                      </div>
                      {lesson.type === "video" && (
                        <div className="space-y-2">
                          <Label>ID de YouTube</Label>
                          <Input
                            placeholder="Ej: dQw4w9WgXcQ (desde youtube.com/watch?v=ID)"
                            value={lesson.youtubeId || ""}
                            onChange={(e) => updateLesson(index, "youtubeId", e.target.value)}
                          />
                          <p className="text-xs text-[#64748B]">
                            Ingresa solo el ID del video de YouTube. Por ejemplo, si la URL es 
                            <code className="mx-1 rounded bg-[#F1F5F9] px-1">youtube.com/watch?v=dQw4w9WgXcQ</code>
                            el ID es <code className="mx-1 rounded bg-[#F1F5F9] px-1">dQw4w9WgXcQ</code>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addLesson} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Lección
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluación del Curso</CardTitle>
              <CardDescription>
                Crea las preguntas de opción múltiple para la evaluación final ({questions.length}{" "}
                preguntas)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="border-[#E2E8F0]">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#1e467c]">Pregunta {qIndex + 1}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Pregunta</Label>
                        <Textarea
                          placeholder="Escribe la pregunta..."
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <Label>Opciones de Respuesta</Label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <Badge
                              variant={
                                question.correctAnswer === oIndex ? "default" : "outline"
                              }
                              className={
                                question.correctAnswer === oIndex
                                  ? "bg-[#55a5c7] hover:bg-[#55a5c7]"
                                  : ""
                              }
                            >
                              {String.fromCharCode(65 + oIndex)}
                            </Badge>
                            <Input
                              placeholder={`Opción ${String.fromCharCode(65 + oIndex)}`}
                              value={option}
                              onChange={(e) =>
                                updateQuestionOption(qIndex, oIndex, e.target.value)
                              }
                            />
                            <Button
                              variant={
                                question.correctAnswer === oIndex ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                              className={
                                question.correctAnswer === oIndex ? "bg-[#55a5c7]" : ""
                              }
                            >
                              {question.correctAnswer === oIndex ? "Correcta" : "Marcar"}
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label>Explicación (opcional)</Label>
                        <Textarea
                          placeholder="Explica por qué esta es la respuesta correcta..."
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Pregunta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
