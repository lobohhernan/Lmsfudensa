import { useState, useEffect, useMemo, useRef } from "react";
import ExcelJS from "exceljs";
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
import { Checkbox } from "../components/ui/checkbox";
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
import { CertificateTemplate, type CertificateData } from "../components/CertificateTemplate";
import { generateCertificatePDF, formatCertificateDate } from "../utils/certificate";
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
import logoIco from "../assets/logo-ico.svg";
import logoHorizontalPng from "../assets/logo_horizontalpng.png";
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
  const ADMIN_TABLE_ROWS_PER_PAGE = 15;
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
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [selectedCertData, setSelectedCertData] = useState<CertificateData | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactUser, setContactUser] = useState<{ name: string; email: string } | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState<Record<string, unknown>[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [certToDelete, setCertToDelete] = useState<{ id: string; studentName: string; courseTitle: string } | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; displayName: string; courseTitle: string; status: string } | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);
  const [optimisticActiveState, setOptimisticActiveState] = useState<Record<string, boolean>>({});
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [paymentsDateRangeFilter, setPaymentsDateRangeFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<string>("all");
  const [paymentsAmountRangeFilter, setPaymentsAmountRangeFilter] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [showInactiveCourses, setShowInactiveCourses] = useState(false);
  const [showInactiveTeachers, setShowInactiveTeachers] = useState(false);
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("all");
  const [usersDateRangeFilter, setUsersDateRangeFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [teachersPage, setTeachersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [certificatesPage, setCertificatesPage] = useState(1);
  const [certificatesSearch, setCertificatesSearch] = useState("");
  const [certificatesCourseFilter, setCertificatesCourseFilter] = useState<string>("all");
  const [certificatesDateRangeFilter, setCertificatesDateRangeFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
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
  const { courses: realtimeCourses, refetch: refetchCourses } = useCoursesRealtime();

  // Conteo de alumnos inscriptos en tiempo real (solo visible para admin)
  const { counts: enrollmentCounts } = useEnrollmentCounts();

  // Use realtime hook for teachers
  const { teachers: realtimeTeachers, loading: teachersLoading, refetch: refetchTeachers } = useTeachersRealtime();

  // Use realtime hook for certificates
  const { certificates: realtimeCertificates, loading: certificatesLoading, error: certificatesError } = useCertificatesRealtime();

  const handleGeneratePDF = async (cert: any) => {
    setGeneratingPdfId(cert.id);
    setSelectedCertData({
      studentName: cert.student_name,
      dni: "", // Optional, leave blank if not available
      courseName: cert.course_title,
      courseHours: "40", // Default or fetch if available
      issueDate: formatCertificateDate(new Date(cert.issue_date)),
      certificateId: cert.hash.substring(0, 16).toUpperCase(),
    });

    // Wait for the hidden component to render
    setTimeout(async () => {
      if (certificateRef.current) {
        try {
          await generateCertificatePDF(certificateRef.current, {
            studentName: cert.student_name,
            dni: "",
            courseName: cert.course_title,
            courseHours: "40",
            issueDate: formatCertificateDate(new Date(cert.issue_date)),
            certificateId: cert.hash.substring(0, 16).toUpperCase(),
          });
          toast.success("Certificado generado y descargado exitosamente");
        } catch (error) {
          console.error("Error al generar el certificado:", error);
          toast.error("Error al generar el PDF del certificado");
        }
      }
      setGeneratingPdfId(null);
    }, 800);
  };

  // Search/filter state for teachers (memoized)
  const filteredTeachers = useMemo(() => {
    let result = realtimeTeachers;

    if (!showInactiveTeachers) {
      result = result.filter(t => t.is_active !== false);
    }

    const q = teacherQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((t) => {
        return (
          (t.full_name || "").toLowerCase().includes(q) ||
          (t.email || "").toLowerCase().includes(q) ||
          ((t.specialization || "").toLowerCase().includes(q))
        );
      });
    }

    // Ordenar para que los inactivos (si se muestran) aparezcan al final
    return [...result].sort((a, b) => {
      const aActive = a.is_active !== false ? 1 : 0;
      const bActive = b.is_active !== false ? 1 : 0;
      return bActive - aActive;
    });
  }, [realtimeTeachers, teacherQuery, showInactiveTeachers]);
  const filteredUsers = useMemo(() => {
    // Sincronizar el estado isActive de los usuarios profesores con su registro real de la tabla teachers
    let result = usersList.map(user => {
      let is_active = user.is_active;
      if (user.role === 'instructor') {
        const teacher = realtimeTeachers.find(t => t.user_id === user.id);
        if (teacher && teacher.is_active !== undefined) {
          is_active = teacher.is_active;
        }
      }
      return { ...user, is_active };
    });

    // Filtro por inactivos
    if (!showInactiveUsers) {
      result = result.filter(u => u.is_active !== false);
    }

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

    // Filtro por rango de fecha de registro
    if (usersDateRangeFilter.from || usersDateRangeFilter.to) {
      result = result.filter((u) => {
        const created = new Date(u.created_at as string);
        if (usersDateRangeFilter.from && created < usersDateRangeFilter.from) return false;
        if (usersDateRangeFilter.to) {
          const nextDay = new Date(usersDateRangeFilter.to);
          nextDay.setDate(nextDay.getDate() + 1);
          if (created >= nextDay) return false;
        }
        return true;
      });
    }

    // Inactive users always go to the bottom
    result = [...result].sort((a, b) => {
      const aActive = (a.is_active as boolean) !== false ? 1 : 0;
      const bActive = (b.is_active as boolean) !== false ? 1 : 0;
      return bActive - aActive;
    });

    return result;
  }, [usersList, usersSearch, usersRoleFilter, usersDateRangeFilter, showInactiveUsers, realtimeTeachers]);

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

  const parseFilterPart = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const filteredPayments = useMemo(() => {
    const q = paymentsSearch.trim().toLowerCase();
    const minAmount = paymentsAmountRangeFilter.from ? parseFloat(paymentsAmountRangeFilter.from) : null;
    const maxAmount = paymentsAmountRangeFilter.to ? parseFloat(paymentsAmountRangeFilter.to) : null;
    
    return allPayments.filter((p) => {
      const matchText =
        !q ||
        p.displayName.toLowerCase().includes(q) ||
        p.displayEmail.toLowerCase().includes(q) ||
        p.courseTitle.toLowerCase().includes(q);

      if (!matchText) return false;

      // Filtro de estado
      if (paymentsStatusFilter !== "all" && p.status !== paymentsStatusFilter) return false;

      // Filtro de rango de monto
      if (minAmount !== null && (p.amount || 0) < minAmount) return false;
      if (maxAmount !== null && (p.amount || 0) > maxAmount) return false;

      const created = new Date(p.created_at);
      if (Number.isNaN(created.getTime())) return false;

      if (paymentsDateRangeFilter.from || paymentsDateRangeFilter.to) {
        if (paymentsDateRangeFilter.from && created < paymentsDateRangeFilter.from) return false;
        if (paymentsDateRangeFilter.to) {
          const nextDay = new Date(paymentsDateRangeFilter.to);
          nextDay.setDate(nextDay.getDate() + 1);
          if (created >= nextDay) return false;
        }
      }

      return true;
    });
  }, [allPayments, paymentsSearch, paymentsDateRangeFilter, paymentsStatusFilter, paymentsAmountRangeFilter]);

  const totalTeachersPages = Math.max(1, Math.ceil(filteredTeachers.length / ADMIN_TABLE_ROWS_PER_PAGE));
  const paginatedTeachers = useMemo(() => {
    const start = (teachersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE;
    return filteredTeachers.slice(start, start + ADMIN_TABLE_ROWS_PER_PAGE);
  }, [filteredTeachers, teachersPage, ADMIN_TABLE_ROWS_PER_PAGE]);

  const totalUsersPages = Math.max(1, Math.ceil(filteredUsers.length / ADMIN_TABLE_ROWS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE;
    return filteredUsers.slice(start, start + ADMIN_TABLE_ROWS_PER_PAGE);
  }, [filteredUsers, usersPage, ADMIN_TABLE_ROWS_PER_PAGE]);

  const totalPaymentsPages = Math.max(1, Math.ceil(filteredPayments.length / ADMIN_TABLE_ROWS_PER_PAGE));
  const paginatedPayments = useMemo(() => {
    const start = (paymentsPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE;
    return filteredPayments.slice(start, start + ADMIN_TABLE_ROWS_PER_PAGE);
  }, [filteredPayments, paymentsPage, ADMIN_TABLE_ROWS_PER_PAGE]);

  const filteredCertificates = useMemo(() => {
    let result = realtimeCertificates;

    // Filtro por búsqueda de estudiante
    if (certificatesSearch) {
      const q = certificatesSearch.trim().toLowerCase();
      result = result.filter((c) => (c.student_name || "").toLowerCase().includes(q));
    }

    // Filtro por curso
    if (certificatesCourseFilter !== "all") {
      result = result.filter((c) => c.course_title === certificatesCourseFilter);
    }

    // Filtro por rango de fecha
    if (certificatesDateRangeFilter.from || certificatesDateRangeFilter.to) {
      result = result.filter((c) => {
        const issueDate = new Date(c.issue_date);
        if (certificatesDateRangeFilter.from && issueDate < certificatesDateRangeFilter.from) return false;
        if (certificatesDateRangeFilter.to) {
          const nextDay = new Date(certificatesDateRangeFilter.to);
          nextDay.setDate(nextDay.getDate() + 1);
          if (issueDate >= nextDay) return false;
        }
        return true;
      });
    }

    return result;
  }, [realtimeCertificates, certificatesSearch, certificatesCourseFilter, certificatesDateRangeFilter]);

  const totalCertificatesPages = Math.max(1, Math.ceil(filteredCertificates.length / ADMIN_TABLE_ROWS_PER_PAGE));
  const paginatedCertificates = useMemo(() => {
    const start = (certificatesPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE;
    return filteredCertificates.slice(start, start + ADMIN_TABLE_ROWS_PER_PAGE);
  }, [filteredCertificates, certificatesPage, ADMIN_TABLE_ROWS_PER_PAGE]);

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

    // Filtro por inactivos
    if (!showInactiveCourses) {
      filtered = filtered.filter(course => course.is_active !== false);
    }

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

    // Inactive courses always go to the top, regardless of other sorts
    filtered.sort((a, b) => {
      const aActive = a.is_active !== false ? 1 : 0;
      const bActive = b.is_active !== false ? 1 : 0;
      return aActive - bActive;
    });

    return filtered;
  }, [courseList, coursesSearch, courseLevelFilter, courseSortBy, enrollmentCounts, salesByCourse, showInactiveCourses]);

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

  useEffect(() => {
    setTeachersPage(1);
  }, [teacherQuery]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch, usersRoleFilter, usersDateRangeFilter]);

  useEffect(() => {
    setPaymentsPage(1);
  }, [paymentsSearch, paymentsDateRangeFilter, paymentsStatusFilter, paymentsAmountRangeFilter]);

  useEffect(() => {
    setCertificatesPage(1);
  }, [certificatesSearch, certificatesCourseFilter, certificatesDateRangeFilter]);

  useEffect(() => {
    setTeachersPage((current) => Math.min(current, totalTeachersPages));
  }, [totalTeachersPages]);

  useEffect(() => {
    setUsersPage((current) => Math.min(current, totalUsersPages));
  }, [totalUsersPages]);

  useEffect(() => {
    setPaymentsPage((current) => Math.min(current, totalPaymentsPages));
  }, [totalPaymentsPages]);

  useEffect(() => {
    setCertificatesPage((current) => Math.min(current, totalCertificatesPages));
  }, [totalCertificatesPages]);

  useEffect(() => {
    setCertificatesPage((current) => Math.min(current, totalCertificatesPages));
  }, [totalCertificatesPages]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user_session");
      if (!stored) {
        setHasAdminAccess(false);
        return;
      }
      const parsed = JSON.parse(stored) as { role?: string };
      setHasAdminAccess(parsed.role === "admin");
    } catch {
      setHasAdminAccess(false);
    }
  }, []);

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
        console.error('No se pudo resolver el instructor_id para la BD');
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
          console.error("Error UPDATE:", error);
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
          console.error("Error INSERT:", error);
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



          const { error: lessonsError } = await client
            .from("lessons")
            .insert(lessonsToInsert);

          if (lessonsError) {
            console.error("Error guardando lecciones:", lessonsError);
            console.error("Datos que intentamos insertar:", lessonsToInsert);
            toast.warning("Curso guardado, pero error al guardar lecciones: " + lessonsError.message);
          } else {
            debug(`✅ ${lessonsToInsert.length} lecciones guardadas exitosamente`);
          }
        } catch (lessonsErr) {
          console.error("Error guardando lecciones (catch):", lessonsErr);
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



          const { error: evalError } = await client
            .from("evaluations")
            .insert(evaluationsToInsert);

          if (evalError) {
            console.error("Error guardando evaluaciones:", evalError);
            console.error("Datos que intentamos insertar:", evaluationsToInsert);
            toast.warning("Curso guardado, pero error al guardar evaluaciones: " + evalError.message);
          } else {
            debug(`✅ ${evaluationsToInsert.length} evaluaciones guardadas exitosamente`);
          }
        } catch (evalErr) {
          console.error("Error guardando evaluaciones (catch):", evalErr);
          toast.warning("Curso guardado, pero error al guardar evaluaciones");
        }
      }

      await refetchCourses();
      
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

  type ExportSummarySection = {
    title: string;
    rows: Array<[string, string | number]>;
  };

  type ExportKpiTone = "primary" | "secondary" | "success" | "warning";

  type ExportKpi = {
    label: string;
    value: string | number;
    tone: ExportKpiTone;
  };

  type WorkbookBrandAssets = {
    logoImageId?: number;
  };

  const EXCEL_BRAND = {
    primary: "FF1E467C",
    secondary: "FF55A5C7",
    light: "FFEFF6FB",
    border: "FFD8E2EC",
    textDark: "FF0F172A",
    textMuted: "FF475569",
    white: "FFFFFFFF",
    zebra: "FFF8FBFF",
    statusSuccess: "FFE8F8EF",
    statusWarning: "FFFFF5E6",
    statusDanger: "FFFEECEC",
  };

  const EXCEL_TOTAL_WIDTH = 88.11;

  const getExportDateLabel = () => new Date().toLocaleString("es-AR");

  const getExportFooterLabel = () =>
    `Documento interno de gestion - LMS FUDENSA | ${new Date().toLocaleDateString("es-AR")}`;

  const getExportFileTimestamp = () => {
    const date = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  const sanitizeFilePart = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "reporte";

  const downloadWorkbook = async (workbook: ExcelJS.Workbook, fileName: string) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([
      buffer,
    ], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const createStyledWorkbook = (title: string, subject: string) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LMS FUDENSA";
    workbook.lastModifiedBy = "LMS FUDENSA";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.title = title;
    workbook.subject = subject;
    return workbook;
  };

  const svgToPngDataUrl = async (svgText: string, width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo crear contexto canvas para el logo");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    try {
      // Canvg renderiza SVG complejos de forma mas confiable que drawImage nativo.
      const { Canvg } = await import("canvg");
      const canvg = await Canvg.from(ctx, svgText, {
        ignoreAnimation: true,
        ignoreMouse: true,
        ignoreDimensions: true,
      });
      await canvg.render();
      return canvas.toDataURL("image/png");
    } catch {
      // Fallback para entornos donde falle Canvg.
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("No se pudo cargar el SVG del logo"));
          img.src = svgUrl;
        });
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        return canvas.toDataURL("image/png");
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    }
  };

  const dataUrlToArrayBuffer = (dataUrl: string) => {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }
    return bytes.buffer;
  };

  const autoFitColumnWidths = (
    headers: string[],
    dataRows?: Array<Array<string | number>>,
    minWidth = 8,
    maxWidth = 50,
  ) => {
    const widths = headers.map((header) => {
      let calculatedWidth = header.length;

      if (dataRows && dataRows.length > 0) {
        const col = headers.indexOf(header);
        const maxContentLength = Math.max(
          ...dataRows.map((row) => {
            const cell = row[col];
            const str = String(cell || "");
            return str.length;
          }),
        );
        calculatedWidth = Math.max(calculatedWidth, maxContentLength);
      }

      const widthWithPadding = calculatedWidth + 2;
      return Math.max(minWidth, Math.min(widthWithPadding, maxWidth));
    });

    return widths;
  };

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo convertir el blob a base64"));
      reader.readAsDataURL(blob);
    });

  const getImageExtensionFromDataUrl = (dataUrl: string): "png" | "jpeg" | null => {
    const match = dataUrl.match(/^data:image\/(png|jpe?g);base64,/i);
    if (!match) {
      return null;
    }
    return match[1].toLowerCase().startsWith("jp") ? "jpeg" : "png";
  };

  const prepareWorkbookBrandAssets = async (workbook: ExcelJS.Workbook): Promise<WorkbookBrandAssets> => {
    const createBrandFallbackPng = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo crear fallback de marca");
      }

      ctx.fillStyle = "#1E467C";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#55A5C7";
      ctx.fillRect(0, 0, 24, canvas.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px Calibri";
      ctx.fillText("FUDENSA", 42, 62);
      ctx.font = "bold 16px Calibri";
      ctx.fillText("LMS", 44, 90);

      return canvas.toDataURL("image/png");
    };

    const loadLogoAsPngData = async (logoUrl: string) => {
      const response = await fetch(logoUrl);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el logo SVG: ${response.status}`);
      }
      const logoSource = await response.text();
      return svgToPngDataUrl(logoSource, 420, 120);
    };

    const loadRasterLogoAsDataUrl = async (logoUrl: string) => {
      const response = await fetch(logoUrl);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el logo raster: ${response.status}`);
      }
      const logoBlob = await response.blob();
      const imgUrl = URL.createObjectURL(logoBlob);

      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("No se pudo cargar el logo PNG"));
          img.src = imgUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 420;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("No se pudo crear contexto canvas para logo raster");
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/png");
      } finally {
        URL.revokeObjectURL(imgUrl);
      }
    };

    try {
      let logoDataUrl: string;
      let logoExtension: "png" | "jpeg" = "png";

      try {
        logoDataUrl = await loadRasterLogoAsDataUrl(logoHorizontalPng);
        logoExtension = getImageExtensionFromDataUrl(logoDataUrl) || "png";
      } catch {
        try {
          logoDataUrl = await loadLogoAsPngData(logoHorizontal);
          logoExtension = "png";
        } catch {
          try {
            logoDataUrl = await loadLogoAsPngData(logoIco);
            logoExtension = "png";
          } catch {
            logoDataUrl = createBrandFallbackPng();
            logoExtension = "png";
          }
        }
      }

      let logoImageId: number | undefined;
      const normalizedExtension = getImageExtensionFromDataUrl(logoDataUrl);
      if (!normalizedExtension) {
        throw new Error("La conversion del logo no devolvio base64 valido");
      }
      logoExtension = normalizedExtension;

      const logoBuffer = dataUrlToArrayBuffer(logoDataUrl);
      try {
        logoImageId = workbook.addImage({
          base64: logoDataUrl,
          extension: logoExtension,
        });
      } catch {
        logoImageId = workbook.addImage({
          buffer: logoBuffer,
          extension: logoExtension,
        });
      }

      if (!logoImageId) {
        throw new Error("ExcelJS no pudo registrar la imagen del logo");
      }

      return { logoImageId };
    } catch (error) {
      console.warn("No se pudo adjuntar el logo al Excel:", error);
      return {};
    }
  };

  const insertBrandLogo = (
    worksheet: ExcelJS.Worksheet,
    assets: WorkbookBrandAssets,
    options: { col: number; row: number; width: number; height: number; range?: string },
  ) => {
    if (!assets.logoImageId) {
      return;
    }

    if (options.range) {
      worksheet.addImage(assets.logoImageId, options.range);
      return;
    }

    worksheet.addImage(assets.logoImageId, {
      tl: { col: options.col, row: options.row },
      ext: { width: options.width, height: options.height },
      editAs: "oneCell",
    });
  };

  const appendBrandFooter = (
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    totalColumns: number,
    note?: string,
  ) => {
    if (totalColumns <= 0) {
      return;
    }

    worksheet.mergeCells(rowNumber, 1, rowNumber, totalColumns);
    const footerCell = worksheet.getCell(rowNumber, 1);
    footerCell.value = note || getExportFooterLabel();
    footerCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: EXCEL_BRAND.white } };
    footerCell.alignment = { vertical: "middle", horizontal: "center" };
    footerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
    footerCell.border = {
      top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
    };
    worksheet.getRow(rowNumber).height = 20;
  };

  const createCoverSheet = (
    workbook: ExcelJS.Workbook,
    assets: WorkbookBrandAssets,
    reportTitle: string,
    reportSubtitle: string,
    kpis: ExportKpi[],
    generatedAt: string,
  ) => {
    const worksheet = workbook.addWorksheet("Portada", {
      properties: { defaultRowHeight: 24 },
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.2, footer: 0.2 },
      },
      views: [{ showGridLines: false }],
    });

    worksheet.properties.tabColor = { argb: EXCEL_BRAND.primary };
    const coverWidths = [22, 22, 22, 22];
    worksheet.columns = coverWidths.map((width) => ({ width }));

    worksheet.mergeCells("A1:D2");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = reportTitle;
    titleCell.font = { name: "Calibri", size: 24, bold: true, color: { argb: EXCEL_BRAND.white } };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };

    worksheet.mergeCells("A3:D3");
    const subtitleCell = worksheet.getCell("A3");
    subtitleCell.value = reportSubtitle;
    subtitleCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: EXCEL_BRAND.textDark } };
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
    subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.light } };

    insertBrandLogo(worksheet, assets, { col: 2.6, row: 0.05, width: 250, height: 70, range: "C1:D3" });

    worksheet.mergeCells("A5:D5");
    const kpiTitle = worksheet.getCell("A5");
    kpiTitle.value = "Indicadores Clave";
    kpiTitle.font = { name: "Calibri", size: 14, bold: true, color: { argb: EXCEL_BRAND.primary } };
    kpiTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.light } };

    const toneMap: Record<ExportKpiTone, { bg: string; text: string }> = {
      primary: { bg: EXCEL_BRAND.primary, text: EXCEL_BRAND.white },
      secondary: { bg: EXCEL_BRAND.secondary, text: EXCEL_BRAND.white },
      success: { bg: "FF16A34A", text: EXCEL_BRAND.white },
      warning: { bg: "FFD97706", text: EXCEL_BRAND.white },
    };

    kpis.slice(0, 4).forEach((kpi, idx) => {
      const startCol = idx % 2 === 0 ? 1 : 3;
      const endCol = startCol + 1;
      const rowStart = 6 + Math.floor(idx / 2) * 3;
      const rowEnd = rowStart + 1;
      const tone = toneMap[kpi.tone];

      worksheet.mergeCells(rowStart, startCol, rowEnd, endCol);
      const kpiCell = worksheet.getCell(rowStart, startCol);
      kpiCell.value = `${kpi.label}\n${kpi.value}`;
      kpiCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: tone.text } };
      kpiCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      kpiCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: tone.bg } };
      kpiCell.border = {
        top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      };
    });

    worksheet.mergeCells("A13:D13");
    const generatedCell = worksheet.getCell("A13");
    generatedCell.value = `Generado: ${generatedAt}`;
    generatedCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: EXCEL_BRAND.textMuted } };

    worksheet.mergeCells("A15:D15");
    const noteCell = worksheet.getCell("A15");
    noteCell.value = "Documento interno de gestion - LMS FUDENSA";
    noteCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: EXCEL_BRAND.white } };
    noteCell.alignment = { vertical: "middle", horizontal: "center" };
    noteCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
  };

  const createSummarySheet = (
    workbook: ExcelJS.Workbook,
    assets: WorkbookBrandAssets,
    reportTitle: string,
    reportSubtitle: string,
    sections: ExportSummarySection[],
    kpis: ExportKpi[],
    generatedAt: string,
  ) => {
    const kpiToneMap: Record<ExportKpiTone, { bg: string; text: string }> = {
      primary: { bg: EXCEL_BRAND.primary, text: EXCEL_BRAND.white },
      secondary: { bg: EXCEL_BRAND.secondary, text: EXCEL_BRAND.white },
      success: { bg: "FF16A34A", text: EXCEL_BRAND.white },
      warning: { bg: "FFD97706", text: EXCEL_BRAND.white },
    };

    const worksheet = workbook.addWorksheet("Resumen", {
      properties: { defaultRowHeight: 20 },
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 2,
        margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      },
      headerFooter: {
        firstHeader: "&L&BLMS FUDENSA&RResumen Ejecutivo",
        firstFooter: "&LExportado desde Admin Dashboard&RPagina &P de &N",
      },
      views: [{ state: "frozen", ySplit: 6, showGridLines: false }],
    });

    const summaryWidths = [22, 28, 22, 28];
    worksheet.columns = summaryWidths.map((width) => ({ width }));

    worksheet.properties.tabColor = { argb: EXCEL_BRAND.primary };

    insertBrandLogo(worksheet, assets, { col: 2.55, row: 0.1, width: 220, height: 58, range: "C1:D3" });

    worksheet.mergeCells("A1:D1");
    worksheet.getCell("A1").value = reportTitle;
    worksheet.getCell("A1").font = { name: "Calibri", size: 16, bold: true, color: { argb: EXCEL_BRAND.white } };
    worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
    worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell("A1").border = {
      top: { style: "thin", color: { argb: EXCEL_BRAND.primary } },
      left: { style: "thin", color: { argb: EXCEL_BRAND.primary } },
      bottom: { style: "thin", color: { argb: EXCEL_BRAND.primary } },
      right: { style: "thin", color: { argb: EXCEL_BRAND.primary } },
    };

    worksheet.mergeCells("A2:D2");
    worksheet.getCell("A2").value = reportSubtitle;
    worksheet.getCell("A2").font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.textDark } };
    worksheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.light } };
    worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 24;

    let currentRow = 4;
    kpis.forEach((kpi, index) => {
      const leftColumn = index % 2 === 0 ? 1 : 3;
      const rightColumn = leftColumn + 1;
      const rowBase = 4 + Math.floor(index / 2) * 3;
      const palette = kpiToneMap[kpi.tone];

      worksheet.mergeCells(rowBase, leftColumn, rowBase + 1, rightColumn);
      const kpiCell = worksheet.getCell(rowBase, leftColumn);
      kpiCell.value = `${kpi.label}\n${kpi.value}`;
      kpiCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: palette.text } };
      kpiCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.bg } };
      kpiCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      kpiCell.border = {
        top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      };

      worksheet.getRow(rowBase).height = 22;
      worksheet.getRow(rowBase + 1).height = 22;
      currentRow = Math.max(currentRow, rowBase + 3);
    });

    sections.forEach((section) => {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const sectionCell = worksheet.getCell(`A${currentRow}`);
      sectionCell.value = section.title;
      sectionCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: EXCEL_BRAND.primary } };
      sectionCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.light } };
      sectionCell.border = {
        top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      };
      currentRow += 1;

      section.rows.forEach(([label, value], index) => {
        const isZebra = index % 2 === 1;
        worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
        worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
        const labelCell = worksheet.getCell(`A${currentRow}`);
        const valueCell = worksheet.getCell(`C${currentRow}`);
        labelCell.value = label;
        valueCell.value = value;

        labelCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.textDark } };
        valueCell.font = { name: "Calibri", size: 11, color: { argb: EXCEL_BRAND.textDark } };
        valueCell.alignment = { vertical: "middle", horizontal: typeof value === "number" ? "right" : "left" };

        const fill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: isZebra ? EXCEL_BRAND.zebra : EXCEL_BRAND.white } };
        labelCell.fill = fill;
        valueCell.fill = fill;

        const border = {
          top: { style: "thin" as const, color: { argb: EXCEL_BRAND.border } },
          left: { style: "thin" as const, color: { argb: EXCEL_BRAND.border } },
          bottom: { style: "thin" as const, color: { argb: EXCEL_BRAND.border } },
          right: { style: "thin" as const, color: { argb: EXCEL_BRAND.border } },
        };
        labelCell.border = border;
        valueCell.border = border;

        currentRow += 1;
      });

      currentRow += 1;
    });

    appendBrandFooter(
      worksheet,
      currentRow,
      4,
      `Documento interno de gestion - LMS FUDENSA | Generado: ${generatedAt}`,
    );
  };

  const createDetailSheet = (
    workbook: ExcelJS.Workbook,
    assets: WorkbookBrandAssets,
    reportTitle: string,
    reportSubtitle: string,
    headers: string[],
    dataRows: Array<Array<string | number>>,
    columns: number[],
    generatedAt: string,
    amountColumnIndex?: number,
    statusColumnIndex?: number,
  ) => {
    const worksheet = workbook.addWorksheet("Detalle de Pagos", {
      properties: { defaultRowHeight: 20 },
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 3,
        margins: { left: 0.35, right: 0.35, top: 0.55, bottom: 0.55, header: 0.25, footer: 0.25 },
      },
      headerFooter: {
        firstHeader: "&L&BLMS FUDENSA&RDetalle Operativo",
        firstFooter: "&LReporte de pagos&RPagina &P de &N",
      },
      views: [{ state: "frozen", ySplit: 4, showGridLines: false }],
    });

    worksheet.properties.tabColor = { argb: EXCEL_BRAND.secondary };

    const finalWidths = autoFitColumnWidths(headers, dataRows, 8, 50);
    const adaptedColumns = columns.map((_, idx) => finalWidths[idx] || columns[idx]);
    worksheet.columns = adaptedColumns.map((width) => ({ width }));

    insertBrandLogo(worksheet, assets, {
      col: Math.max(0, headers.length - 3),
      row: 0.1,
      width: 200,
      height: 52,
    });

    worksheet.mergeCells(1, 1, 1, headers.length);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = reportTitle;
    titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: EXCEL_BRAND.white } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };

    worksheet.mergeCells(2, 1, 2, headers.length);
    const subtitleCell = worksheet.getCell(2, 1);
    subtitleCell.value = reportSubtitle;
    subtitleCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.textDark } };
    subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.light } };
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 24;

    const headerRow = worksheet.getRow(4);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.white } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.secondary } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
      };
    });
    headerRow.height = 22;

    dataRows.forEach((rowData, rowIndex) => {
      const rowNumber = rowIndex + 5;
      const row = worksheet.getRow(rowNumber);
      rowData.forEach((value, cellIndex) => {
        const cell = row.getCell(cellIndex + 1);
        cell.value = value;
        cell.font = { name: "Calibri", size: 10.5, color: { argb: EXCEL_BRAND.textDark } };
        cell.alignment = {
          vertical: "middle",
          horizontal: typeof value === "number" ? "right" : "left",
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowIndex % 2 === 1 ? EXCEL_BRAND.zebra : EXCEL_BRAND.white },
        };
        cell.border = {
          top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        };
      });

      if (typeof amountColumnIndex === "number") {
        const amountCell = row.getCell(amountColumnIndex + 1);
        amountCell.numFmt = '"$" #,##0.00';
      }

      if (typeof statusColumnIndex === "number") {
        const statusCell = row.getCell(statusColumnIndex + 1);
        const statusText = String(statusCell.value || "").toLowerCase();
        if (statusText.includes("aprobado")) {
          statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.statusSuccess } };
          statusCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF166534" } };
        } else if (statusText.includes("pendiente") || statusText.includes("manual")) {
          statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.statusWarning } };
          statusCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF92400E" } };
        } else {
          statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.statusDanger } };
          statusCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF991B1B" } };
        }
      }
    });

    if (typeof amountColumnIndex === "number" && dataRows.length > 0) {
      const totalRowNumber = dataRows.length + 6;
      const totalStartCol = 1;
      const totalEndCol = Math.max(1, amountColumnIndex);

      worksheet.mergeCells(totalRowNumber, totalStartCol, totalRowNumber, totalEndCol);
      const totalLabelCell = worksheet.getCell(totalRowNumber, totalStartCol);
      totalLabelCell.value = "TOTAL";
      totalLabelCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.white } };
      totalLabelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
      totalLabelCell.alignment = { vertical: "middle", horizontal: "right" };

      const amountColLetter = worksheet.getColumn(amountColumnIndex + 1).letter;
      const totalAmountCell = worksheet.getCell(totalRowNumber, amountColumnIndex + 1);
      totalAmountCell.value = {
        formula: `SUM(${amountColLetter}5:${amountColLetter}${dataRows.length + 4})`,
      };
      totalAmountCell.numFmt = '"$" #,##0.00';
      totalAmountCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: EXCEL_BRAND.white } };
      totalAmountCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_BRAND.primary } };
      totalAmountCell.alignment = { vertical: "middle", horizontal: "right" };

      for (let columnIndex = 1; columnIndex <= headers.length; columnIndex += 1) {
        const totalCell = worksheet.getCell(totalRowNumber, columnIndex);
        totalCell.border = {
          top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
          right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
        };
      }
    }

    const detailFooterRow =
      typeof amountColumnIndex === "number" && dataRows.length > 0
        ? dataRows.length + 8
        : dataRows.length + 6;

    appendBrandFooter(
      worksheet,
      detailFooterRow,
      headers.length,
      `Documento interno de gestion - LMS FUDENSA | Exportado: ${generatedAt}`,
    );

    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: headers.length },
    };
  };

  // Exportar datos del curso a Excel
  const handleExportCourseData = async (course: typeof courseList[0]) => {
    try {
      const courseId = course.id;
      const enrolledCount = enrollmentCounts[courseId] || 0;
      const salesCount = salesByCourse[courseId] || 0;
      const totalRevenue = salesCount * (course.price || 0);

      // Obtener pagos relacionados con este curso
      const coursePayments = allPayments.filter(p => p.course_id === courseId);
      const pendingPayments = coursePayments.filter(p => p.status === "pending");
      const rejectedPayments = coursePayments.filter(p => p.status === "rejected" || p.status === "cancelled");

      const exportDate = getExportDateLabel();
      const workbook = createStyledWorkbook(`Reporte curso ${course.title}`, "Analitica de curso");
      const assets = await prepareWorkbookBrandAssets(workbook);
      const courseKpis: ExportKpi[] = [
        { label: "Total inscriptos", value: enrolledCount, tone: "primary" },
        { label: "Ventas", value: salesCount, tone: "secondary" },
        { label: "Pendientes", value: pendingPayments.length, tone: "warning" },
        { label: "Ingresos", value: `$${totalRevenue.toLocaleString("es-AR")}`, tone: "success" },
      ];

      createCoverSheet(
        workbook,
        assets,
        `Reporte de curso: ${course.title}`,
        "Analitica comercial y operativa",
        courseKpis,
        exportDate,
      );

      // Hoja 1: Resumen del curso
      createSummarySheet(
        workbook,
        assets,
        `Reporte de curso: ${course.title}`,
        `LMS FUDENSA | Generado el ${exportDate}`,
        [
          {
            title: "Informacion general",
            rows: [
              ["Titulo", course.title],
              ["Categoria", course.category || "Sin categoria"],
              ["Nivel", course.level || "No especificado"],
              ["Duracion", course.duration || "No especificada"],
              ["Precio", course.price ? `$${course.price.toLocaleString("es-AR")}` : "Gratis"],
              ["Certificado", course.certified ? "Si" : "No"],
            ],
          },
          {
            title: "Metricas de inscripcion y pagos",
            rows: [
              ["Total de inscriptos", enrolledCount],
              ["Ventas completadas", salesCount],
              ["Pagos pendientes", pendingPayments.length],
              ["Pagos rechazados/cancelados", rejectedPayments.length],
            ],
          },
          {
            title: "Resumen financiero",
            rows: [
              ["Ingresos totales", `$${totalRevenue.toLocaleString("es-AR")}`],
              [
                "Ingreso promedio por venta",
                salesCount > 0
                  ? `$${(totalRevenue / salesCount).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`
                  : "$0",
              ],
            ],
          },
          {
            title: "Trazabilidad del reporte",
            rows: [["Fecha de exportacion", exportDate]],
          },
        ],
        courseKpis,
        exportDate,
      );

      // Hoja 2: Detalle de pagos
      if (coursePayments.length > 0) {
        const paymentsHeader = ["N", "Usuario", "Email", "Estado", "Monto (ARS)", "Fecha", "ID de pago"];
        const paymentsRows = coursePayments.map((p, idx) => [
          idx + 1,
          p.displayName || "Desconocido",
          p.displayEmail || "-",
          p.status === "approved" || p.status === "completed"
            ? "Aprobado"
            : p.status === "pending"
              ? "Pendiente"
              : "Rechazado/Cancelado",
          Number(p.amount || 0),
          p.created_at ? new Date(p.created_at).toLocaleDateString("es-AR") : "-",
          p.id || "-",
        ]);

        createDetailSheet(
          workbook,
          assets,
          `Detalle de pagos - ${course.title}`,
          `LMS FUDENSA | Registros: ${coursePayments.length} | Exportado: ${exportDate}`,
          paymentsHeader,
          paymentsRows,
          [6, 26, 34, 20, 16, 14, 36],
          exportDate,
          4,
          3,
        );
      }

      // Descargar archivo
      const fileName = `reporte_curso_${sanitizeFilePart(course.slug || course.id)}_${getExportFileTimestamp()}.xlsx`;
      await downloadWorkbook(workbook, fileName);

      toast.success(`Datos exportados: ${fileName}`);
    } catch (error) {
      console.error("Error exportando datos del curso:", error);
      toast.error("No se pudo exportar el archivo Excel del curso");
    }
  };

  // Exportar todos los pagos a Excel
  const handleExportAllPayments = async () => {
    if (filteredPayments.length === 0) {
      toast.error("No hay pagos para exportar");
      return;
    }

    try {
      // Calcular totales
      const totalApproved = filteredPayments.filter(p => p.status === "approved" || p.status === "completed");
      const totalPending = filteredPayments.filter(p => p.status === "pending" || p.status === "legacy");
      const totalRejected = filteredPayments.filter(p => p.status === "rejected" || p.status === "cancelled");
      const totalRevenue = totalApproved.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingRevenue = totalPending.reduce((sum, p) => sum + (p.amount || 0), 0);

      const exportDate = getExportDateLabel();
      const workbook = createStyledWorkbook("Reporte general de pagos", "Analitica financiera");
      const assets = await prepareWorkbookBrandAssets(workbook);
      const paymentsKpis: ExportKpi[] = [
        { label: "Total pagos", value: filteredPayments.length, tone: "primary" },
        { label: "Aprobados", value: totalApproved.length, tone: "success" },
        { label: "Pendientes", value: totalPending.length, tone: "warning" },
        { label: "Ingresos aprobados", value: `$${totalRevenue.toLocaleString("es-AR")}`, tone: "secondary" },
      ];

      createCoverSheet(
        workbook,
        assets,
        "Reporte general de pagos",
        "Consolidado financiero y estado de cobranza",
        paymentsKpis,
        exportDate,
      );

      // Hoja 1: Resumen
      createSummarySheet(
        workbook,
        assets,
        "Reporte general de pagos",
        `LMS FUDENSA | Generado el ${exportDate}`,
        [
          {
            title: "Resumen operativo",
            rows: [
              ["Total de pagos", filteredPayments.length],
              ["Pagos aprobados", totalApproved.length],
              ["Pagos pendientes", totalPending.length],
              ["Pagos rechazados/cancelados", totalRejected.length],
            ],
          },
          {
            title: "Resumen financiero",
            rows: [
              ["Ingresos aprobados", `$${totalRevenue.toLocaleString("es-AR")}`],
              ["Ingresos pendientes", `$${pendingRevenue.toLocaleString("es-AR")}`],
            ],
          },
          {
            title: "Trazabilidad del reporte",
            rows: [["Fecha de exportacion", exportDate]],
          },
        ],
        paymentsKpis,
        exportDate,
      );

      // Hoja 2: Detalle de todos los pagos
      const paymentsHeader = ["N", "Estado", "Fecha", "Usuario", "Email", "Curso", "Monto (ARS)", "Moneda", "ID de pago"];
      const paymentsRows = filteredPayments.map((p, idx) => [
        idx + 1,
        p.status === "approved" || p.status === "completed" ? "Aprobado" :
          p.status === "pending" ? "Pendiente" :
          p.status === "legacy" ? "Manual" : "Rechazado/Cancelado",
        p.created_at ? new Date(p.created_at).toLocaleDateString("es-AR") : "-",
        p.displayName || "Desconocido",
        p.displayEmail || "-",
        p.courseTitle || "-",
        Number(p.amount || 0),
        p.currency || "ARS",
        p.id || "-",
      ]);

      createDetailSheet(
        workbook,
        assets,
        "Detalle de pagos",
        `LMS FUDENSA | Registros: ${filteredPayments.length} | Exportado: ${exportDate}`,
        paymentsHeader,
        paymentsRows,
        [6, 18, 14, 25, 34, 34, 16, 10, 36],
        exportDate,
        6,
        1,
      );

      // Descargar archivo
      const fileName = `reporte_pagos_${getExportFileTimestamp()}.xlsx`;
      await downloadWorkbook(workbook, fileName);

      toast.success(`${filteredPayments.length} pagos exportados: ${fileName}`);
    } catch (error) {
      console.error("Error exportando pagos:", error);
      toast.error("No se pudo exportar el reporte de pagos");
    }
  };

  const handleExportAllCertificates = async () => {
    if (filteredCertificates.length === 0) {
      toast.error("No hay certificados para exportar");
      return;
    }

    try {
      const exportDate = getExportDateLabel();
      const workbook = createStyledWorkbook("Reporte de Certificados", "Registro de certificaciones emitidas");
      const assets = await prepareWorkbookBrandAssets(workbook);
      const certificatesKpis: ExportKpi[] = [
        { label: "Total certificados", value: filteredCertificates.length, tone: "primary" },
      ];

      createCoverSheet(
        workbook,
        assets,
        "Reporte de Certificados",
        "Registro de certificaciones emitidas",
        certificatesKpis,
        exportDate,
      );

      // Hoja 1: Resumen
      createSummarySheet(
        workbook,
        assets,
        "Reporte de Certificados",
        `LMS FUDENSA | Generado el ${exportDate}`,
        [
          {
            title: "Resumen de certificados",
            rows: [
              ["Total certificados", filteredCertificates.length],
            ],
          },
          {
            title: "Trazabilidad del reporte",
            rows: [["Fecha de exportacion", exportDate]],
          },
        ],
        certificatesKpis,
        exportDate,
      );

      // Hoja 2: Detalle de todos los certificados
      const certificatesHeader = ["N", "Fecha de Emisión", "Estudiante", "Curso", "Hash"];
      const certificatesRows = filteredCertificates.map((c, idx) => [
        idx + 1,
        c.issue_date ? new Date(c.issue_date).toLocaleDateString("es-AR") : "-",
        c.student_name || "Desconocido",
        c.course_title || "-",
        c.hash?.substring(0, 16).toUpperCase() || "-",
      ]);

      createDetailSheet(
        workbook,
        assets,
        "Detalle de certificados",
        `LMS FUDENSA | Registros: ${filteredCertificates.length} | Exportado: ${exportDate}`,
        certificatesHeader,
        certificatesRows,
        [8, 18, 25, 30, 20],
        exportDate,
        5,
        1,
      );

      // Descargar archivo
      const fileName = `reporte_certificados_${getExportFileTimestamp()}.xlsx`;
      await downloadWorkbook(workbook, fileName);

      toast.success(`${filteredCertificates.length} certificados exportados: ${fileName}`);
    } catch (error) {
      console.error("Error exportando certificados:", error);
      toast.error("No se pudo exportar el reporte de certificados");
    }
  };

  const handleExportAllUsers = async () => {
    if (filteredUsers.length === 0) {
      toast.error("No hay usuarios para exportar");
      return;
    }

    try {
      const exportDate = getExportDateLabel();
      const workbook = createStyledWorkbook("Reporte de Usuarios", "Registro de usuarios del sistema");
      const assets = await prepareWorkbookBrandAssets(workbook);
      const usersKpis: ExportKpi[] = [
        { label: "Total usuarios", value: filteredUsers.length, tone: "primary" },
        { label: "Activos", value: filteredUsers.filter(u => u.is_active !== false).length, tone: "success" },
        { label: "Inactivos", value: filteredUsers.filter(u => u.is_active === false).length, tone: "warning" },
      ];

      createCoverSheet(
        workbook,
        assets,
        "Reporte de Usuarios",
        "Registro de usuarios del sistema",
        usersKpis,
        exportDate,
      );

      // Hoja 1: Resumen
      const administratorCount = filteredUsers.filter(u => u.role === 'admin').length;
      const instructorCount = filteredUsers.filter(u => u.role === 'instructor').length;
      const studentCount = filteredUsers.filter(u => u.role === 'student').length;

      createSummarySheet(
        workbook,
        assets,
        "Reporte de Usuarios",
        `LMS FUDENSA | Generado el ${exportDate}`,
        [
          {
            title: "Resumen de usuarios",
            rows: [
              ["Total usuarios", filteredUsers.length],
              ["Activos", filteredUsers.filter(u => u.is_active !== false).length],
              ["Inactivos", filteredUsers.filter(u => u.is_active === false).length],
            ],
          },
          {
            title: "Usuarios por rol",
            rows: [
              ["Administradores", administratorCount],
              ["Profesores", instructorCount],
              ["Estudiantes", studentCount],
            ],
          },
          {
            title: "Trazabilidad del reporte",
            rows: [["Fecha de exportacion", exportDate]],
          },
        ],
        usersKpis,
        exportDate,
      );

      // Hoja 2: Detalle de todos los usuarios
      const usersHeader = ["N", "Nombre", "Email", "Rol", "Estado", "Registrado"];
      const usersRows = filteredUsers.map((u, idx) => [
        idx + 1,
        u.full_name || "Desconocido",
        u.email || "-",
        u.role === 'admin' ? 'Administrador' : u.role === 'instructor' ? 'Profesor' : 'Estudiante',
        u.is_active !== false ? 'Activo' : 'Inactivo',
        u.created_at ? new Date(u.created_at).toLocaleDateString("es-AR") : "-",
      ]);

      createDetailSheet(
        workbook,
        assets,
        "Detalle de usuarios",
        `LMS FUDENSA | Registros: ${filteredUsers.length} | Exportado: ${exportDate}`,
        usersHeader,
        usersRows,
        [8, 25, 34, 15, 12, 14],
        exportDate,
        6,
        1,
      );

      // Descargar archivo
      const fileName = `reporte_usuarios_${getExportFileTimestamp()}.xlsx`;
      await downloadWorkbook(workbook, fileName);

      toast.success(`${filteredUsers.length} usuarios exportados: ${fileName}`);
    } catch (error) {
      console.error("Error exportando usuarios:", error);
      toast.error("No se pudo exportar el reporte de usuarios");
    }
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
            total_students: teacher.total_students,
            total_courses: teacher.total_courses,
            hourly_rate: teacher.hourly_rate,
            is_active: teacher.is_active,
          })
          .eq("id", teacher.id);
        
        if (error) {
          console.error("Error UPDATE teacher:", error);
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
          total_students: teacher.total_students,
          total_courses: teacher.total_courses,
          hourly_rate: teacher.hourly_rate,
          is_active: teacher.is_active,
        }]);
        
        if (error) {
          console.error("Error INSERT teacher:", error);
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
          console.error("Error DELETE:", error);
          toast.error("Error al eliminar el curso: " + error.message);
          setDeletingCourseId(null); // Reset animation state on error
          return;
        }
        
        toast.success("✅ Curso eliminado exitosamente");
        
        // ✅ Delay de 500ms para mostrar animación de desaparición antes de actualizar UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeletingCourseId(null);
        await refetchCourses();
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
          console.error("Error DELETE payment:", error);
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
      setDeletingCertId(null);
      setDeletingPaymentId(null);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      setCertToDelete(null);
      setPaymentToDelete(null);
    }
  };

  const handleContactUser = (name: string, email: string) => {
    setContactUser({ name, email });
    setContactMessage("");
    setContactDialogOpen(true);
  };

  // Helper: obtener el estado actual del curso (real + optimistic)
  const getCourseActiveState = (courseId: string, realState: boolean): boolean => {
    return optimisticActiveState[courseId] !== undefined ? optimisticActiveState[courseId] : realState;
  };

  // Helper: obtener el estado actual del profesor (real + optimistic)
  const getTeacherActiveState = (teacherId: string, realState: boolean): boolean => {
    return optimisticActiveState[teacherId] !== undefined ? optimisticActiveState[teacherId] : realState;
  };

  // Helper: obtener el estado actual del usuario (real + optimistic)
  const getUserActiveState = (userId: string, realState: boolean): boolean => {
    return optimisticActiveState[userId] !== undefined ? optimisticActiveState[userId] : realState;
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
      
      const teacher = realtimeTeachers.find(t => t.id === teacherId);
      if (teacher && teacher.user_id) {
        // Also update the associate User Profile
        await toggleActiveViaAdmin({ type: 'user', id: teacher.user_id, is_active: newIsActive });
        // Update user state optimistically
        setUsersList((prev) =>
          prev.map((u) => u.id === teacher.user_id ? { ...u, is_active: newIsActive } : u)
        );
      }

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
    // Optimistic update
    setOptimisticActiveState((prev) => ({ ...prev, [userId]: newIsActive }));
    
    try {
      await toggleActiveViaAdmin({ type: 'user', id: userId, is_active: newIsActive });
      
      const user = usersList.find(u => u.id === userId);
      if (user?.role === 'instructor') {
        const teacher = realtimeTeachers.find(t => t.user_id === userId);
        if (teacher) {
          // If deactivated through the user table, also sync the teacher status
          await toggleActiveViaAdmin({ type: 'teacher', id: teacher.id, is_active: newIsActive });
        }
      }

      // Update local state optimistically since users have no realtime subscription 
      setUsersList((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_active: newIsActive } : u)
      );
      toast.success(newIsActive ? "✅ Usuario activado" : "❌ Usuario desactivado");
    } catch (err) {
      console.error("Error toggling user active state:", err);
      // Revert optimistic state on error
      setOptimisticActiveState((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
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

  if (hasAdminAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#64748B]">Solo los administradores pueden acceder al panel de administración.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <CardContent className="bg-white/20 flex-1">
                    <div className="text-4xl">{stats.totalStudents.toLocaleString()}</div>
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
                  <CardContent className="bg-white/20 flex-1">
                    <div className="text-4xl">{stats.activeCourses}</div>
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
                  <CardContent className="bg-white/20 flex-1">
                    <div className="text-4xl">{stats.certificatesIssued.toLocaleString()}</div>
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
                  <CardContent className="bg-white/20 flex-1">
                    <div className="text-4xl">ARS ${(stats.monthlyRevenue).toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Courses */}
          {activeTab === "courses" && !showCourseForm && (
            <div className="space-y-6">
              {/* Barra de búsqueda, filtros y botones - TODO EN UNA FILA */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input 
                    placeholder="Buscar cursos..." 
                    className="pl-10 h-9 text-sm w-full"
                    value={coursesSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoursesSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Nivel:</span>
                  <Select value={courseLevelFilter} onValueChange={setCourseLevelFilter}>
                    <SelectTrigger className="w-[130px] h-9 text-sm">
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
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Ordenar:</span>
                  <Select value={courseSortBy} onValueChange={setCourseSortBy}>
                    <SelectTrigger className="w-[145px] h-9 text-sm">
                      <SelectValue placeholder="Por defecto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Por defecto</SelectItem>
                      <SelectItem value="mostEnrolled">Más inscriptos</SelectItem>
                      <SelectItem value="mostSold">Más vendidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <Checkbox 
                    id="showInactiveCourses" 
                    checked={showInactiveCourses} 
                    onCheckedChange={(c) => setShowInactiveCourses(Boolean(c))} 
                  />
                  <label 
                    htmlFor="showInactiveCourses" 
                    className="text-sm text-[#64748B] cursor-pointer whitespace-nowrap"
                  >
                    Inactivos
                  </label>
                </div>
                {(courseLevelFilter !== "all" || courseSortBy !== "default" || coursesSearch || showInactiveCourses) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      setCourseLevelFilter("all");
                      setCourseSortBy("default");
                      setCoursesSearch("");
                      setShowInactiveCourses(false);
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpiar
                  </Button>
                )}
                <Button onClick={() => setShowCourseForm(true)} className="h-9 text-sm ml-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
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
                          ? "opacity-70 scale-100 grayscale-[50%]"
                          : "opacity-100 scale-100"
                      )}
                    >
                      {!isActive && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none">
                          <Badge className="bg-white text-red-600 text-sm font-bold px-3 py-1 shadow-md border border-red-600">INACTIVO</Badge>
                        </div>
                      )}
                      {isToggling && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-white" />
                          </div>
                        </div>
                      )}
                      <div>
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
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar profesores..."
                    className="pl-10 h-9 text-sm w-full"
                    value={teacherQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeacherQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <Checkbox 
                    id="showInactiveTeachers" 
                    checked={showInactiveTeachers} 
                    onCheckedChange={(c) => setShowInactiveTeachers(Boolean(c))} 
                  />
                  <label 
                    htmlFor="showInactiveTeachers" 
                    className="text-sm text-[#64748B] cursor-pointer whitespace-nowrap"
                  >
                    Inactivos
                  </label>
                </div>
                <Button onClick={() => setShowTeacherForm(true)} className="h-9 text-sm ml-auto">
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
                      <TableHead>Cursos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : realtimeTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No hay profesores registrados aún
                        </TableCell>
                      </TableRow>
                    ) : filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No se encontraron profesores para "{teacherQuery}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTeachers.map((teacher, index) => (
                        <TableRow
                          key={teacher.id}
                          className={cn(
                            "transition-all duration-300 relative",
                            !getTeacherActiveState(teacher.id, teacher.is_active !== false)
                              ? "opacity-40 bg-gray-100 grayscale"
                              : "opacity-100 bg-transparent"
                          )}
                        >
                          {togglingActiveId === teacher.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded z-20">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          )}
                          <TableCell className="text-[#64748B] font-medium">{(teachersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + index + 1}</TableCell>
                          <TableCell className="text-[#0F172A] font-medium">{teacher.full_name}</TableCell>
                          <TableCell className="text-sm">{teacher.email}</TableCell>
                          <TableCell>{teacher.specialization || "-"}</TableCell>
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {!teachersLoading && filteredTeachers.length > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-sm text-[#64748B]">
                      Mostrando {(teachersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + 1}
                      -{Math.min(teachersPage * ADMIN_TABLE_ROWS_PER_PAGE, filteredTeachers.length)} de {filteredTeachers.length} profesores
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTeachersPage((p) => Math.max(1, p - 1))}
                        disabled={teachersPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-[#64748B]">Página {teachersPage} de {totalTeachersPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTeachersPage((p) => Math.min(totalTeachersPages, p + 1))}
                        disabled={teachersPage === totalTeachersPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar por ID, nombre o correo..."
                    className="pl-10 w-full h-9 text-sm"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </div>

                {/* Filtro por Rol */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Rol:</span>
                  <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                    <SelectTrigger className="w-[130px] h-9 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="instructor">Profesor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Rango de Fecha de registro */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Registro:</span>
                  {/* Fecha desde */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[110px] justify-start text-left font-normal text-xs h-9",
                          !usersDateRangeFilter.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {usersDateRangeFilter.from
                          ? usersDateRangeFilter.from.toLocaleDateString("es-AR")
                          : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={usersDateRangeFilter.from}
                        onSelect={(date) => {
                          setUsersDateRangeFilter((prev) => ({ ...prev, from: date }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Separador */}
                  <span className="text-[#64748B] text-xs">-</span>

                  {/* Fecha hasta */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[110px] justify-start text-left font-normal text-xs h-9",
                          !usersDateRangeFilter.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {usersDateRangeFilter.to
                          ? usersDateRangeFilter.to.toLocaleDateString("es-AR")
                          : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={usersDateRangeFilter.to}
                        onSelect={(date) => {
                          setUsersDateRangeFilter((prev) => ({ ...prev, to: date }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Filtro Inactivos */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <Checkbox 
                    id="showInactiveUsers" 
                    checked={showInactiveUsers} 
                    onCheckedChange={(c) => setShowInactiveUsers(Boolean(c))} 
                  />
                  <label 
                    htmlFor="showInactiveUsers" 
                    className="text-sm text-[#64748B] cursor-pointer whitespace-nowrap"
                  >
                    Inactivos
                  </label>
                </div>

                {/* Limpiar filtros + Exportar */}
                <div className="flex items-center gap-2 ml-auto">
                  {(usersSearch || usersRoleFilter !== "all" || usersDateRangeFilter.from || usersDateRangeFilter.to || showInactiveUsers) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs"
                      onClick={() => {
                        setUsersSearch("");
                        setUsersRoleFilter("all");
                        setUsersDateRangeFilter({ from: undefined, to: undefined });
                        setShowInactiveUsers(false);
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Limpiar
                    </Button>
                  )}
                  <Button
                    onClick={handleExportAllUsers}
                    className="h-9 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Exportar
                  </Button>
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
                      paginatedUsers.map((user, index) => (
                        <TableRow key={user.id} className={cn(
                          "transition-all duration-300 relative",
                          !getUserActiveState(user.id as string, (user.is_active as boolean) !== false) && "opacity-40 bg-gray-100 grayscale"
                        )}>
                          {togglingActiveId === (user.id as string) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded z-20">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          )}
                          <TableCell className="text-[#64748B] font-medium">{(usersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + index + 1}</TableCell>
                          <TableCell className="text-[#0F172A] font-medium">{user.full_name || "Sin nombre"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {user.role === 'admin' ? 'Administrador' : user.role === 'instructor' ? 'Profesor' : 'Estudiante'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getUserActiveState(user.id as string, (user.is_active as boolean) !== false) ? (
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
                                    !getUserActiveState(user.id as string, (user.is_active as boolean) !== false)
                                  )}
                                  disabled={togglingActiveId === (user.id as string)}
                                  className={getUserActiveState(user.id as string, (user.is_active as boolean) !== false) ? "text-amber-600" : "text-green-600"}
                                >
                                  {getUserActiveState(user.id as string, (user.is_active as boolean) !== false) ? (
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {!usersLoading && !usersError && filteredUsers.length > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-sm text-[#64748B]">
                      Mostrando {(usersPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + 1}
                      -{Math.min(usersPage * ADMIN_TABLE_ROWS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuarios
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        disabled={usersPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-[#64748B]">Página {usersPage} de {totalUsersPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                        disabled={usersPage === totalUsersPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar pagos..."
                    className="pl-10 h-9 text-sm w-full"
                    value={paymentsSearch}
                    onChange={(e) => setPaymentsSearch(e.target.value)}
                  />
                </div>
                {/* Filtro por Estado */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Estado:</span>
                  <Select value={paymentsStatusFilter} onValueChange={setPaymentsStatusFilter}>
                    <SelectTrigger className="w-[120px] h-9 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="legacy">Manual</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Rango de Monto */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Monto:</span>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={paymentsAmountRangeFilter.from}
                    onChange={(e) => setPaymentsAmountRangeFilter((prev) => ({ ...prev, from: e.target.value }))}
                    className="w-20 h-9 text-xs"
                  />
                  <span className="text-[#64748B] text-xs">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={paymentsAmountRangeFilter.to}
                    onChange={(e) => setPaymentsAmountRangeFilter((prev) => ({ ...prev, to: e.target.value }))}
                    className="w-20 h-9 text-xs"
                  />
                </div>

                {/* Filtro por Rango de Fecha de pago */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Fecha:</span>
                    {/* Fecha desde */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[110px] justify-start text-left font-normal text-xs h-9",
                            !paymentsDateRangeFilter.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {paymentsDateRangeFilter.from
                            ? paymentsDateRangeFilter.from.toLocaleDateString("es-AR")
                            : "Desde"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={paymentsDateRangeFilter.from}
                          onSelect={(date) => {
                            setPaymentsDateRangeFilter((prev) => ({ ...prev, from: date }));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Separador */}
                    <span className="text-[#64748B] text-xs">-</span>

                    {/* Fecha hasta */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[110px] justify-start text-left font-normal text-xs h-9",
                            !paymentsDateRangeFilter.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {paymentsDateRangeFilter.to
                            ? paymentsDateRangeFilter.to.toLocaleDateString("es-AR")
                            : "Hasta"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={paymentsDateRangeFilter.to}
                          onSelect={(date) => {
                            setPaymentsDateRangeFilter((prev) => ({ ...prev, to: date }));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                {(paymentsSearch || paymentsDateRangeFilter.from || paymentsDateRangeFilter.to || paymentsStatusFilter !== "all" || paymentsAmountRangeFilter.from || paymentsAmountRangeFilter.to) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      setPaymentsSearch("");
                      setPaymentsDateRangeFilter({ from: undefined, to: undefined });
                      setPaymentsStatusFilter("all");
                      setPaymentsAmountRangeFilter({ from: "", to: "" });
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpiar
                  </Button>
                )}
                <Button
                  onClick={handleExportAllPayments}
                  className="h-9 text-xs"
                >
                  <Download className="mr-1 h-3 w-3" />
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
                    {!paymentsLoading && !paymentsError && paginatedPayments.map((payment, index) => (
                      <TableRow
                        key={payment.id}
                        className={deletingPaymentId === payment.id ? "opacity-50 transition-opacity" : ""}
                      >
                        <TableCell className="text-[#64748B] font-medium">{(paymentsPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + index + 1}</TableCell>
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
                {!paymentsLoading && !paymentsError && filteredPayments.length > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-sm text-[#64748B]">
                      Mostrando {(paymentsPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + 1}
                      -{Math.min(paymentsPage * ADMIN_TABLE_ROWS_PER_PAGE, filteredPayments.length)} de {filteredPayments.length} pagos
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}
                        disabled={paymentsPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-[#64748B]">Página {paymentsPage} de {totalPaymentsPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentsPage((p) => Math.min(totalPaymentsPages, p + 1))}
                        disabled={paymentsPage === totalPaymentsPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Certificates */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input
                    placeholder="Buscar estudiante..."
                    className="pl-10 h-9 text-sm w-full"
                    value={certificatesSearch}
                    onChange={(e) => setCertificatesSearch(e.target.value)}
                  />
                </div>

                {/* Filtro por Curso */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Curso:</span>
                  <Select value={certificatesCourseFilter} onValueChange={setCertificatesCourseFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {realtimeCourses.map((course) => (
                        <SelectItem key={course.id} value={course.title}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Rango de Fecha de Emisión */}
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3 py-1">
                  <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">Emisión:</span>
                  {/* Fecha desde */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[110px] justify-start text-left font-normal text-xs h-9",
                          !certificatesDateRangeFilter.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {certificatesDateRangeFilter.from
                          ? certificatesDateRangeFilter.from.toLocaleDateString("es-AR")
                          : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={certificatesDateRangeFilter.from}
                        onSelect={(date) => {
                          setCertificatesDateRangeFilter((prev) => ({ ...prev, from: date }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Separador */}
                  <span className="text-[#64748B] text-xs">-</span>

                  {/* Fecha hasta */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[110px] justify-start text-left font-normal text-xs h-9",
                          !certificatesDateRangeFilter.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {certificatesDateRangeFilter.to
                          ? certificatesDateRangeFilter.to.toLocaleDateString("es-AR")
                          : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={certificatesDateRangeFilter.to}
                        onSelect={(date) => {
                          setCertificatesDateRangeFilter((prev) => ({ ...prev, to: date }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Botón Limpiar Filtros + Exportar */}
                <div className="flex items-center gap-2 ml-auto">
                  {(certificatesSearch || certificatesCourseFilter !== "all" || certificatesDateRangeFilter.from || certificatesDateRangeFilter.to) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs"
                      onClick={() => {
                        setCertificatesSearch("");
                        setCertificatesCourseFilter("all");
                        setCertificatesDateRangeFilter({ from: undefined, to: undefined });
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Limpiar
                    </Button>
                  )}
                  <Button
                    onClick={handleExportAllCertificates}
                    className="h-9 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Exportar
                  </Button>
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
                      paginatedCertificates.map((cert, index) => (
                        <TableRow key={cert.id} className={cn(
                          deletingCertId === cert.id && "opacity-50 transition-opacity duration-500"
                        )}>
                          <TableCell className="text-[#64748B] font-medium">{(certificatesPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + index + 1}</TableCell>
                          <TableCell>{new Date(cert.issue_date).toLocaleDateString("es-AR")}</TableCell>
                          <TableCell className="text-[#0F172A]">{cert.student_name}</TableCell>
                          <TableCell>{cert.course_title}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {cert.hash.substring(0, 16)}...
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
                                  onClick={() => {
                                    if (cert.pdf_url) {
                                      window.open(cert.pdf_url, '_blank');
                                    } else {
                                      handleGeneratePDF(cert);
                                    }
                                  }}
                                >
                                  {generatingPdfId === cert.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Generando PDF...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-4 w-4" />
                                      Descargar PDF
                                    </>
                                  )}
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
                {!certificatesLoading && !certificatesError && filteredCertificates.length > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-sm text-[#64748B]">
                      Mostrando {(certificatesPage - 1) * ADMIN_TABLE_ROWS_PER_PAGE + 1}
                      -{Math.min(certificatesPage * ADMIN_TABLE_ROWS_PER_PAGE, filteredCertificates.length)} de {filteredCertificates.length} certificados
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCertificatesPage((p) => Math.max(1, p - 1))}
                        disabled={certificatesPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-[#64748B]">Página {certificatesPage} de {totalCertificatesPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCertificatesPage((p) => Math.min(totalCertificatesPages, p + 1))}
                        disabled={certificatesPage === totalCertificatesPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
              {courseToDelete && "QUIERES ELIMINAR ESTE CURSO? (NO PODRAS RECUPERARLO SI LO ELIMINAS)"}
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

      {/* Hidden Certificate Template for PDF Generation */}
      {selectedCertData && (
        <div className="fixed -left-[10000px] top-0 pointer-events-none">
          <CertificateTemplate ref={certificateRef} data={selectedCertData} />
        </div>
      )}
    </div>
  );
}

async function generateHash() {
  const data = `${Date.now()}-${Math.random()}-${crypto.randomUUID()}`;
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
