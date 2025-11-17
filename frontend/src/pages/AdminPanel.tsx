import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Award,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Eye,
  ArrowLeft,
  Mail,
  RefreshCw,
  CheckCircle,
  Menu,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
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
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import { CourseForm } from "../components/CourseForm";
import { CourseCard } from "../components/CourseCard";
import { type FullCourse } from "../lib/data";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { debug, error as logError } from '../lib/logger'
import { supabaseAdmin, isAdminClientConfigured, logAdminOperation } from "../lib/supabaseAdmin";
import { useCoursesRealtime } from "../hooks/useCoursesRealtime";
import { useTeachersRealtime } from "../hooks/useTeachers";
import { useCertificatesRealtime } from "../hooks/useCertificates";
import { TeacherForm } from "../components/TeacherForm";
import type { Teacher } from "../hooks/useTeachers";
import logoHorizontal from "../assets/logo-horizontal.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../components/ui/sheet";

interface AdminPanelProps {
  onNavigate?: (page: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "teachers" | "users" | "payments" | "certificates">("dashboard");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FullCourse | undefined>();
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [teacherQuery, setTeacherQuery] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactUser, setContactUser] = useState<{ name: string; email: string } | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    certificatesIssued: 0,
    monthlyRevenue: 0,
  });

  // Use realtime hook for courses
  const { courses: realtimeCourses } = useCoursesRealtime();

  // Use realtime hook for teachers
  const { teachers: realtimeTeachers, loading: teachersLoading, refetch: refetchTeachers } = useTeachersRealtime();

  // Use realtime hook for certificates
  const { certificates: realtimeCertificates, loading: certificatesLoading, error: certificatesError } = useCertificatesRealtime();

  // Search/filter state for teachers
  const filteredTeachers = (() => {
    const q = teacherQuery.trim().toLowerCase();
    if (!q) return realtimeTeachers;
    return realtimeTeachers.filter((t) => {
      return (
        (t.full_name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        ((t.specialization || "").toLowerCase().includes(q))
      );
    });
  })();

  // Datos de ejemplo para secciones no implementadas
  const paymentsData: any[] = [];

  // Map realtime courses to component state
  const courseList = realtimeCourses.map(course => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    fullDescription: course.full_description,
    image: course.image,
    category: course.category,
    price: course.price,
    duration: course.duration,
    level: course.level,
    certified: course.certified,
    students: course.students ?? undefined,
    rating: course.rating || 0,
    reviews: course.reviews || 0,
    instructorId: course.instructor_id,
  }));

  // Cargar usuarios desde Supabase
  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      // Direct fetch with longer timeout for Supabase
      const { data, error } = await supabase.from("profiles").select("*");
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      setUsersList(data || []);
      debug("Usuarios cargados:", data?.length);
    } catch (err: any) {
      const msg = err?.message || String(err);
      setUsersError(msg);
      toast.error("Error al cargar usuarios: " + msg);
      console.error("Error completo:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    // Cargar usuarios desde Supabase
    loadUsers();
    // Realtime courses and teachers are loaded via hooks
  }, []);

  // Calcular estadísticas en tiempo real
  useEffect(() => {
    const totalStudents = usersList.length;
    const activeCourses = realtimeCourses.length;
    
    // Calcular ingresos del mes (suma de precios de cursos activos)
    const monthlyRevenue = realtimeCourses.reduce((sum, course) => {
      return sum + (course.price || 0);
    }, 0);

    setStats({
      totalStudents,
      activeCourses,
      certificatesIssued: realtimeCertificates.filter(c => c.status === 'active').length,
      monthlyRevenue,
    });
  }, [usersList, realtimeCourses, realtimeCertificates]);

  const handleSaveCourse = async (course: FullCourse) => {
    try {
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
      
      if (editingCourse) {
        // Actualizar curso en Supabase
        logAdminOperation('UPDATE', 'courses', { courseId: course.id });
        
        const { error } = await client
          .from("courses")
          .update({
            title: course.title,
            slug: course.slug,
            description: course.description,
            full_description: course.fullDescription,
            image: course.image,
            category: course.category,
            price: course.price,
            duration: course.duration,
            level: course.level,
            certified: course.certified,
          })
          .eq("id", course.id);
        
        if (error) {
          console.error("❌ Error UPDATE:", error);
          toast.error("Error al actualizar el curso: " + error.message);
          return;
        }
        toast.success("✅ Curso actualizado exitosamente");
      } else {
        // Obtener ID del instructor admin
        const { data: adminData, error: adminError } = await client
          .from("profiles")
          .select("id")
          .eq("full_name", "Dr. Test Instructor")
          .single();
        
        let instructorId: string;
        
        if (adminError || !adminData) {
          console.warn("⚠️ No se encontró instructor, usando primer profile disponible");
          // Fallback: usar primer profile disponible
          const { data: firstProfile } = await client.from("profiles").select("id").limit(1).single();
          if (!firstProfile) {
            toast.error("No hay perfiles en la base de datos");
            return;
          }
          instructorId = firstProfile.id;
        } else {
          instructorId = adminData.id;
        }

        // Crear nuevo curso en Supabase
        logAdminOperation('INSERT', 'courses', { title: course.title });
        
        const { error } = await client.from("courses").insert([{
          title: course.title,
          slug: course.slug,
          description: course.description,
          full_description: course.fullDescription,
          image: course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
          category: course.category,
          price: course.price,
          duration: course.duration,
          level: course.level,
          certified: course.certified,
          instructor_id: instructorId,
          students: null,
          rating: 0,
          reviews: 0,
        }]);
        
        if (error) {
          console.error("❌ Error INSERT:", error);
          toast.error("Error al crear el curso: " + error.message);
          return;
        }
        toast.success("✅ Curso creado exitosamente");
      }

      // Guardar lecciones del curso
      if (course.lessons && course.lessons.length > 0) {
        try {
          // Eliminar lecciones existentes del curso
          await client.from("lessons").delete().eq("course_id", course.id);

          // Insertar nuevas lecciones
          const lessonsToInsert = course.lessons.map((lesson, index) => ({
            course_id: course.id,
            order_index: index + 1, // ✅ Nombre correcto de la columna en DB
            title: lesson.title,
            duration: lesson.duration,
            type: lesson.type || "video",
            youtube_id: lesson.youtubeId || null, // ⚠️ Conversión camelCase -> snake_case
            description: lesson.description || null,
            content: lesson.content || null,
          }));

          const { error: lessonsError } = await client
            .from("lessons")
            .insert(lessonsToInsert);

          if (lessonsError) {
            console.error("❌ Error guardando lecciones:", lessonsError);
            toast.warning("Curso guardado, pero error al guardar lecciones");
          } else {
            debug(`✅ ${lessonsToInsert.length} lecciones guardadas`);
          }
        } catch (lessonsErr) {
          console.error("Error guardando lecciones:", lessonsErr);
        }
      }

      // Guardar evaluaciones del curso
      if (course.evaluation && course.evaluation.length > 0) {
        try {
          // Eliminar evaluaciones existentes del curso
          await client.from("evaluations").delete().eq("course_id", course.id);

          // Insertar nuevas evaluaciones
          const evaluationsToInsert = course.evaluation.map((q, index) => ({
            course_id: course.id,
            question_order: index + 1,
            question: q.question,
            options: q.options, // ✅ Enviar como array directo (TEXT[] en PostgreSQL)
            correct_answer: q.correctAnswer,
            explanation: q.explanation || null,
          }));

          const { error: evalError } = await client
            .from("evaluations")
            .insert(evaluationsToInsert);

          if (evalError) {
            console.error("❌ Error guardando evaluaciones:", evalError);
            toast.warning("Curso guardado, pero error al guardar evaluaciones");
          } else {
            debug(`✅ ${evaluationsToInsert.length} evaluaciones guardadas`);
          }
        } catch (evalErr) {
          console.error("Error guardando evaluaciones:", evalErr);
        }
      }

      // No need to manually reload - realtime subscription will update the list automatically
      setShowCourseForm(false);
      setEditingCourse(undefined);
    } catch (err) {
      toast.error("Error al guardar el curso");
      console.error(err);
    }
  };

  const handleEditCourse = async (course: FullCourse) => {
    try {
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
      
      // Cargar lecciones del curso desde la base de datos
      const { data: lessonsData, error: lessonsError } = await client
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true }); // ✅ Nombre correcto de columna

      if (lessonsError) {
        logError("❌ Error cargando lecciones:", lessonsError);
        toast.error("Error al cargar lecciones del curso");
      }

      // Cargar evaluaciones del curso
      const { data: evaluationsData, error: evaluationsError } = await client
        .from("evaluations")
        .select("*")
        .eq("course_id", course.id)
        .order("question_order", { ascending: true });

      if (evaluationsError) {
        logError("❌ Error cargando evaluaciones:", evaluationsError);
        toast.error("Error al cargar evaluaciones del curso");
      }

      // Mapear lecciones a formato esperado por CourseForm
      const mappedLessons = (lessonsData || []).map((lesson: any) => ({
        id: String(lesson.id),
        title: lesson.title,
        duration: lesson.duration || "",
        type: lesson.type || "video",
        completed: false,
        locked: false,
        youtubeId: lesson.youtube_id || "", // ⚠️ Conversión snake_case -> camelCase
        description: lesson.description || "",
        content: lesson.content || "",
      }));

      // Mapear evaluaciones a formato esperado por CourseForm
      // No usar nombre 'eval' porque es una declaración reservada en ESM.
      const mappedEvaluations = (evaluationsData || []).map((e: any) => {
        // ✅ options es TEXT[] en PostgreSQL, viene como array directamente
        let optionsArray: string[] = [];
        
        if (Array.isArray(e.options)) {
          // Ya es array, usar directamente
          optionsArray = e.options;
        } else if (typeof e.options === 'string') {
          // Si viene como string JSON (migración antigua), parsear
          try {
            const parsed = JSON.parse(e.options);
            optionsArray = Array.isArray(parsed) ? parsed : [];
          } catch (err) {
            logError('❌ Error parseando options:', e.options, err);
            optionsArray = [];
          }
        }

        return {
          id: e.question_order,
          question: e.question,
          options: optionsArray,
          correctAnswer: e.correct_answer,
          explanation: e.explanation || "",
        };
      });

      // Combinar curso con lecciones y evaluaciones
      const fullCourse = {
        ...course,
        lessons: mappedLessons,
        evaluation: mappedEvaluations,
      };

      setEditingCourse(fullCourse);
      setShowCourseForm(true);
    } catch (err) {
      console.error("Error preparando edición de curso:", err);
      toast.error("Error al preparar la edición del curso");
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleSaveTeacher = async (teacher: Partial<Teacher>) => {
    try {
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
      
      if (editingTeacher) {
        // Actualizar profesor en Supabase
        logAdminOperation('UPDATE', 'teachers', { teacherId: teacher.id });
        
        const { error } = await client
          .from("teachers")
          .update({
            full_name: teacher.full_name,
            email: teacher.email,
            bio: teacher.bio,
            avatar_url: teacher.avatar_url,
            specialization: teacher.specialization,
            years_of_experience: teacher.years_of_experience,
            rating: teacher.rating,
            total_students: teacher.total_students,
            total_courses: teacher.total_courses,
            hourly_rate: teacher.hourly_rate,
            is_active: teacher.is_active,
          })
          .eq("id", teacher.id);
        
        if (error) {
          console.error("❌ Error UPDATE teacher:", error);
          toast.error("Error al actualizar el profesor: " + error.message);
          return;
        }
        toast.success("✅ Profesor actualizado exitosamente");
        // Ensure latest data after update
        try { await refetchTeachers(); } catch (e) { /* ignore */ }
      } else {
        // Crear nuevo profesor en Supabase
        logAdminOperation('INSERT', 'teachers', { full_name: teacher.full_name });
        
        const { error } = await client.from("teachers").insert([{
          full_name: teacher.full_name,
          email: teacher.email,
          bio: teacher.bio,
          avatar_url: teacher.avatar_url,
          specialization: teacher.specialization,
          years_of_experience: teacher.years_of_experience,
          rating: teacher.rating,
          total_students: teacher.total_students,
          total_courses: teacher.total_courses,
          hourly_rate: teacher.hourly_rate,
          is_active: teacher.is_active,
        }]);
        
        if (error) {
          console.error("❌ Error INSERT teacher:", error);
          toast.error("Error al crear el profesor: " + error.message);
          return;
        }
        toast.success("✅ Profesor creado exitosamente");
        // Ensure latest data after insert
        try { await refetchTeachers(); } catch (e) { /* ignore */ }
      }

      // No need to manually reload - realtime subscription will update the list automatically
      setShowTeacherForm(false);
      setEditingTeacher(undefined);
    } catch (err) {
      toast.error("Error al guardar el profesor");
      console.error(err);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowTeacherForm(true);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeacherToDelete(teacherId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
      
      if (courseToDelete) {
        // ✅ Mostrar estado de eliminación (animación visual)
        setDeletingCourseId(courseToDelete);
        
        // Eliminar curso de Supabase
        logAdminOperation('DELETE', 'courses', { courseId: courseToDelete });
        
        const { error } = await client
          .from("courses")
          .delete()
          .eq("id", courseToDelete);
        
        if (error) {
          console.error("❌ Error DELETE:", error);
          toast.error("Error al eliminar el curso: " + error.message);
          setDeletingCourseId(null); // Reset animation state on error
          return;
        }
        
        toast.success("✅ Curso eliminado exitosamente");
        
        // ✅ Delay de 500ms para mostrar animación de desaparición antes de actualizar UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingCourseId(null);
        // No need to reload - realtime subscription will update the list automatically
      }
      if (teacherToDelete) {
        // ✅ Mostrar estado de eliminación (animación visual)
        setDeletingTeacherId(teacherToDelete);
        
        // Eliminar profesor de Supabase
        logAdminOperation('DELETE', 'teachers', { teacherId: teacherToDelete });
        
        const { error } = await client
          .from("teachers")
          .delete()
          .eq("id", teacherToDelete);
        
        if (error) {
          console.error("❌ Error DELETE teacher:", error);
          toast.error("Error al eliminar el profesor: " + error.message);
          setDeletingTeacherId(null); // Reset animation state on error
          return;
        }
        
        toast.success("✅ Profesor eliminado exitosamente");
        
        // ✅ Delay de 500ms para mostrar animación de desaparición antes de actualizar UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingTeacherId(null);
        // No need to reload - realtime subscription will update the list automatically
      }
    } catch (err) {
      toast.error("Error al eliminar");
      console.error(err);
      setDeletingCourseId(null);
      setDeletingTeacherId(null);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      setTeacherToDelete(null);
    }
  };

  const handleContactUser = (name: string, email: string) => {
    setContactUser({ name, email });
    setContactMessage("");
    setContactDialogOpen(true);
  };

  const sendContactMessage = () => {
    if (contactMessage.trim()) {
      toast.success(`Mensaje enviado a ${contactUser?.name}`);
      setContactDialogOpen(false);
      setContactUser(null);
      setContactMessage("");
    } else {
      toast.error("Por favor escribe un mensaje");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Cursos", icon: BookOpen },
    { id: "teachers", label: "Profesores", icon: GraduationCap },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "payments", label: "Pagos", icon: CreditCard },
    { id: "certificates", label: "Certificados", icon: Award },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <button
          onClick={() => onNavigate?.("home")}
          className="flex items-center transition-transform hover:scale-105 w-full"
        >
          <img 
            src={logoHorizontal} 
            alt="FUDENSA" 
            className="h-12 w-auto"
          />
        </button>
      </div>
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSidebarOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                activeTab === item.id
                  ? "bg-[#1e467c] text-white"
                  : "text-[#64748B] hover:bg-[#F1F5F9]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SheetDescription className="sr-only">
            Menú de navegación del panel de administración
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => onNavigate?.("home")}>
              Ver Sitio Web
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card 
                  className="group relative cursor-pointer overflow-hidden border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#0B5FFF]/40 hover:shadow-[0_8px_32px_0_rgba(11,95,255,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("users")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Total Estudiantes</CardTitle>
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#0B5FFF]/20 backdrop-blur-sm border border-[#0B5FFF]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                        <Users className="h-6 w-6 text-[#0B5FFF]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 bg-white/20 flex-1">
                    <div className="text-4xl">{stats.totalStudents.toLocaleString()}</div>
                    <p className="text-sm text-[#64748B]">+12% desde el mes pasado</p>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative cursor-pointer overflow-hidden border border-[#16A34A]/20 bg-gradient-to-br from-white to-[#16A34A]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#16A34A]/40 hover:shadow-[0_8px_32px_0_rgba(22,163,74,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("courses")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#16A34A]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Cursos Activos</CardTitle>
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/20 backdrop-blur-sm border border-[#16A34A]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                        <BookOpen className="h-6 w-6 text-[#16A34A]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 bg-white/20 flex-1">
                    <div className="text-4xl">{stats.activeCourses}</div>
                    <p className="text-sm text-[#64748B]">3 en borrador</p>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative cursor-pointer overflow-hidden border border-[#F59E0B]/20 bg-gradient-to-br from-white to-[#F59E0B]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#F59E0B]/40 hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("certificates")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Certificados Emitidos</CardTitle>
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/20 backdrop-blur-sm border border-[#F59E0B]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                        <Award className="h-6 w-6 text-[#F59E0B]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 bg-white/20 flex-1">
                    <div className="text-4xl">{stats.certificatesIssued.toLocaleString()}</div>
                    <p className="text-sm text-[#64748B]">+245 esta semana</p>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative cursor-pointer overflow-hidden border border-[#22C55E]/20 bg-gradient-to-br from-white to-[#22C55E]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#22C55E]/40 hover:shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("payments")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Ingresos del Mes</CardTitle>
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/20 backdrop-blur-sm border border-[#22C55E]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                        <CreditCard className="h-6 w-6 text-[#22C55E]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 bg-white/20 flex-1">
                    <div className="text-4xl">ARS ${(stats.monthlyRevenue).toLocaleString()}</div>
                    <p className="text-sm text-[#64748B]">+8% desde el mes pasado</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Courses */}
          {activeTab === "courses" && !showCourseForm && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input placeholder="Buscar cursos..." className="pl-10" />
                </div>
                <Button onClick={() => setShowCourseForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courseList.length > 0 ? (
                  courseList.map((course) => (
                    <div 
                      key={course.id} 
                      className={`relative group transition-all duration-500 ${
                        deletingCourseId === course.id 
                          ? "opacity-0 scale-95" 
                          : "opacity-100 scale-100"
                      }`}
                    >
                      <CourseCard
                        id={course.id}
                        title={course.title}
                        image={course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"}
                        duration={course.duration || "4 semanas"}
                        level={course.level as "Básico" | "Intermedio" | "Avanzado"}
                        certified={course.certified || false}
                        students={course.students}
                        onClick={() => handleEditCourse(course)}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-[#EF4444]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <p className="text-[#64748B]">No hay cursos disponibles. Crea uno para comenzar.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Course Form */}
          {activeTab === "courses" && showCourseForm && (
            <div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(undefined);
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>
              <CourseForm
                course={editingCourse}
                teachers={realtimeTeachers}
                onSave={handleSaveCourse}
                onCancel={() => {
                  setShowCourseForm(false);
                  setEditingCourse(undefined);
                }}
              />
            </div>
          )}

          

          

          {/* Teachers */}
          {activeTab === "teachers" && !showTeacherForm && (
            <div className="space-y-6">
              {!isAdminClientConfigured() && (
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-yellow-800">
                        ⚠️ El cliente admin no está configurado. Las operaciones de creación/edición pueden ser bloqueadas por RLS.
                        Agrega `VITE_SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local` o usa el cliente admin.
                      </div>
                      <div>
                        <Button variant="outline" onClick={() => window.open('https://app.supabase.com/', '_blank')}>Ir a Supabase</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar profesores..."
                    className="pl-10"
                    value={teacherQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeacherQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowTeacherForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Profesor
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Especialización</TableHead>
                      <TableHead>Valoración</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Cursos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachersLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : realtimeTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No hay profesores registrados aún
                        </TableCell>
                      </TableRow>
                    ) : filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No se encontraron profesores para "{teacherQuery}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <TableRow 
                          key={teacher.id}
                          className={`transition-all duration-500 ${
                            deletingTeacherId === teacher.id
                              ? "opacity-0 bg-red-50/50"
                              : "opacity-100 bg-transparent"
                          }`}
                        >
                          <TableCell className="text-[#0F172A] font-medium">{teacher.full_name}</TableCell>
                          <TableCell className="text-sm">{teacher.email}</TableCell>
                          <TableCell>{teacher.specialization || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{teacher.rating} ⭐</Badge>
                          </TableCell>
                          <TableCell>{teacher.total_students.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{teacher.total_courses} cursos</Badge>
                          </TableCell>
                          <TableCell>
                            {teacher.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  className="text-[#EF4444]"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Teacher Form */}
          {activeTab === "teachers" && showTeacherForm && (
            <div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTeacherForm(false);
                  setEditingTeacher(undefined);
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>
              <TeacherForm
                teacher={editingTeacher}
                onSave={handleSaveTeacher}
                onCancel={() => {
                  setShowTeacherForm(false);
                  setEditingTeacher(undefined);
                }}
              />
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="relative sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <Input placeholder="Buscar usuarios..." className="pl-10" />
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : usersError ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-red-600">
                          Error cargando usuarios: {usersError}
                        </TableCell>
                      </TableRow>
                    ) : usersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No hay usuarios registrados aún
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersList.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-[#0F172A] font-medium">{user.full_name || "Sin nombre"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>{user.country || "-"}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {user.role === 'admin' ? 'Administrador' : user.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setContactUser({ name: user.full_name || user.email, email: user.email });
                                  setContactDialogOpen(true);
                                }}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Contactar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="relative sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <Input placeholder="Buscar pagos..." className="pl-10" />
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Badge
                            variant={payment.status === "Pagado" ? "default" : "secondary"}
                            className={
                              payment.status === "Pagado"
                                ? "bg-[#55a5c7] text-white"
                                : payment.status === "Pendiente"
                                ? "bg-[#F59E0B] text-white"
                                : "bg-[#EF4444] text-white"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[#0F172A]">{payment.user}</span>
                            <span className="text-xs text-[#64748B]">{payment.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell className="font-semibold text-[#0F172A]">{payment.amount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                toast.info(`Viendo detalles del pago ${payment.id}`);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactUser(payment.user, payment.email)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contactar Usuario
                              </DropdownMenuItem>
                              {payment.status === "Pendiente" && (
                                <DropdownMenuItem onClick={() => {
                                  toast.success(`Pago ${payment.id} marcado como pagado`);
                                }}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Marcar como Pagado
                                </DropdownMenuItem>
                              )}
                              {payment.status === "Pagado" && (
                                <DropdownMenuItem 
                                  className="text-[#F59E0B]"
                                  onClick={() => {
                                    toast.warning(`Procesando reembolso de ${payment.amount} para ${payment.user}`);
                                  }}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Reembolsar
                                </DropdownMenuItem>
                              )}
                              {payment.status === "Rechazado" && (
                                <DropdownMenuItem onClick={() => {
                                  toast.info(`Reintentando pago ${payment.id}`);
                                }}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Reintentar Pago
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => {
                                toast.success(`Descargando comprobante del pago ${payment.id}`);
                              }}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Comprobante
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Certificates */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input placeholder="Buscar certificados..." className="pl-10" />
                </div>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha de Emisión</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificatesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#55a5c7]" />
                          <p className="text-sm text-[#64748B] mt-2">Cargando certificados...</p>
                        </TableCell>
                      </TableRow>
                    ) : certificatesError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-[#EF4444]">
                          Error: {certificatesError}
                        </TableCell>
                      </TableRow>
                    ) : realtimeCertificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-[#64748B]">
                          No hay certificados emitidos aún
                        </TableCell>
                      </TableRow>
                    ) : (
                      realtimeCertificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell>{new Date(cert.issue_date).toLocaleDateString("es-AR")}</TableCell>
                          <TableCell className="text-[#0F172A]">{cert.student_name}</TableCell>
                          <TableCell>{cert.course_title}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {cert.hash.substring(0, 16)}...
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={cn(
                                cert.status === 'active' && "bg-[#55a5c7] text-white",
                                cert.status === 'voided' && "bg-[#EF4444] text-white",
                                cert.status === 'expired' && "bg-[#64748B] text-white"
                              )}
                            >
                              {cert.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  disabled={!cert.pdf_url}
                                  onClick={() => {
                                    if (cert.pdf_url) window.open(cert.pdf_url, '_blank');
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[#EF4444]">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Revocar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {courseToDelete && "Esta acción no se puede deshacer. Esto eliminará permanentemente el curso y todas sus lecciones y evaluaciones asociadas."}
              {teacherToDelete && "Esta acción no se puede deshacer. Esto eliminará permanentemente el profesor y toda su información asociada."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#EF4444] hover:bg-[#DC2626]">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact User Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Contactar Usuario</DialogTitle>
            <DialogDescription>
              Env+�a un mensaje a {contactUser?.name} ({contactUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                placeholder="Asunto del mensaje"
                defaultValue="Informaci+�n sobre tu pago"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aqu+�..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={sendContactMessage}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar Mensaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
async function generateHash() {
  const data = `${Date.now()}-${Math.random()}-${crypto.randomUUID()}`;
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
