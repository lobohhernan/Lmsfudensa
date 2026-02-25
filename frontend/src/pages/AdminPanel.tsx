import { useState, useEffect, useMemo } from "react";
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
import { CourseLesson } from "../lib/data";
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
import { saveCourseViaAdmin, saveTeacherViaAdmin, saveUserViaAdmin, deleteResourceViaAdmin } from '../lib/adminOperations'
import { useCoursesRealtime } from "../hooks/useCoursesRealtime";
import { useTeachersRealtime } from "../hooks/useTeachers";
import { useCertificatesRealtime } from "../hooks/useCertificates";
import { TeacherForm } from "../components/TeacherForm";
import { UserForm } from "../components/UserForm";
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

// Tipo que refleja una fila real de la tabla profiles en Supabase
interface UserRecord {
  id: string
  full_name: string | null
  email: string
  role: string
  country?: string | null
  phone?: string | null
  created_at: string
  [key: string]: unknown
}

// Tipo para filas de pagos (sección de pagos sin implementar)
interface PaymentRecord {
  id: string
  status: string
  date: string
  user: string
  email: string
  course: string
  amount: string
  [key: string]: unknown
}

// Tipo que refleja una fila real de la tabla evaluations en Supabase (snake_case)
interface DbEvaluationRow {
  question_order: number
  question: string
  options: string[] | string
  correct_answer: number
  explanation?: string
  [key: string]: unknown
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "teachers" | "users" | "payments" | "certificates">("dashboard");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FullCourse | undefined>();
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [teacherQuery, setTeacherQuery] = useState<string>("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactUser, setContactUser] = useState<{ name: string; email: string } | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState<UserRecord[]>([])
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [certToDelete, setCertToDelete] = useState<{ id: string; studentName: string; courseTitle: string } | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
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

  // Search/filter state for teachers (memoized)
  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase();
    if (!q) return realtimeTeachers;
    return realtimeTeachers.filter((t) => {
      return (
        (t.full_name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        ((t.specialization || "").toLowerCase().includes(q))
      );
    });
  }, [realtimeTeachers, teacherQuery]);

  // Mapa dinámico: teacher.id → cursos que dicta
  // Soporta tanto instructor_id=teacher.id (cursos nuevos) como instructor_id=profile.id (cursos legacy)
  const teacherCoursesMap = useMemo(() => {
    const map: Record<string, { id: string; title: string }[]> = {};

    // Crear lookup inverso: instructor_id → teacher.id
    // Para cursos legacy donde instructor_id es un profiles.id, mapeamos via teacher.user_id
    const profileToTeacherId: Record<string, string> = {};
    for (const teacher of realtimeTeachers) {
      if (teacher.user_id) {
        profileToTeacherId[teacher.user_id] = teacher.id;
      }
    }

    for (const course of realtimeCourses) {
      if (!course.instructor_id) continue;
      const courseInfo = { id: course.id, title: course.title };

      // Caso 1: instructor_id ya es un teacher.id (cursos nuevos)
      const directMatch = realtimeTeachers.some(t => t.id === course.instructor_id);
      if (directMatch) {
        if (!map[course.instructor_id]) map[course.instructor_id] = [];
        map[course.instructor_id].push(courseInfo);
      }
      // Caso 2: instructor_id es un profiles.id (cursos legacy) → mapear via user_id
      else if (profileToTeacherId[course.instructor_id]) {
        const teacherId = profileToTeacherId[course.instructor_id];
        if (!map[teacherId]) map[teacherId] = [];
        map[teacherId].push(courseInfo);
      }
    }
    return map;
  }, [realtimeCourses, realtimeTeachers]);

  // Datos de ejemplo para secciones no implementadas
  const paymentsData: PaymentRecord[] = [];

