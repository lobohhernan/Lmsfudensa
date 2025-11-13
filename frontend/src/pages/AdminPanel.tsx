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
  XCircle,
  Menu,
  GraduationCap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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
import { InstructorForm } from "../components/InstructorForm";
import { courses, saveCourses, instructors, saveInstructors, type FullCourse, type Instructor } from "../lib/data";
import { toast } from "sonner@2.0.3";
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

const coursesData = [
  {
    id: 1,
    title: "RCP Adultos AHA 2020",
    category: "RCP",
    level: "Básico",
    students: 12450,
    status: "Publicado",
  },
  {
    id: 2,
    title: "RCP Neonatal",
    category: "RCP",
    level: "Avanzado",
    students: 8320,
    status: "Publicado",
  },
  {
    id: 3,
    title: "Primeros Auxilios Básicos",
    category: "Primeros Auxilios",
    level: "Básico",
    students: 15680,
    status: "Publicado",
  },
  {
    id: 4,
    title: "Emergencias Médicas",
    category: "Emergencias",
    level: "Intermedio",
    students: 0,
    status: "Borrador",
  },
];

const usersData = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    country: "Argentina",
    courses: 3,
    certificates: 2,
    joined: "15/10/2025",
  },
  {
    id: 2,
    name: "María González",
    email: "maria.g@email.com",
    country: "Uruguay",
    courses: 5,
    certificates: 4,
    joined: "10/10/2025",
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    email: "carlos.r@email.com",
    country: "México",
    courses: 2,
    certificates: 1,
    joined: "05/10/2025",
  },
];

const paymentsData = [
  {
    id: "PAY-001",
    user: "Juan Pérez",
    email: "juan.perez@email.com",
    course: "RCP Adultos AHA 2020",
    amount: "ARS 29.900",
    status: "Pagado",
    gateway: "Mercado Pago",
    date: "28/10/2025",
  },
  {
    id: "PAY-002",
    user: "María González",
    email: "maria.g@email.com",
    course: "Primeros Auxilios",
    amount: "ARS 24.900",
    status: "Pagado",
    gateway: "Mercado Pago",
    date: "27/10/2025",
  },
  {
    id: "PAY-003",
    user: "Carlos Rodríguez",
    email: "carlos.r@email.com",
    course: "RCP Neonatal",
    amount: "ARS 44.900",
    status: "Pendiente",
    gateway: "Mercado Pago",
    date: "26/10/2025",
  },
  {
    id: "PAY-004",
    user: "Ana López",
    email: "ana.lopez@email.com",
    course: "Emergencias Médicas",
    amount: "ARS 34.900",
    status: "Pagado",
    gateway: "Mercado Pago",
    date: "25/10/2025",
  },
  {
    id: "PAY-005",
    user: "Luis Fernández",
    email: "luis.f@email.com",
    course: "Soporte Vital Cardiovascular",
    amount: "ARS 49.900",
    status: "Rechazado",
    gateway: "Mercado Pago",
    date: "24/10/2025",
  },
];

