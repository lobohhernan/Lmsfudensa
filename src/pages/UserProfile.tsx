import { Award, Mail, Globe, User, Settings as SettingsIcon, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CertificateCard } from "../components/CertificateCard";

interface UserProfileProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

const myCourses = [
  {
    id: "1",
    title: "RCP Adultos AHA 2020",
    progress: 75,
    lastAccessed: "Ayer",
    image: "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400",
  },
  {
    id: "2",
    title: "Primeros Auxilios Básicos",
    progress: 45,
    lastAccessed: "Hace 3 días",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?w=400",
  },
  {
    id: "3",
    title: "Emergencias Médicas",
    progress: 20,
    lastAccessed: "Hace 1 semana",
    image: "https://images.unsplash.com/photo-1644488483724-4daed4a30390?w=400",
  },
];

const myCertificates = [
  {
    courseName: "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar",
    issueDate: "15 de Octubre, 2025",
    hash: "a7f8e9c2b4d6f1a3c5e7b9d2f4a6c8e0b1d3f5a7c9e1",
  },
  {
    courseName: "Primeros Auxilios Básicos - Manejo de Emergencias",
    issueDate: "2 de Octubre, 2025",
    hash: "b8g9f0d3e5g2i4k6m8o0p2r4t6v8x0z2a4c6e8g0i2",
  },
];

export function UserProfile({ onNavigate }: UserProfileProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                    alt="Usuario"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="mb-1 text-[#0F172A]">Juan Pérez</h1>
                  <div className="flex flex-wrap gap-4 text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">juan.perez@email.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Argentina</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-2xl text-[#0F172A]">3</p>
                      <p className="text-sm text-[#64748B]">Cursos activos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl text-[#0F172A]">2</p>
                      <p className="text-sm text-[#64748B]">Certificados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl text-[#0F172A]">24h</p>
                      <p className="text-sm text-[#64748B]">Horas cursadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Mis Cursos
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="mr-2 h-4 w-4" />
              Mis Certificados
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* My Courses */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      Último acceso: {course.lastAccessed}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Progreso</span>
                        <span className="text-[#0F172A]">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => onNavigate?.("lesson")}
                    >
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add Course Card */}
              <Card className="border-dashed">
                <CardContent className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <BookOpen className="h-8 w-8 text-[#64748B]" />
                  </div>
                  <h3 className="mb-2 text-[#0F172A]">Explorar más cursos</h3>
                  <p className="mb-4 text-sm text-[#64748B]">
                    Descubre nuevos cursos para ampliar tu conocimiento
                  </p>
                  <Button onClick={() => onNavigate?.("catalog")}>
                    Ver Catálogo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Certificates */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {myCertificates.map((cert, index) => (
                <CertificateCard
                  key={index}
                  {...cert}
                  onVerify={() => onNavigate?.("verify")}
                />
              ))}
            </div>

            {myCertificates.length === 0 && (
              <Card>
                <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <Award className="h-8 w-8 text-[#64748B]" />
                  </div>
                  <h3 className="mb-2 text-[#0F172A]">No tienes certificados aún</h3>
                  <p className="mb-4 text-[#64748B]">
                    Completa un curso y obtén tu certificado verificable
                  </p>
                  <Button onClick={() => onNavigate?.("catalog")}>
                    Explorar Cursos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" defaultValue="Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" defaultValue="Pérez" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="juan.perez@email.com"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select defaultValue="AR">
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                        <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                        <SelectItem value="MX">🇲🇽 México</SelectItem>
                        <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                        <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select defaultValue="es">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña de acceso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <div className="pt-4">
                  <Button>Actualizar Contraseña</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
