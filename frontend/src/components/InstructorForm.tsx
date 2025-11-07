import { useState, useRef } from "react";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import type { Instructor } from "../lib/data";

interface InstructorFormProps {
  instructor?: Instructor;
  onSave: (instructor: Instructor) => void;
  onCancel: () => void;
}

export function InstructorForm({ instructor, onSave, onCancel }: InstructorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Instructor>>(
    instructor || {
      name: "",
      title: "",
      biography: "",
      avatar: "",
      rating: 0,
      students: 0,
      courses: 0,
      credentials: [{ title: "", institution: "", year: "" }],
      experience: [""],
    }
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
      setFormData({ ...formData, avatar: base64String });
      toast.success("Foto cargada exitosamente");
    };
    reader.onerror = () => {
      toast.error("Error al cargar la foto");
    };
    reader.readAsDataURL(file);
  };

  const handleCredentialChange = (index: number, field: string, value: string) => {
    const credentials = [...(formData.credentials || [])];
    credentials[index] = { ...credentials[index], [field]: value };
    setFormData({ ...formData, credentials });
  };

  const addCredential = () => {
    setFormData({
      ...formData,
      credentials: [...(formData.credentials || []), { title: "", institution: "", year: "" }],
    });
  };

  const removeCredential = (index: number) => {
    const credentials = [...(formData.credentials || [])];
    credentials.splice(index, 1);
    setFormData({ ...formData, credentials });
  };

  const handleExperienceChange = (index: number, value: string) => {
    const experience = [...(formData.experience || [])];
    experience[index] = value;
    setFormData({ ...formData, experience });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...(formData.experience || []), ""],
    });
  };

  const removeExperience = (index: number) => {
    const experience = [...(formData.experience || [])];
    experience.splice(index, 1);
    setFormData({ ...formData, experience });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.title || !formData.biography) {
      toast.error("Por favor completa los campos obligatorios (nombre, título y biografía)");
      return;
    }

    const completeInstructor: Instructor = {
      id: instructor?.id || String(Date.now()),
      name: formData.name,
      title: formData.title,
      biography: formData.biography,
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      rating: formData.rating || 0,
      students: formData.students || 0,
      courses: formData.courses || 0,
      credentials: formData.credentials?.filter((c) => c.title.trim() !== "") || [],
      experience: formData.experience?.filter((e) => e.trim() !== "") || [],
    };

    onSave(completeInstructor);
    toast.success(instructor ? "Instructor actualizado exitosamente" : "Instructor creado exitosamente");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#0F172A]">
            {instructor ? "Editar Instructor" : "Crear Nuevo Instructor"}
          </h2>
          <p className="text-[#64748B]">
            Completa la información del instructor que podrás asignar a los cursos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {instructor ? "Guardar Cambios" : "Crear Instructor"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del instructor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  placeholder="Dr. Juan Pérez"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título Profesional *</Label>
                <Input
                  id="title"
                  placeholder="Médico Emergentólogo • Instructor AHA"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biography">Biografía *</Label>
              <Textarea
                id="biography"
                placeholder="Descripción profesional del instructor..."
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rating">Valoración (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.9"
                  value={formData.rating}
                  onChange={(e) => handleInputChange("rating", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="students">Total Estudiantes</Label>
                <Input
                  id="students"
                  type="number"
                  placeholder="25430"
                  value={formData.students}
                  onChange={(e) => handleInputChange("students", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courses">Total Cursos</Label>
                <Input
                  id="courses"
                  type="number"
                  placeholder="12"
                  value={formData.courses}
                  onChange={(e) => handleInputChange("courses", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Foto del Instructor</Label>
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
                {formData.avatar ? "Cambiar Foto" : "Seleccionar Foto"}
              </Button>
              <p className="text-xs text-[#64748B]">
                Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB. Si no cargas una foto, se generará un avatar automáticamente.
              </p>
              {formData.avatar && (
                <div className="space-y-2">
                  <p className="text-xs text-[#55a5c7]">
                    ✓ Foto cargada correctamente
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="h-32 w-32 rounded-full object-cover border-2 border-[#0B5FFF]/20 shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credenciales y Certificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciales y Certificaciones</CardTitle>
            <CardDescription>Títulos, certificaciones y formación académica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.credentials?.map((credential, index) => (
              <Card key={index} className="border-[#E2E8F0]">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge>Credencial {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCredential(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Título / Certificación</Label>
                        <Input
                          placeholder="Ej: Médico Especialista en Emergentología"
                          value={credential.title}
                          onChange={(e) => handleCredentialChange(index, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año</Label>
                        <Input
                          placeholder="2008"
                          value={credential.year}
                          onChange={(e) => handleCredentialChange(index, "year", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Institución</Label>
                      <Input
                        placeholder="Universidad de Buenos Aires"
                        value={credential.institution}
                        onChange={(e) => handleCredentialChange(index, "institution", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addCredential} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Credencial
            </Button>
          </CardContent>
        </Card>

        {/* Experiencia Profesional */}
        <Card>
          <CardHeader>
            <CardTitle>Experiencia Profesional</CardTitle>
            <CardDescription>Puntos destacados de la trayectoria profesional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.experience?.map((exp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: +15 años en servicio de emergencias hospitalarias"
                  value={exp}
                  onChange={(e) => handleExperienceChange(index, e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addExperience} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Experiencia
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