const certificatesData = [
  {
    id: 1,
    student: "Juan Pérez",
    course: "RCP Adultos AHA 2020",
    issueDate: "15/10/2025",
    hash: "a7f8e9c2b4d6f1a3...",
    status: "Activo",
  },
  {
    id: 2,
    student: "María González",
    course: "Primeros Auxilios",
    issueDate: "10/10/2025",
    hash: "b8g9f0d3e5g2i4k6...",
    status: "Activo",
  },
];

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "instructors" | "users" | "payments" | "certificates">("dashboard");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FullCourse | undefined>();
  const [courseList, setCourseList] = useState<FullCourse[]>([]);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | undefined>();
  const [instructorList, setInstructorList] = useState<Instructor[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactUser, setContactUser] = useState<{ name: string; email: string } | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load courses and instructors from localStorage or use defaults
    setCourseList(courses);
    setInstructorList(instructors);
  }, []);

  const handleSaveCourse = (course: FullCourse) => {
    let updated: FullCourse[];
    if (editingCourse) {
      // Update existing course
      updated = courseList.map((c) => (c.id === course.id ? course : c));
    } else {
      // Add new course
      updated = [...courseList, course];
    }
    setCourseList(updated);
    saveCourses(updated);
    setShowCourseForm(false);
    setEditingCourse(undefined);
  };

  const handleEditCourse = (course: FullCourse) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleSaveInstructor = (instructor: Instructor) => {
    let updated: Instructor[];
    if (editingInstructor) {
      // Update existing instructor
      updated = instructorList.map((i) => (i.id === instructor.id ? instructor : i));
    } else {
      // Add new instructor
      updated = [...instructorList, instructor];
    }
    setInstructorList(updated);
    saveInstructors(updated);
    setShowInstructorForm(false);
    setEditingInstructor(undefined);
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setShowInstructorForm(true);
  };

  const handleDeleteInstructor = (instructorId: string) => {
    setInstructorToDelete(instructorId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      const updated = courseList.filter((c) => c.id !== courseToDelete);
      setCourseList(updated);
      saveCourses(updated);
      toast.success("Curso eliminado exitosamente");
    }
    if (instructorToDelete) {
      const updated = instructorList.filter((i) => i.id !== instructorToDelete);
      setInstructorList(updated);
      saveInstructors(updated);
      toast.success("Instructor eliminado exitosamente");
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
    setInstructorToDelete(null);
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
    { id: "instructors", label: "Instructores", icon: GraduationCap },
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
                    <div className="text-4xl">52,340</div>
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
                    <div className="text-4xl">24</div>
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
                    <div className="text-4xl">18,450</div>
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
                    <div className="text-4xl">ARS $1.890.000</div>
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

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Lecciones</TableHead>
                      <TableHead>Evaluación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseList.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="text-[#0F172A]">{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.level}</Badge>
                        </TableCell>
                        <TableCell>{course.students.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {course.lessons?.length || 0} lecciones
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {course.evaluation?.length || 0} preguntas
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
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
                instructors={instructorList}
                onSave={handleSaveCourse}
                onCancel={() => {
                  setShowCourseForm(false);
                  setEditingCourse(undefined);
                }}
              />
            </div>
          )}

          {/* Instructors */}
          {activeTab === "instructors" && !showInstructorForm && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input placeholder="Buscar instructores..." className="pl-10" />
                </div>
                <Button onClick={() => setShowInstructorForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Instructor
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Valoración</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Cursos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructorList.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell className="text-[#0F172A]">{instructor.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{instructor.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{instructor.rating} ⭐</Badge>
                        </TableCell>
                        <TableCell>{instructor.students.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{instructor.courses} cursos</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditInstructor(instructor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteInstructor(instructor.id)}
                                className="text-[#EF4444]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
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

          {/* Instructor Form */}
          {activeTab === "instructors" && showInstructorForm && (
            <div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowInstructorForm(false);
                  setEditingInstructor(undefined);
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>
              <InstructorForm
                instructor={editingInstructor}
                onSave={handleSaveInstructor}
                onCancel={() => {
                  setShowInstructorForm(false);
                  setEditingInstructor(undefined);
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
                      <TableHead>Cursos</TableHead>
                      <TableHead>Certificados</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-[#0F172A]">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.country}</TableCell>
                        <TableCell>{user.courses}</TableCell>
                        <TableCell>{user.certificates}</TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                onNavigate?.("profile");
                                toast.info(`Viendo perfil de ${user.name}`);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast.info(`Editando usuario: ${user.name}`);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast.info(`Certificados de ${user.name}: ${user.certificates}`);
                              }}>
                                <Award className="mr-2 h-4 w-4" />
                                Ver Certificados
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactUser(user.name, user.email)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contactar Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-[#EF4444]"
                                onClick={() => {
                                  toast.error(`Usuario ${user.name} suspendido`);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Suspender
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
                      <TableHead>ID</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[#0F172A]">{payment.user}</span>
                            <span className="text-xs text-[#64748B]">{payment.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell className="font-semibold text-[#0F172A]">{payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#55a5c7] text-[#55a5c7]">
                            {payment.gateway}
                          </Badge>
                        </TableCell>
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
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha de Emisión</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificatesData.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="text-[#0F172A]">{cert.student}</TableCell>
                        <TableCell>{cert.course}</TableCell>
                        <TableCell>{cert.issueDate}</TableCell>
                        <TableCell className="font-mono text-xs">{cert.hash}</TableCell>
                        <TableCell>
                          <Badge className="bg-[#55a5c7] text-white">{cert.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
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
                    ))}
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
              {instructorToDelete && "Esta acción no se puede deshacer. Esto eliminará permanentemente el instructor. Los cursos asignados a este instructor mantendrán su referencia."}
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
              Envía un mensaje a {contactUser?.name} ({contactUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                placeholder="Asunto del mensaje"
                defaultValue="Información sobre tu pago"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
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
