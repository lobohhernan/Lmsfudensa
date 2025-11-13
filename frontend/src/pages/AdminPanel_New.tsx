import { useState } from "react";
import {
  Plus,
  ArrowLeft,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface AdminPanelProps {
  onNavigate?: (page: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Básico");
  const [certified, setCertified] = useState(true);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === "") {
      setSlug(value.toLowerCase().replace(/\s+/g, "-"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !category) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setSubmitting(true);

    try {
      // Get the admin instructor ID (Dr. Test Instructor)
      const { data: adminData, error: adminError } = await supabase
        .from("profiles")
        .select("id")
        .eq("full_name", "Dr. Test Instructor")
        .single();

      if (adminError || !adminData) {
        toast.error("No se pudo encontrar el instructor admin");
        setSubmitting(false);
        return;
      }

      // Insert course into Supabase
      const { error } = await supabase.from("courses").insert([
        {
          title,
          slug,
          description,
          full_description: fullDescription,
          image:
            image ||
            "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
          category,
          price: price ? parseFloat(price) : null,
          duration,
          level,
          certified,
          instructor_id: adminData.id,
          students: 0,
          rating: 0,
          reviews: 0,
        },
      ]);

      if (error) {
        toast.error(`Error al crear el curso: ${error.message}`);
        setSubmitting(false);
        return;
      }

      toast.success("Curso creado exitosamente! 🎉");

      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setFullDescription("");
      setImage("");
      setCategory("");
      setPrice("");
      setDuration("");
      setLevel("Básico");
      setCertified(true);
      setShowForm(false);
    } catch (err) {
      toast.error("Error al crear el curso");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => setShowForm(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Curso</CardTitle>
              <CardDescription>
                Completa el formulario para crear un nuevo curso en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título del Curso *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ej: RCP Adultos AHA 2020"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL Amigable (Slug) *
                  </Label>
                  <Input
                    id="slug"
                    placeholder="rcp-adultos-aha-2020"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Generado automáticamente desde el título
                  </p>
                </div>

                {/* Descripción Corta */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción Corta
                  </Label>
                  <Input
                    id="description"
                    placeholder="Breve descripción del curso"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Descripción Completa */}
                <div className="space-y-2">
                  <Label htmlFor="fullDescription">
                    Descripción Completa
                  </Label>
                  <Textarea
                    id="fullDescription"
                    placeholder="Descripción detallada del curso..."
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Imagen */}
                <div className="space-y-2">
                  <Label htmlFor="image">
                    URL de la Imagen
                  </Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Deja en blanco para usar imagen por defecto
                  </p>
                </div>

                {/* Grid de campos */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoría *
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RCP">RCP</SelectItem>
                        <SelectItem value="Primeros Auxilios">
                          Primeros Auxilios
                        </SelectItem>
                        <SelectItem value="Emergencias">
                          Emergencias Médicas
                        </SelectItem>
                        <SelectItem value="Soporte Vital">
                          Soporte Vital
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nivel */}
                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel</Label>
                    <Select value={level} onValueChange={setLevel}>
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

                  {/* Duración */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                      id="duration"
                      placeholder="8 horas"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (ARS)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="29900"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Certificado */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="certified"
                    checked={certified}
                    onChange={(e) => setCertified(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="certified" className="cursor-pointer">
                    Este curso es certificado
                  </Label>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                    className="bg-gray-200 hover:bg-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Curso"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Panel de Administración</h1>
          <p className="mt-2 text-[#64748B]">
            Gestiona los cursos, instructores y estudiantes de FUDENSA
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="group relative cursor-pointer overflow-hidden border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#0B5FFF]/40 hover:shadow-[0_8px_32px_0_rgba(11,95,255,0.15)] hover:scale-105"
            onClick={() => setShowForm(true)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Crear Curso</CardTitle>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#0B5FFF]/20 backdrop-blur-sm border border-[#0B5FFF]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <Plus className="h-6 w-6 text-[#0B5FFF]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748B]">Nuevo curso para la plataforma</p>
            </CardContent>
          </Card>

          <Card 
            className="group relative cursor-pointer overflow-hidden border border-[#16A34A]/20 bg-gradient-to-br from-white to-[#16A34A]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#16A34A]/40 hover:shadow-[0_8px_32px_0_rgba(22,163,74,0.15)] hover:scale-105"
            onClick={() => onNavigate?.("courses")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Ver Cursos</CardTitle>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/20 backdrop-blur-sm border border-[#16A34A]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <BookOpen className="h-6 w-6 text-[#16A34A]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748B]">Catálogo de cursos</p>
            </CardContent>
          </Card>

          <Card 
            className="group relative cursor-pointer overflow-hidden border border-[#F59E0B]/20 bg-gradient-to-br from-white to-[#F59E0B]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#F59E0B]/40 hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] hover:scale-105"
            onClick={() => onNavigate?.("home")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Ir al Sitio</CardTitle>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/20 backdrop-blur-sm border border-[#F59E0B]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <BookOpen className="h-6 w-6 text-[#F59E0B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748B]">Sitio web principal</p>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5">
          <CardHeader>
            <CardTitle>¿Cómo usar el panel?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B5FFF]/20 text-[#0B5FFF] font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Crear un Curso</p>
                <p className="text-sm text-[#64748B]">
                  Haz clic en "Crear Curso" para agregar un nuevo curso a la plataforma.
                  El curso aparecerá inmediatamente en el catálogo.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B5FFF]/20 text-[#0B5FFF] font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Agregar Contenido</p>
                <p className="text-sm text-[#64748B]">
                  Después de crear el curso, puedes agregar lecciones, videos y evaluaciones
                  desde la página de detalles del curso.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B5FFF]/20 text-[#0B5FFF] font-semibold">
                3
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Publicar</p>
                <p className="text-sm text-[#64748B]">
                  Los cursos son públicos una vez creados. Los estudiantes pueden encontrarlos
                  en el catálogo de cursos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
