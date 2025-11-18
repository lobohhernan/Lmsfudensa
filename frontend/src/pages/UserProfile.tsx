import { Award, Mail, Globe, Settings as SettingsIcon, BookOpen, Loader2 } from "lucide-react";
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
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { debug } from '../lib/logger'

interface UserProfileProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    setLoading(true);
    
    try {
      // Obtener usuario actual autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      // Cargar perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        debug("Perfil no encontrado, creando uno básico:", profileError);
        
        // Intentar crear el perfil si no existe
        const newProfile = {
          id: user.id,
          email: user.email || "",
          full_name: user.email?.split('@')[0] || "Usuario",
          role: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile]);
        
        if (insertError) {
          console.error("Error al crear perfil:", insertError);
        }
        
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }

      // Cargar cursos del usuario desde ENROLLMENTS reales
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          enrolled_at,
          last_accessed_at,
          completed,
          courses (
            id,
            title,
            slug,
            image,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false });

      if (!enrollmentsError && enrollments) {
        // ✅ Calcular progreso real para cada curso (igual que en Home.tsx)
        const mappedCourses = await Promise.all(enrollments.map(async (enrollment: any) => {
          const courseId = enrollment.course_id;
          
          // Contar lecciones totales del curso
          const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);
          
          // Contar lecciones completadas por el usuario
          let completedLessons = 0;
          try {
            const { count } = await supabase
              .from('user_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .eq('completed', true);
            completedLessons = count || 0;
          } catch (progressErr) {
            console.warn('⚠️ Error cargando progreso, continuando sin él:', progressErr);
            completedLessons = 0;
          }
          
          const total = totalLessons || 0;
          const completed = completedLessons;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          // Obtener última lección accedida
          let currentLesson = 'Lección 1';
          try {
            const { data: lastProgress } = await supabase
              .from('user_progress')
              .select('lesson_id, lessons(title, order_index)')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .order('last_accessed_at', { ascending: false })
              .limit(1)
              .single();
            
            currentLesson = (lastProgress?.lessons as any)?.title || 'Lección 1';
          } catch (lastProgressErr) {
            console.warn('⚠️ Error obteniendo última lección:', lastProgressErr);
          }

          return {
            id: courseId,
            title: enrollment.courses?.title || 'Curso sin título',
            slug: enrollment.courses?.slug || '',
            progress,
            currentLesson,
            totalLessons: total,
            completedLessons: completed,
            image: enrollment.courses?.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400",
          };
        }));
        setUserCourses(mappedCourses);
      } else {
        console.error('❌ Error cargando enrollments:', enrollmentsError);
        setUserCourses([]); // No cursos si no hay enrollments
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B5FFF]" />
          <p className="text-[#64748B]">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[#0F172A] mb-4">No se pudo cargar tu perfil</p>
            <Button onClick={loadUserData}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = userProfile.full_name
    ? userProfile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : userProfile.email.split("@")[0].substring(0, 2).toUpperCase();
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
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`}
                    alt="Usuario"
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="mb-1 text-[#0F172A]">{userProfile.full_name || "Usuario"}</h1>
                  <div className="flex flex-wrap gap-4 text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                    {userProfile.country && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">{userProfile.country}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="text-center rounded-xl border border-[#0B5FFF]/20 bg-linear-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm px-6 py-3 shadow-[0_4px_16px_0_rgba(11,95,255,0.08)]">
                      <p className="text-2xl text-[#0F172A]">{userCourses.length}</p>
                      <p className="text-sm text-[#64748B]">Cursos disponibles</p>
                    </div>
                    <div className="text-center rounded-xl border border-[#22C55E]/20 bg-linear-to-br from-white to-[#22C55E]/5 backdrop-blur-sm px-6 py-3 shadow-[0_4px_16px_0_rgba(34,197,94,0.08)]">
                      <p className="text-2xl text-[#0F172A]">0</p>
                      <p className="text-sm text-[#64748B]">Certificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="courses" className="flex-none">
              <BookOpen className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Mis Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex-none">
              <Award className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Mis Certificados</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-none">
              <SettingsIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          {/* My Courses */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userCourses.map((course: any) => (
                <Card key={course.id} className="overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardHeader className="p-0 shrink-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardHeader className="shrink-0 pb-3">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0 pb-6">
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-[#64748B] line-clamp-1">
                        Lección actual: {course.currentLesson}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Progreso</span>
                        <span className="text-[#0F172A] font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-[#64748B]">
                        <span>{course.completedLessons} de {course.totalLessons} lecciones</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-auto"
                      onClick={() => onNavigate?.("lesson", course.id)}
                    >
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add Course Card */}
              <Card className="border-dashed transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
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
                    <Input 
                      id="firstName" 
                      defaultValue={userProfile?.full_name?.split(" ")[0] || ""}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={userProfile?.full_name?.split(" ").slice(1).join(" ") || ""}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userProfile?.email || ""}
                    disabled
                    className="bg-gray-100"
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
