import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
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
  EyeOff,
  ArrowLeft,
  Mail,
  Menu,
  GraduationCap,
  Loader2,
  CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CourseLesson, EvaluationQuestion } from "../lib/data";
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
import { toggleActiveViaAdmin } from "../lib/adminOperations";
import { useCoursesRealtime } from "../hooks/useCoursesRealtime";
import { useEnrollmentCounts } from "../hooks/useEnrollmentCounts";
import { useTeachersRealtime } from "../hooks/useTeachers";
import { useCertificatesRealtime } from "../hooks/useCertificates";
import { usePayments, type PaymentRow } from "../hooks/usePayments";
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
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactUser, setContactUser] = useState<{ name: string; email: string } | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState<Record<string, unknown>[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [certToDelete, setCertToDelete] = useState<{ id: string; studentName: string; courseTitle: string } | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; displayName: string; courseTitle: string; status: string } | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);
  const [optimisticActiveState, setOptimisticActiveState] = useState<Record<string, boolean>>({});
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("all");
  const [usersDateFilter, setUsersDateFilter] = useState<Date | undefined>(undefined);
  // Filtros de cursos
  const [courseLevelFilter, setCourseLevelFilter] = useState<string>("all");
  const [courseSortBy, setCourseSortBy] = useState<string>("default");
  const [coursesSearch, setCoursesSearch] = useState("");
  const [coursesPage, setCoursesPage] = useState(1);
  const COURSES_PER_PAGE = 8;
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    certificatesIssued: 0,
    monthlyRevenue: 0,
  });

  // Use realtime hook for courses
  const { courses: realtimeCourses } = useCoursesRealtime();

  // Conteo de alumnos inscriptos en tiempo real (solo visible para admin)
  const { counts: enrollmentCounts } = useEnrollmentCounts();

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

  // Filtro de usuarios (por texto, rol, fecha de registro)
  const filteredUsers = useMemo(() => {
    let result = usersList;

    // Filtro por texto (busca en id, nombre, email)
    const q = usersSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((u) => {
        const id = ((u.id as string) || "").toLowerCase();
        const name = ((u.full_name as string) || "").toLowerCase();
        const email = ((u.email as string) || "").toLowerCase();
        return id.includes(q) || name.includes(q) || email.includes(q);
      });
    }

    // Filtro por rol
    if (usersRoleFilter !== "all") {
      result = result.filter((u) => u.role === usersRoleFilter);
    }

    // Filtro por fecha de registro (mismo día)
    if (usersDateFilter) {
      result = result.filter((u) => {
        const created = new Date(u.created_at as string);
        return (
          created.getFullYear() === usersDateFilter.getFullYear() &&
          created.getMonth() === usersDateFilter.getMonth() &&
          created.getDate() === usersDateFilter.getDate()
        );
      });
    }

    // Inactive users always go to the bottom
    result = [...result].sort((a, b) => {
      const aActive = (a.is_active as boolean) !== false ? 1 : 0;
      const bActive = (b.is_active as boolean) !== false ? 1 : 0;
      return bActive - aActive;
    });

    return result;
  }, [usersList, usersSearch, usersRoleFilter, usersDateFilter]);

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

  // Datos reales de pagos desde Supabase (payments + enrollments legacy)
  const { payments: allPayments, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePayments();

  const filteredPayments = useMemo(() => {
    const q = paymentsSearch.trim().toLowerCase();
    if (!q) return allPayments;
    return allPayments.filter(p =>
      p.displayName.toLowerCase().includes(q) ||
      p.displayEmail.toLowerCase().includes(q) ||
      p.courseTitle.toLowerCase().includes(q)
    );
  }, [allPayments, paymentsSearch]);

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
    is_active: course.is_active !== false,
  })), [realtimeCourses, profileToTeacherIdMap, realtimeTeachers]);

  // Calcular ventas por curso (pagos aprobados)
  const salesByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const payment of allPayments) {
      if (payment.status === "approved" || payment.status === "completed") {
        const courseId = payment.course_id;
        if (courseId) {
          map[courseId] = (map[courseId] || 0) + 1;
        }
      }
    }
    return map;
  }, [allPayments]);

  // Filtrar y ordenar cursos
  const filteredCourseList = useMemo(() => {
    let filtered = [...courseList];

    // Filtro por búsqueda
    const q = coursesSearch.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q)
      );
    }

    // Filtro por nivel
    if (courseLevelFilter !== "all") {
      filtered = filtered.filter(course => course.level === courseLevelFilter);
    }

    // Ordenamiento
    if (courseSortBy === "mostEnrolled") {
      filtered.sort((a, b) => {
        const enrollA = enrollmentCounts[a.id] || 0;
        const enrollB = enrollmentCounts[b.id] || 0;
        return enrollB - enrollA;
      });
    } else if (courseSortBy === "mostSold") {
      filtered.sort((a, b) => {
        const salesA = salesByCourse[a.id] || 0;
        const salesB = salesByCourse[b.id] || 0;
        return salesB - salesA;
      });
    }

    // Inactive courses always go to the bottom, regardless of other sorts
    filtered.sort((a, b) => {
      const aActive = a.is_active !== false ? 1 : 0;
      const bActive = b.is_active !== false ? 1 : 0;
      return bActive - aActive;
    });

    return filtered;
  }, [courseList, coursesSearch, courseLevelFilter, courseSortBy, enrollmentCounts, salesByCourse]);

  // Paginación de cursos
  const totalCoursesPages = Math.ceil(filteredCourseList.length / COURSES_PER_PAGE);
  const paginatedCourseList = useMemo(() => {
    const start = (coursesPage - 1) * COURSES_PER_PAGE;
    return filteredCourseList.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourseList, coursesPage]);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setCoursesPage(1);
  }, [coursesSearch, courseLevelFilter, courseSortBy]);

  // Cargar usuarios desde Supabase (Stage 1: activos, Stage 2: inactivos diferido)
  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      // Stage 1: load only active users first for fast render
      const { data: activeData, error: activeError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true);

      if (activeError) {
        // Fallback: if is_active column doesn't exist yet, load everything
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        setUsersList(data || []);
        debug("Usuarios cargados (fallback):", data?.length);
        return;
      }

      setUsersList(activeData || []);
      debug("Usuarios activos cargados:", activeData?.length);

      // Stage 2: defer loading inactive users after active ones are displayed
      supabase
        .from("profiles")
        .select("*")
        .eq("is_active", false)
        .then(({ data: inactiveData }) => {
          if (inactiveData && inactiveData.length > 0) {
            setUsersList((prev) => {
              const activeOnly = prev.filter((u) => (u.is_active as boolean) !== false);
              return [...activeOnly, ...inactiveData];
            });
            debug("Usuarios inactivos cargados:", inactiveData.length);
          }
        });
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
    const activeCourses = realtimeCourses.filter(c => c.is_active !== false).length;
    
    // Calcular ingresos del mes (pagos aprobados o legacy del mes actual)
    const now = new Date();
    const monthlyRevenue = allPayments
      .filter(p =>
        (p.status === "approved" || p.status === "legacy") &&
        new Date(p.created_at).getMonth() === now.getMonth() &&
        new Date(p.created_at).getFullYear() === now.getFullYear()
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalStudents,
      activeCourses,
      certificatesIssued: realtimeCertificates.filter(c => c.status === 'active').length,
      monthlyRevenue,
    });
  }, [usersList, realtimeCourses, realtimeCertificates, allPayments]);

  const handleSaveCourse = async (course: FullCourse) => {
    try {
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

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
            instructor_id: dbInstructorId,
          })
          .eq("id", course.id);
        
        if (error) {
          console.error("❌ Error UPDATE:", error);
          toast.error("Error al actualizar el curso: " + error.message);
          return;
        }
        toast.success("✅ Curso actualizado exitosamente");
      } else {
        // Usar el instructorId resuelto
        let instructorId = dbInstructorId;

        // Fallback: si no se seleccionó instructor, buscar un profile disponible
        if (!instructorId) {
          const { data: firstProfile } = await client.from("profiles").select("id").limit(1).single();
          if (!firstProfile) {
            toast.error("No hay perfiles en la base de datos");
            return;
          }
          instructorId = firstProfile.id;
        }

        // Crear nuevo curso en Supabase
        logAdminOperation('INSERT', 'courses', { title: course.title });
        
        const { data: newCourse, error } = await client.from("courses").insert([{
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
        }]).select();
        
        if (error) {
          console.error("❌ Error INSERT:", error);
          toast.error("Error al crear el curso: " + error.message);
          return;
        }
        
        // ✅ IMPORTANTE: Usar el ID real del curso recién creado
        if (newCourse && newCourse[0]) {
          course.id = newCourse[0].id;
          debug(`✅ Curso creado con ID: ${course.id}`);
        }
        
        toast.success("✅ Curso creado exitosamente");
      }

      // Guardar lecciones del curso
      if (course.lessons && course.lessons.length > 0) {
        try {
          // Eliminar lecciones existentes del curso (solo si es edición)
          if (editingCourse) {
            await client.from("lessons").delete().eq("course_id", course.id);
          }

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

          debug(`📝 Insertando ${lessonsToInsert.length} lecciones para curso ${course.id}`);

          const { error: lessonsError } = await client
            .from("lessons")
            .insert(lessonsToInsert);

          if (lessonsError) {
            console.error("❌ Error guardando lecciones:", lessonsError);
            console.error("❌ Datos que intentamos insertar:", lessonsToInsert);
            toast.warning("Curso guardado, pero error al guardar lecciones: " + lessonsError.message);
          } else {
            debug(`✅ ${lessonsToInsert.length} lecciones guardadas exitosamente`);
          }
        } catch (lessonsErr) {
          console.error("❌ Error guardando lecciones (catch):", lessonsErr);
          toast.warning("Curso guardado, pero error al guardar lecciones");
        }
      }

      // Guardar evaluaciones del curso
      if (course.evaluation && course.evaluation.length > 0) {
        try {
          // Eliminar evaluaciones existentes del curso (solo si es edición)
          if (editingCourse) {
            await client.from("evaluations").delete().eq("course_id", course.id);
          }

          // Insertar nuevas evaluaciones
          const evaluationsToInsert = course.evaluation.map((q, index) => ({
            course_id: course.id,
            question_order: index + 1,
            question: q.question,
            options: q.options, // ✅ Enviar como array directo (TEXT[] en PostgreSQL)
            correct_answer: q.correctAnswer,
            explanation: q.explanation || null,
          }));

          debug(`📝 Insertando ${evaluationsToInsert.length} evaluaciones para curso ${course.id}`);

          const { error: evalError } = await client
            .from("evaluations")
            .insert(evaluationsToInsert);

          if (evalError) {
            console.error("❌ Error guardando evaluaciones:", evalError);
            console.error("❌ Datos que intentamos insertar:", evaluationsToInsert);
            toast.warning("Curso guardado, pero error al guardar evaluaciones: " + evalError.message);
          } else {
            debug(`✅ ${evaluationsToInsert.length} evaluaciones guardadas exitosamente`);
          }
        } catch (evalErr) {
          console.error("❌ Error guardando evaluaciones (catch):", evalErr);
          toast.warning("Curso guardado, pero error al guardar evaluaciones");
        }
      }

      // ✅ Delay de 2.5 segundos para que la suscripción realtime actualice la UI
      debug("⏳ Esperando 2.5 segundos para que se sincronice el realtime...");
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      debug("✅ Curso guardado completamente, cerrando formulario");
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
      const mappedEvaluations = (evaluationsData || []).map((e: EvaluationQuestion) => {
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

  // Exportar datos del curso a Excel
  const handleExportCourseData = (course: typeof courseList[0]) => {
    const courseId = course.id;
    const enrolledCount = enrollmentCounts[courseId] || 0;
    const salesCount = salesByCourse[courseId] || 0;
    const totalRevenue = salesCount * (course.price || 0);

    // Obtener pagos relacionados con este curso
    const coursePayments = allPayments.filter(p => p.course_id === courseId);
    const approvedPayments = coursePayments.filter(p => p.status === "approved" || p.status === "completed");
    const pendingPayments = coursePayments.filter(p => p.status === "pending");
    const rejectedPayments = coursePayments.filter(p => p.status === "rejected" || p.status === "cancelled");

    // Hoja 1: Resumen del curso
    const summaryData = [
      ["REPORTE DE CURSO - " + course.title.toUpperCase()],
      [""],
      ["Información General"],
      ["Título", course.title],
      ["Categoría", course.category || "Sin categoría"],
      ["Nivel", course.level || "No especificado"],
      ["Duración", course.duration || "No especificada"],
      ["Precio", course.price ? `$${course.price.toLocaleString("es-AR")}` : "Gratis"],
      ["Certificado", course.certified ? "Sí" : "No"],
      [""],
      ["Métricas"],
      ["Total de inscriptos", enrolledCount],
      ["Ventas completadas", salesCount],
      ["Pagos pendientes", pendingPayments.length],
      ["Pagos rechazados/cancelados", rejectedPayments.length],
      [""],
      ["Ingresos"],
      ["Ingresos totales", `$${totalRevenue.toLocaleString("es-AR")}`],
      ["Promedio por venta", salesCount > 0 ? `$${(totalRevenue / salesCount).toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : "$0"],
      [""],
      ["Fecha de exportación", new Date().toLocaleString("es-AR")],
    ];

    // Hoja 2: Detalle de pagos
    const paymentsHeader = ["Usuario", "Email", "Estado", "Monto", "Fecha"];
    const paymentsRows = coursePayments.map(p => [
      p.displayName || "Desconocido",
      p.displayEmail || "-",
      p.status === "approved" || p.status === "completed" ? "Aprobado" :
        p.status === "pending" ? "Pendiente" : "Rechazado/Cancelado",
      `$${(p.amount || 0).toLocaleString("es-AR")}`,
      p.created_at ? new Date(p.created_at).toLocaleDateString("es-AR") : "-",
    ]);

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja resumen
    const wsResumen = XLSX.utils.aoa_to_sheet(summaryData);
    wsResumen["!cols"] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Hoja de pagos
    if (coursePayments.length > 0) {
      const wsPagos = XLSX.utils.aoa_to_sheet([paymentsHeader, ...paymentsRows]);
      wsPagos["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsPagos, "Detalle de Pagos");
    }

    // Descargar archivo
    const fileName = `curso_${course.slug || course.id}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success(`Datos exportados: ${fileName}`);
  };

  // Exportar todos los pagos a Excel
  const handleExportAllPayments = () => {
    if (filteredPayments.length === 0) {
      toast.error("No hay pagos para exportar");
      return;
    }

    // Calcular totales
    const totalApproved = filteredPayments.filter(p => p.status === "approved" || p.status === "completed");
    const totalPending = filteredPayments.filter(p => p.status === "pending" || p.status === "legacy");
    const totalRejected = filteredPayments.filter(p => p.status === "rejected" || p.status === "cancelled");
    const totalRevenue = totalApproved.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingRevenue = totalPending.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Hoja 1: Resumen
    const summaryData = [
      ["REPORTE DE PAGOS - LMS FUDENSA"],
      [""],
      ["Resumen General"],
      ["Total de pagos", filteredPayments.length],
      ["Pagos aprobados", totalApproved.length],
      ["Pagos pendientes", totalPending.length],
      ["Pagos rechazados/cancelados", totalRejected.length],
      [""],
      ["Ingresos"],
      ["Ingresos totales (aprobados)", `$${totalRevenue.toLocaleString("es-AR")}`],
      ["Ingresos pendientes", `$${pendingRevenue.toLocaleString("es-AR")}`],
      [""],
      ["Fecha de exportación", new Date().toLocaleString("es-AR")],
    ];

    // Hoja 2: Detalle de todos los pagos
    const paymentsHeader = ["#", "Estado", "Fecha", "Usuario", "Email", "Curso", "Monto", "Moneda", "ID de Pago"];
    const paymentsRows = filteredPayments.map((p, idx) => [
      idx + 1,
      p.status === "approved" || p.status === "completed" ? "Aprobado" :
        p.status === "pending" ? "Pendiente" :
        p.status === "legacy" ? "Manual" : "Rechazado/Cancelado",
      p.created_at ? new Date(p.created_at).toLocaleDateString("es-AR") : "-",
      p.displayName || "Desconocido",
      p.displayEmail || "-",
      p.courseTitle || "-",
      p.amount || 0,
      p.currency || "ARS",
      p.id || "-",
    ]);

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja resumen
    const wsResumen = XLSX.utils.aoa_to_sheet(summaryData);
    wsResumen["!cols"] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Hoja detalle de pagos
    const wsPagos = XLSX.utils.aoa_to_sheet([paymentsHeader, ...paymentsRows]);
    wsPagos["!cols"] = [
      { wch: 5 },  // #
      { wch: 15 }, // Estado
      { wch: 12 }, // Fecha
      { wch: 25 }, // Usuario
      { wch: 30 }, // Email
      { wch: 30 }, // Curso
      { wch: 12 }, // Monto
      { wch: 8 },  // Moneda
      { wch: 36 }, // ID
    ];
    XLSX.utils.book_append_sheet(wb, wsPagos, "Detalle de Pagos");

    // Descargar archivo
    const fileName = `pagos_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success(`${filteredPayments.length} pagos exportados: ${fileName}`);
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
      if (certToDelete) {
        setDeletingCertId(certToDelete.id);
        logAdminOperation('DELETE', 'certificates', { certId: certToDelete.id });

        const { error } = await client
          .from("certificates")
          .delete()
          .eq("id", certToDelete.id);

        if (error) {
          console.error("\u274c Error DELETE certificate:", error);
          toast.error("Error al revocar certificado: " + error.message);
          setDeletingCertId(null);
          return;
        }

        toast.success(`\u2705 Certificado de "${certToDelete.studentName}" revocado exitosamente`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingCertId(null);
        setCertToDelete(null);
      }
      if (userToDelete) {
        setDeletingUserId(userToDelete.id);
        logAdminOperation('DELETE', 'user', { userId: userToDelete.id, userName: userToDelete.name });

        if (!isAdminClientConfigured()) {
          toast.error("Se requiere la SERVICE_ROLE_KEY para eliminar usuarios");
          setDeletingUserId(null);
          return;
        }

        // 1. Eliminar perfil de la tabla profiles
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", userToDelete.id);

        if (profileError) {
          console.error("❌ Error DELETE profile:", profileError);
          toast.error("Error al eliminar perfil: " + profileError.message);
          setDeletingUserId(null);
          return;
        }

        // 2. Eliminar usuario de auth (esto revoca todo acceso)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

        if (authError) {
          console.error("❌ Error DELETE auth user:", authError);
          toast.error("Error al eliminar usuario de auth: " + authError.message);
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
      if (paymentToDelete) {
        setDeletingPaymentId(paymentToDelete.id);

        // ── Detectar si es un pago legacy: por status O por el prefijo del ID
        const isLegacyPayment = paymentToDelete.status === "legacy" || paymentToDelete.id.startsWith("legacy-");
        const actualId = isLegacyPayment 
          ? paymentToDelete.id.replace("legacy-", "") // Quitar prefijo para obtener enrollment UUID
          : paymentToDelete.id;

        logAdminOperation('DELETE', isLegacyPayment ? 'enrollments' : 'payments', {
          paymentId: paymentToDelete.id,
          user: paymentToDelete.displayName,
          isLegacy: isLegacyPayment,
        });

        // ── Deletear de la tabla correcta según el tipo de pago
        const { error } = await client
          .from(isLegacyPayment ? "enrollments" : "payments")
          .delete()
          .eq("id", actualId);

        if (error) {
          console.error("❌ Error DELETE payment:", error);
          toast.error("Error al eliminar el pago: " + error.message);
          setDeletingPaymentId(null);
          return;
        }

        toast.success(`✅ Pago de "${paymentToDelete.displayName}" eliminado exitosamente`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingPaymentId(null);
        setPaymentToDelete(null);
        refetchPayments();
      }
    } catch (err) {
      toast.error("Error al eliminar");
      console.error(err);
      setDeletingCourseId(null);
      setDeletingTeacherId(null);
      setDeletingUserId(null);
      setDeletingCertId(null);
      setDeletingPaymentId(null);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      setTeacherToDelete(null);
      setUserToDelete(null);
      setCertToDelete(null);
      setPaymentToDelete(null);
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

  // Helper: obtener el estado actual del curso (real + optimistic)
  const getCourseActiveState = (courseId: string, realState: boolean): boolean => {
    return optimisticActiveState[courseId] !== undefined ? optimisticActiveState[courseId] : realState;
  };

  // Helper: obtener el estado actual del profesor (real + optimistic)
  const getTeacherActiveState = (teacherId: string, realState: boolean): boolean => {
    return optimisticActiveState[teacherId] !== undefined ? optimisticActiveState[teacherId] : realState;
  };

  const handleToggleActiveCourse = async (courseId: string, newIsActive: boolean) => {
    setTogglingActiveId(courseId);
    // Optimistic update: mostrar estado nuevo inmediatamente
    setOptimisticActiveState((prev) => ({ ...prev, [courseId]: newIsActive }));

    try {
      await toggleActiveViaAdmin({ type: 'course', id: courseId, is_active: newIsActive });
      toast.success(newIsActive ? "✅ Curso activado" : "❌ Curso desactivado");
    } catch (err) {
      console.error("Error toggling course active state:", err);
      // Revert optimistic state on error
      setOptimisticActiveState((prev) => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
      toast.error("Error al cambiar el estado del curso");
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleToggleActiveTeacher = async (teacherId: string, newIsActive: boolean) => {
    setTogglingActiveId(teacherId);
    // Optimistic update
    setOptimisticActiveState((prev) => ({ ...prev, [teacherId]: newIsActive }));

    try {
      await toggleActiveViaAdmin({ type: 'teacher', id: teacherId, is_active: newIsActive });
      toast.success(newIsActive ? "✅ Profesor activado" : "❌ Profesor desactivado");
    } catch (err) {
      console.error("Error toggling teacher active state:", err);
      // Revert optimistic state on error
      setOptimisticActiveState((prev) => {
        const updated = { ...prev };
        delete updated[teacherId];
        return updated;
      });
      toast.error("Error al cambiar el estado del profesor");
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleToggleActiveUser = async (userId: string, newIsActive: boolean) => {
    setTogglingActiveId(userId);
    try {
      await toggleActiveViaAdmin({ type: 'user', id: userId, is_active: newIsActive });
      // Update local state optimistically since users have no realtime subscription
      setUsersList((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_active: newIsActive } : u)
      );
      toast.success(newIsActive ? "✅ Usuario activado" : "❌ Usuario desactivado");
    } catch (err) {
      console.error("Error toggling user active state:", err);
      toast.error("Error al cambiar el estado del usuario");
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleRevokeCertificate = (certId: string, studentName: string, courseTitle: string) => {
    setCertToDelete({ id: certId, studentName, courseTitle });
    setDeleteDialogOpen(true);
  };

  const downloadComprobante = (payment: PaymentRow) => {
    const lines = [
      "=== COMPROBANTE DE PAGO - FUDENSA ===",
      `Fecha: ${new Date(payment.created_at).toLocaleString("es-AR")}`,
      `Estado: ${payment.status.toUpperCase()}`,
      `Alumno: ${payment.displayName}`,
      `Email: ${payment.displayEmail}`,
      `Curso: ${payment.courseTitle}`,
      `Monto: ${payment.currency} $${payment.amount.toLocaleString("es-AR")}`,
      payment.mp_payment_id ? `ID de Pago MP: ${payment.mp_payment_id}` : "Pago legacy (sin ID de MP)",
      payment.payment_method ? `Método: ${payment.payment_method}` : "",
      "=====================================",
    ].filter(Boolean).join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-${payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

      if (editingUser) {
        // Actualizar usuario existente
        logAdminOperation('UPDATE', 'profiles', { userId: editingUser.id });
        
        const { error: updateError } = await client
          .from("profiles")
          .update({
            full_name: userData.full_name,
            role: userData.role,
            country: userData.country,
            phone: userData.phone,
          })
          .eq("id", editingUser.id);

        if (updateError) throw updateError;

        // Si cambió a rol profesor, crear/actualizar registro en teachers
        if (userData.role === 'instructor') {
          const { data: existingTeacher } = await client
            .from("teachers")
            .select("id")
            .eq("user_id", editingUser.id)
            .single();

          if (!existingTeacher) {
            // Crear registro de teacher
            await client.from("teachers").insert({
              user_id: editingUser.id,
              full_name: userData.full_name,
              email: userData.email,
              bio: userData.bio || "",
              specialization: userData.specialization || "",
              years_of_experience: 0,
              rating: 0,
              total_students: 0,
              total_courses: 0,
              is_active: true,
            });
          } else {
            // Actualizar registro de teacher existente
            await client
              .from("teachers")
              .update({
                full_name: userData.full_name,
                bio: userData.bio || "",
                specialization: userData.specialization || "",
              })
              .eq("user_id", editingUser.id);
          }
        }

        toast.success("Usuario actualizado exitosamente");
      } else {
        // Crear nuevo usuario
        if (!userData.password) {
          toast.error("La contraseña es requerida para nuevos usuarios");
          return;
        }

        logAdminOperation('CREATE', 'auth.users', { email: userData.email });

        // Crear usuario en auth
        const { data: authData, error: authError } = await client.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario");

        // Crear perfil
        const { error: profileError } = await client
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            country: userData.country,
            phone: userData.phone,
          });

        if (profileError) throw profileError;

        // Si es profesor, crear registro en teachers
        if (userData.role === 'instructor') {
          await client.from("teachers").insert({
            user_id: authData.user.id,
            full_name: userData.full_name,
            email: userData.email,
            bio: userData.bio || "",
            specialization: userData.specialization || "",
            years_of_experience: 0,
            rating: 0,
            total_students: 0,
            total_courses: 0,
            is_active: true,
          });
        }

        toast.success("Usuario creado exitosamente");
      }

      setShowUserForm(false);
      setEditingUser(undefined);
      loadUsers();
      if (userData.role === 'instructor') {
        refetchTeachers();
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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white lg:block lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
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
        {/* Header - solo visible en móvil */}
        <header className="sticky top-0 z-10 border-b bg-white lg:hidden">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
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
              {/* Barra de búsqueda y botón nuevo curso */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input 
                    placeholder="Buscar cursos..." 
                    className="pl-10"
                    value={coursesSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoursesSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowCourseForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
              </div>

              {/* Filtros */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B] whitespace-nowrap">Nivel:</span>
                  <Select value={courseLevelFilter} onValueChange={setCourseLevelFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B] whitespace-nowrap">Ordenar por:</span>
                  <Select value={courseSortBy} onValueChange={setCourseSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Por defecto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Por defecto</SelectItem>
                      <SelectItem value="mostEnrolled">Más inscriptos</SelectItem>
                      <SelectItem value="mostSold">Más vendidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(courseLevelFilter !== "all" || courseSortBy !== "default" || coursesSearch) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setCourseLevelFilter("all");
                      setCourseSortBy("default");
                      setCoursesSearch("");
                    }}
                    className="text-[#64748B] hover:text-[#1E293B]"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedCourseList.length > 0 ? (
                  paginatedCourseList.map((course) => {
                    const isActive = getCourseActiveState(course.id, course.is_active !== false);
                    const isToggling = togglingActiveId === course.id;

                    return (
                    <div
                      key={course.id}
                      className={cn(
                        "relative group transition-all duration-300",
                        deletingCourseId === course.id
                          ? "opacity-0 scale-95"
                          : !isActive
                          ? "opacity-40 scale-100 grayscale"
                          : "opacity-100 scale-100"
                      )}
                    >
                      {!isActive && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none">
                          <Badge className="bg-red-600 text-white text-sm font-bold px-3 py-1 shadow-md">INACTIVO</Badge>
                        </div>
                      )}
                      {isToggling && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                      <div className={cn(!isActive && "pointer-events-none")}>
                        <CourseCard
                          id={course.id}
                          title={course.title}
                          image={course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"}
                          duration={course.duration || "4 semanas"}
                          level={course.level as "Básico" | "Intermedio" | "Avanzado"}
                          certified={course.certified || false}
                          students={course.students}
                          enrollmentCount={enrollmentCounts[course.id] ?? 0}
                          onClick={() => handleEditCourse(course)}
                        />
                      </div>
                      <div className={cn(
                        "absolute top-2 right-2 transition-opacity z-20",
                        !isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
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
                            <DropdownMenuItem onClick={() => handleExportCourseData(course)}>
                              <Download className="mr-2 h-4 w-4" />
                              Exportar datos
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActiveCourse(course.id, !isActive)}
                              disabled={isToggling}
                              className={isActive ? "text-amber-600" : "text-green-600"}
                            >
                              {isActive ? (
                                <><EyeOff className="mr-2 h-4 w-4" />Desactivar</>
                              ) : (
                                <><Eye className="mr-2 h-4 w-4" />Activar</>
                              )}
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
                    );
                  })
                ) : (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <p className="text-[#64748B]">
                      {courseLevelFilter !== "all" || coursesSearch 
                        ? "No se encontraron cursos con los filtros seleccionados."
                        : "No hay cursos disponibles. Crea uno para comenzar."}
                    </p>
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalCoursesPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoursesPage(p => Math.max(1, p - 1))}
                    disabled={coursesPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalCoursesPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={coursesPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCoursesPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoursesPage(p => Math.min(totalCoursesPages, p + 1))}
                    disabled={coursesPage === totalCoursesPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#64748B] ml-2">
                    {filteredCourseList.length} curso{filteredCourseList.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
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
                          className={cn(
                            "transition-all duration-300 relative",
                            deletingTeacherId === teacher.id
                              ? "opacity-0 bg-red-50/50"
                              : !getTeacherActiveState(teacher.id, teacher.is_active !== false)
                              ? "opacity-40 bg-gray-100 grayscale"
                              : "opacity-100 bg-transparent"
                          )}
                        >
                          {togglingActiveId === teacher.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded z-20">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          )}
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
                            {getTeacherActiveState(teacher.id, teacher.is_active !== false) ? (
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
                                  onClick={() => handleToggleActiveTeacher(teacher.id, !getTeacherActiveState(teacher.id, teacher.is_active !== false))}
                                  disabled={togglingActiveId === teacher.id}
                                  className={getTeacherActiveState(teacher.id, teacher.is_active !== false) ? "text-amber-600" : "text-green-600"}
                                >
                                  {getTeacherActiveState(teacher.id, teacher.is_active !== false) ? (
                                    <><EyeOff className="mr-2 h-4 w-4" />Desactivar</>
                                  ) : (
                                    <><Eye className="mr-2 h-4 w-4" />Activar</>
                                  )}
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
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="relative sm:max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <Input
                      placeholder="Buscar por ID, nombre o correo..."
                      className="pl-10"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filtro por Rol */}
                  <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="instructor">Profesor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filtro por Fecha de registro */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !usersDateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {usersDateFilter
                          ? usersDateFilter.toLocaleDateString("es-AR")
                          : "Fecha de registro"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={usersDateFilter}
                        onSelect={setUsersDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Limpiar filtros */}
                  {(usersSearch || usersRoleFilter !== "all" || usersDateFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUsersSearch("");
                        setUsersRoleFilter("all");
                        setUsersDateFilter(undefined);
                      }}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
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
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No se encontraron usuarios con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user.id} className={cn(
                          "transition-all duration-300 relative",
                          deletingUserId === user.id && "opacity-50 transition-opacity duration-500",
                          (user.is_active as boolean) === false && deletingUserId !== user.id && "opacity-40 bg-gray-100 grayscale"
                        )}>
                          {togglingActiveId === (user.id as string) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded z-20">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          )}
                          <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
                          <TableCell className="text-[#0F172A] font-medium">{user.full_name || "Sin nombre"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {user.role === 'admin' ? 'Administrador' : user.role === 'instructor' ? 'Profesor' : 'Estudiante'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(user.is_active as boolean) !== false ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">Activo</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">Inactivo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{new Date(user.created_at as string).toLocaleDateString('es-AR')}</TableCell>
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
                                <DropdownMenuItem
                                  onClick={() => handleToggleActiveUser(
                                    user.id as string,
                                    (user.is_active as boolean) === false
                                  )}
                                  disabled={togglingActiveId === (user.id as string)}
                                  className={(user.is_active as boolean) !== false ? "text-amber-600" : "text-green-600"}
                                >
                                  {(user.is_active as boolean) !== false ? (
                                    <><EyeOff className="mr-2 h-4 w-4" />Desactivar</>
                                  ) : (
                                    <><Eye className="mr-2 h-4 w-4" />Activar</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setContactUser({ name: (user.full_name || user.email) as string, email: user.email as string });
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar pagos..."
                    className="pl-10"
                    value={paymentsSearch}
                    onChange={(e) => setPaymentsSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleExportAllPayments} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
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
                    {paymentsLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#64748B]" />
                        </TableCell>
                      </TableRow>
                    )}
                    {!paymentsLoading && paymentsError && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[#EF4444]">
                          Error al cargar pagos: {paymentsError}
                        </TableCell>
                      </TableRow>
                    )}
                    {!paymentsLoading && !paymentsError && filteredPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[#64748B]">
                          No se encontraron pagos.
                        </TableCell>
                      </TableRow>
                    )}
                    {!paymentsLoading && filteredPayments.map((payment, index) => (
                      <TableRow
                        key={payment.id}
                        className={deletingPaymentId === payment.id ? "opacity-50 transition-opacity" : ""}
                      >
                        <TableCell className="text-[#64748B] font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === "approved"
                                ? "bg-[#22C55E] text-white"
                                : payment.status === "pending" || payment.status === "legacy"
                                ? "bg-[#F59E0B] text-white"
                                : "bg-[#EF4444] text-white"
                            }
                          >
                            {payment.status === "approved" ? "Aprobado"
                              : payment.status === "pending" ? "Pendiente"
                              : payment.status === "legacy" ? "Manual"
                              : payment.status === "rejected" ? "Rechazado"
                              : "Cancelado"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString("es-AR")}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[#0F172A]">{payment.displayName}</span>
                            <span className="text-xs text-[#64748B]">{payment.displayEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.courseTitle}</TableCell>
                        <TableCell className="font-semibold text-[#0F172A]">
                          {payment.currency} ${payment.amount.toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => downloadComprobante(payment)}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Comprobante
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactUser(payment.displayName, payment.displayEmail)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contactar Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-[#EF4444]"
                                onClick={() => {
                                  setPaymentToDelete({ id: payment.id, displayName: payment.displayName, courseTitle: payment.courseTitle, status: payment.status });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Pago
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
              {paymentToDelete && `Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de pago de "${paymentToDelete.displayName}" por el curso "${paymentToDelete.courseTitle}".`}
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
