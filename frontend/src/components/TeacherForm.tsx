import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import type { Teacher } from "../hooks/useTeachers";

interface TeacherFormProps {
  teacher?: Teacher;
  onSave: (teacher: Partial<Teacher>) => void;
  onCancel: () => void;
}

export function TeacherForm({ teacher, onSave, onCancel }: TeacherFormProps) {
  const [formData, setFormData] = useState<Partial<Teacher>>(
    teacher || {
      full_name: "",
      email: "",
      bio: "",
      avatar_url: "",
      specialization: "",
      years_of_experience: 0,
      rating: 0,
      total_students: 0,
      total_courses: 0,
      hourly_rate: undefined,
      is_active: true,
    }
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.full_name || !formData.email) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    // Call onSave and let the parent (AdminPanel) show success/error toasts
    onSave(formData);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#0F172A]">
            {teacher ? "Editar Maestro" : "Crear Nuevo Maestro"}
          </h2>
          <p className="text-[#64748B]">
            Completa la información del maestro
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {teacher ? "Guardar Cambios" : "Crear Maestro"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Dr. Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="juan@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Describe tu experiencia y especialidad..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialization">Especialización</Label>
              <Input
                id="specialization"
                value={formData.specialization || ""}
                onChange={(e) =>
                  handleInputChange("specialization", e.target.value)
                }
                placeholder="Ej: Matemática, Física, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url || ""}
                onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Experiencia y Desempeño</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Años de Experiencia</Label>
              <Input
                id="years_of_experience"
                type="number"
                value={formData.years_of_experience || 0}
                onChange={(e) =>
                  handleInputChange("years_of_experience", parseInt(e.target.value))
                }
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Tarifa Horaria (ARS)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate || ""}
                onChange={(e) =>
                  handleInputChange("hourly_rate", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="500"
                step="50"
                min="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rating">Valoración (0-5)</Label>
              <Input
                id="rating"
                type="number"
                value={formData.rating || 0}
                onChange={(e) =>
                  handleInputChange("rating", parseFloat(e.target.value))
                }
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_students">Total Estudiantes</Label>
              <Input
                id="total_students"
                type="number"
                value={formData.total_students || 0}
                onChange={(e) =>
                  handleInputChange("total_students", parseInt(e.target.value))
                }
                min="0"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_courses">Total Cursos</Label>
              <Input
                id="total_courses"
                type="number"
                value={formData.total_courses || 0}
                onChange={(e) =>
                  handleInputChange("total_courses", parseInt(e.target.value))
                }
                min="0"
                disabled
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active" className="text-sm">
              Maestro Activo
            </Label>
            {formData.is_active ? (
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