  // Lookup: profiles.id → teacher.id (para cursos legacy)
  const profileToTeacherIdMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const teacher of realtimeTeachers) {
      if (teacher.user_id) map[teacher.user_id] = teacher.id;
    }
    return map;
  }, [realtimeTeachers]);

  // Resuelve instructor_id (puede ser profiles.id legacy o teacher.id) → siempre teacher.id
  const resolveToTeacherId = (instructorId: string | null | undefined): string => {
    if (!instructorId) return "";
    // Si ya es un teacher.id directo
    if (realtimeTeachers.some(t => t.id === instructorId)) return instructorId;
    // Si es un profiles.id legacy, mapear a teacher.id
    return profileToTeacherIdMap[instructorId] || instructorId;
  };

  // Map realtime courses to component state (memoized)
  const courseList = useMemo(() => realtimeCourses.map(course => ({
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
    instructorId: resolveToTeacherId(course.instructor_id),
  })), [realtimeCourses, profileToTeacherIdMap, realtimeTeachers]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
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
      // Resolver teacher.id → ID compatible con instructor_id (FK a profiles)
      // IMPORTANTE: instructor_id DEBE ser un ID de profiles, no de teachers
      const resolveInstructorIdForDB = (teacherId: string | undefined | null): string | null => {
        if (!teacherId) return null;
        
        const teacher = realtimeTeachers.find(t => t.id === teacherId);
        
        // El instructor DEBE tener user_id (que es el FK a profiles)
        if (!teacher) {
          console.warn(`⚠️ No se encontró teacher con id: ${teacherId}`);
          return null;
        }
        
        if (!teacher.user_id) {
          console.warn(`⚠️ El teacher ${teacher.full_name} no tiene user_id asociado`);
          // Recargar lista de teachers por si hay cambios recientes
          refetchTeachers();
          toast.error(`El profesor ${teacher.full_name} no está configurado correctamente. Recarga la página e intenta nuevamente.`);
          return null;
        }
        
        return teacher.user_id; // ✅ Usar siempre user_id (FK a profiles)
      };

      const dbInstructorId = resolveInstructorIdForDB(course.instructorId);
      
      // Validar que tenemos un instructor válido antes de continuar
      if (!dbInstructorId && course.instructorId) {
        console.error('❌ No se pudo resolver el instructor_id para la BD');
        return; // El toast ya se mostró en resolveInstructorIdForDB
      }

      // Usar Edge Function para operaciones administrativas
      const result = await saveCourseViaAdmin({
        course: {
          ...course,
          instructorId: dbInstructorId || course.instructorId
        },
        lessons: course.lessons || [],
        evaluations: course.evaluation || [],
        editingCourse: !!editingCourse
      });

      if (result.success) {
        toast.success(editingCourse ? '✅ Curso actualizado exitosamente' : '✅ Curso creado exitosamente');
        
        // ✅ Delay de 2.5 segundos para que la suscripción realtime actualice la UI
        debug('⏳ Esperando 2.5 segundos para que se sincronice el realtime...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        debug('✅ Curso guardado completamente, cerrando formulario');
        setShowCourseForm(false);
        setEditingCourse(undefined);
      } else {
        throw new Error('Failed to save course via admin operation');
      }
    } catch (err) {
      toast.error("Error al guardar el curso");
      console.error(err);
    }
  };

  const handleEditCourse = async (course: FullCourse) => {
    try {
      // Cargar lecciones del curso desde la base de datos
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true }); // ✅ Nombre correcto de columna

      if (lessonsError) {
        logError("❌ Error cargando lecciones:", lessonsError);
        toast.error("Error al cargar lecciones del curso");
      }

      // Cargar evaluaciones del curso
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("course_id", course.id)
        .order("question_order", { ascending: true });

      if (evaluationsError) {
        logError("❌ Error cargando evaluaciones:", evaluationsError);
        toast.error("Error al cargar evaluaciones del curso");
      }

      // Mapear lecciones a formato esperado por CourseForm
      const mappedLessons = (lessonsData || []).map((lesson: CourseLesson) => ({
        id: String(lesson.id),
        title: lesson.title,
        duration: lesson.duration || "",
        type: lesson.type || "video",
        completed: false,
        locked: false,
        youtubeId: lesson.youtube_id || "", // ✅ Leer campo snake_case de Supabase
        description: lesson.description || "",
        content: lesson.content || "",
      }));

      // Mapear evaluaciones a formato esperado por CourseForm
      // No usar nombre 'eval' porque es una declaración reservada en ESM.
      const mappedEvaluations = (evaluationsData || []).map((e: DbEvaluationRow) => {
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
      // Usar Edge Function para operaciones administrativas
      const result = await saveTeacherViaAdmin({
        teacher,
        editingTeacher: !!editingTeacher
      });

      if (result.success) {
        toast.success(editingTeacher ? "✅ Profesor actualizado exitosamente" : "✅ Profesor creado exitosamente");
        
        // Delay para que la suscripción realtime actualice la UI
        debug("⏳ Esperando 2 segundos para que se sincronice el realtime...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setShowTeacherForm(false);
        setEditingTeacher(undefined);
        // Ensure latest data after operation
        try { await refetchTeachers(); } catch (e) { /* ignore */ }
      } else {
        throw new Error('Failed to save teacher via admin operation');
      }
    } catch (error: any) {
      console.error("❌ Error guardando profesor:", error);
      toast.error("Error al guardar el profesor: " + error.message);
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
      if (courseToDelete) {
        // ✅ Mostrar estado de eliminación (animación visual)
        setDeletingCourseId(courseToDelete);
        
        // Eliminar curso via Edge Function
        const result = await deleteResourceViaAdmin({
          type: 'course',
          id: courseToDelete
        });

        if (!result.success) {
          toast.error("Error al eliminar el curso");
          setDeletingCourseId(null);
          return;
        }
        
        toast.success("✅ Curso eliminado exitosamente");
        
        // ✅ Delay de 500ms para mostrar animación de desaparición antes de actualizar UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingCourseId(null);
      }
      if (certToDelete) {
        setDeletingCertId(certToDelete.id);

        const result = await deleteResourceViaAdmin({
          type: 'certificate',
          id: certToDelete.id
        });

        if (!result.success) {
          toast.error("Error al revocar certificado");
          setDeletingCertId(null);
          return;
        }

        toast.success(`✅ Certificado de "${certToDelete.studentName}" revocado exitosamente`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingCertId(null);
        setCertToDelete(null);
      }
      if (userToDelete) {
        setDeletingUserId(userToDelete.id);

        const result = await deleteResourceViaAdmin({
          type: 'user',
          id: userToDelete.id,
          userId: userToDelete.id
        });

        if (!result.success) {
          toast.error("Error al eliminar usuario");
          setDeletingUserId(null);
          return;
        }

        toast.success(`✅ Usuario "${userToDelete.name}" eliminado exitosamente`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingUserId(null);
        setUserToDelete(null);
        // Recargar lista de usuarios
        loadUsers();
      }
      if (teacherToDelete) {
        // ✅ Mostrar estado de eliminación (animación visual)
        setDeletingTeacherId(teacherToDelete);
        
        const result = await deleteResourceViaAdmin({
          type: 'teacher',
          id: teacherToDelete
        });

        if (!result.success) {
          toast.error("Error al eliminar el profesor");
          setDeletingTeacherId(null);
          return;
        }
        
        toast.success("✅ Profesor eliminado exitosamente");
        
        // ✅ Delay de 500ms para mostrar animación de desaparición antes de actualizar UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingTeacherId(null);
      }
    } catch (err) {
      toast.error("Error al eliminar");
      console.error(err);
      setDeletingCourseId(null);
      setDeletingTeacherId(null);
      setDeletingUserId(null);
      setDeletingCertId(null);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      setTeacherToDelete(null);
      setUserToDelete(null);
      setCertToDelete(null);
    }
  };

  const handleContactUser = (name: string, email: string) => {
    setContactUser({ name, email });
    setContactMessage("");
    setContactDialogOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleRevokeCertificate = (certId: string, studentName: string, courseTitle: string) => {
    setCertToDelete({ id: certId, studentName, courseTitle });
    setDeleteDialogOpen(true);
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

  const handleSaveUser = async (userData: any) => {
    try {
      // Validar contraseña para nuevos usuarios
      if (!editingUser && !userData.password) {
        toast.error("La contraseña es requerida para nuevos usuarios");
        return;
      }

      // Usar Edge Function para operaciones administrativas
      const result = await saveUserViaAdmin({
        userData,
        editingUser: editingUser || undefined
      });

      if (result.success) {
        toast.success(editingUser ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente");
        
        setShowUserForm(false);
        setEditingUser(undefined);
        loadUsers();
        if (userData.role === 'instructor') {
          refetchTeachers();
        }
      } else {
        throw new Error('Failed to save user via admin operation');
      }
    } catch (error: any) {
      console.error("Error guardando usuario:", error);
      toast.error("Error al guardar el usuario: " + error.message);
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
                  className="group relative cursor-pointer overflow-hidden border border-[#0B5FFF]/20 bg-linear-to-br from-white to-[#0B5FFF]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#0B5FFF]/40 hover:shadow-[0_8px_32px_0_rgba(11,95,255,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("users")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#0B5FFF]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Total Estudiantes</CardTitle>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B5FFF]/20 backdrop-blur-sm border border-[#0B5FFF]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
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
                  className="group relative cursor-pointer overflow-hidden border border-[#16A34A]/20 bg-linear-to-br from-white to-[#16A34A]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#16A34A]/40 hover:shadow-[0_8px_32px_0_rgba(22,163,74,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("courses")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#16A34A]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Cursos Activos</CardTitle>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/20 backdrop-blur-sm border border-[#16A34A]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
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
                  className="group relative cursor-pointer overflow-hidden border border-[#F59E0B]/20 bg-linear-to-br from-white to-[#F59E0B]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#F59E0B]/40 hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("certificates")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#F59E0B]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Certificados Emitidos</CardTitle>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/20 backdrop-blur-sm border border-[#F59E0B]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
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
                  className="group relative cursor-pointer overflow-hidden border border-[#22C55E]/20 bg-linear-to-br from-white to-[#22C55E]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#22C55E]/40 hover:shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] hover:scale-105 flex flex-col h-full"
                  onClick={() => setActiveTab("payments")}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#22C55E]/30 to-transparent" />
                  <CardHeader className="pb-4 relative bg-white/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Ingresos del Mes</CardTitle>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/20 backdrop-blur-sm border border-[#22C55E]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
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
                        onClick={() => handleEditCourse({ ...course, level: course.level as 'Básico' | 'Intermedio' | 'Avanzado', students: course.students ?? 0 })}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCourse({ ...course, level: course.level as 'Básico' | 'Intermedio' | 'Avanzado', students: course.students ?? 0 })}>
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
                      <TableHead>#</TableHead>
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
                        <TableCell colSpan={9} className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : realtimeTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                          No hay profesores registrados aún
                        </TableCell>
                      </TableRow>
                    ) : filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                          No se encontraron profesores para "{teacherQuery}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher, index) => (
                        <TableRow 
                          key={teacher.id}
                          className={`transition-all duration-500 ${
                            deletingTeacherId === teacher.id
                              ? "opacity-0 bg-red-50/50"
                              : "opacity-100 bg-transparent"
                          }`}
                        >
                          <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
                          <TableCell className="text-[#0F172A] font-medium">{teacher.full_name}</TableCell>
                          <TableCell className="text-sm">{teacher.email}</TableCell>
                          <TableCell>{teacher.specialization || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{teacher.rating} ⭐</Badge>
                          </TableCell>
                          <TableCell>{teacher.total_students.toLocaleString()}</TableCell>
                          <TableCell>
                            {(teacherCoursesMap[teacher.id] || []).length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {teacherCoursesMap[teacher.id].map(c => (
                                  <Badge key={c.id} variant="secondary" className="text-xs truncate max-w-[180px]" title={c.title}>
                                    {c.title}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#64748B]">Sin cursos</span>
                            )}
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
          {activeTab === "users" && !showUserForm && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative sm:max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input placeholder="Buscar usuarios..." className="pl-10" />
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(undefined);
                    setShowUserForm(true);
                  }}
                  className="ml-4 bg-[#1e467c] hover:bg-[#2d5f93]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
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
                        <TableCell colSpan={8} className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : usersError ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-red-600">
                          Error cargando usuarios: {usersError}
                        </TableCell>
                      </TableRow>
                    ) : usersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No hay usuarios registrados aún
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersList.map((user, index) => (
                        <TableRow key={user.id} className={cn(
                          deletingUserId === user.id && "opacity-50 transition-opacity duration-500"
                        )}>
                          <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
                          <TableCell className="text-[#0F172A] font-medium">{user.full_name || "Sin nombre"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>{user.country || "-"}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {user.role === 'admin' ? 'Administrador' : user.role === 'instructor' ? 'Profesor' : 'Estudiante'}
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
                                  setEditingUser(user);
                                  setShowUserForm(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setContactUser({ name: user.full_name || user.email, email: user.email });
                                  setContactDialogOpen(true);
                                }}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Contactar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-variant="destructive"
                                  onClick={() => handleDeleteUser(
                                    user.id as string,
                                    (user.full_name || user.email || "Usuario") as string
                                  )}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar usuario
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

          {/* User Form */}
          {activeTab === "users" && showUserForm && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(undefined);
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={() => {
                      setShowUserForm(false);
                      setEditingUser(undefined);
                    }}
                  />
                </CardContent>
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
                      <TableHead>#</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsData.map((payment, index) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
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
                      <TableHead>#</TableHead>
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
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#55a5c7]" />
                          <p className="text-sm text-[#64748B] mt-2">Cargando certificados...</p>
                        </TableCell>
                      </TableRow>
                    ) : certificatesError ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[#EF4444]">
                          Error: {certificatesError}
                        </TableCell>
                      </TableRow>
                    ) : realtimeCertificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[#64748B]">
                          No hay certificados emitidos aún
                        </TableCell>
                      </TableRow>
                    ) : (
                      realtimeCertificates.map((cert, index) => (
                        <TableRow key={cert.id} className={cn(
                          deletingCertId === cert.id && "opacity-50 transition-opacity duration-500"
                        )}>
                          <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
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
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  aria-label="Acciones del certificado"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Opciones</span>
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
                                <DropdownMenuItem
                                  data-variant="destructive"
                                  onClick={() => handleRevokeCertificate(cert.id, cert.student_name, cert.course_title)}
                                >
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
              {userToDelete && `Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario "${userToDelete.name}", su perfil y su acceso a la plataforma.`}
              {certToDelete && `Esta acción no se puede deshacer. Esto revocará y eliminará permanentemente el certificado de "${certToDelete.studentName}" para el curso "${certToDelete.courseTitle}".`}
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
