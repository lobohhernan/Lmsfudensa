import { useState, useEffect, lazy, Suspense } from "react";
import { Palette, LayoutDashboard, Menu, Award, User, Loader2 } from "lucide-react";
import { AppNavbar } from "./components/AppNavbar";
import { AppFooter } from "./components/AppFooter";
import { Home } from "./pages/Home";
import { Toaster } from "./components/ui/sonner";

// Lazy load pages for code-splitting
const CourseCatalog = lazy(() => import("./pages/CourseCatalog").then(m => ({ default: m.CourseCatalog })));
const CourseDetail = lazy(() => import("./pages/CourseDetail").then(m => ({ default: m.CourseDetail })));
const LessonPlayer = lazy(() => import("./pages/LessonPlayer").then(m => ({ default: m.LessonPlayer })));
const Checkout = lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })));
const UserProfile = lazy(() => import("./pages/UserProfile").then(m => ({ default: m.UserProfile })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const DesignSystem = lazy(() => import("./pages/DesignSystem").then(m => ({ default: m.DesignSystem })));
const Evaluation = lazy(() => import("./pages/Evaluation").then(m => ({ default: m.Evaluation })));
const AboutUs = lazy(() => import("./pages/AboutUs").then(m => ({ default: m.AboutUs })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { supabase } from "./lib/supabase";
import { initCacheManager } from "./lib/cacheManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";

type Page =
  | "home"
  | "catalog"
  | "course"
  | "lesson"
  | "checkout"
  | "profile"
  | "admin"
  | "design"
  | "evaluation"
  | "about"
  | "contact";

// Función para parsear la ruta desde el hash
function parseRouteFromHash(): {
  page: Page;
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
} {
  const hash = window.location.hash.slice(1); // Quita el #
  const parts = hash.split('/').filter(Boolean);

  if (!parts.length || parts[0] === '') {
    return { page: 'home' };
  }

  // Rutas específicas
  if (parts[0] === 'cursos') {
    return { page: 'catalog' };
  }

  if (parts[0] === 'curso' && parts[1]) {
    const courseSlug = parts[1];
    
    if (parts[2] === 'leccion' && parts[3]) {
      return {
        page: 'lesson',
        courseSlug,
        lessonId: parts[3],
      };
    }
    
    if (parts[2] === 'evaluacion') {
      return {
        page: 'evaluation',
        courseSlug,
      };
    }
    
    return {
      page: 'course',
      courseSlug,
    };
  }

  if (parts[0] === 'checkout' && parts[1]) {
    return {
      page: 'checkout',
      courseSlug: parts[1],
    };
  }

  if (parts[0] === 'perfil') {
    return { page: 'profile' };
  }

  if (parts[0] === 'admin') {
    return { page: 'admin' };
  }

  if (parts[0] === 'sobre-nosotros') {
    return { page: 'about' };
  }

  if (parts[0] === 'contacto') {
    return { page: 'contact' };
  }

  return { page: 'home' };
}

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0B5FFF]" />
        <p className="text-[#64748B]">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  // Hidratar estado inicial desde URL hash
  const initialRoute = parseRouteFromHash();
  
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>(initialRoute.courseId);
  const [currentCourseSlug, setCurrentCourseSlug] = useState<string | undefined>(initialRoute.courseSlug);
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(initialRoute.lessonId);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ email: string; name: string } | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{ page: string; courseId?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Actualizar URL según la página activa
  useEffect(() => {
    if (currentPage === "profile" && userData) {
      // Perfil: /perfil/username
      const userId = userData.email.split('@')[0];
      window.history.replaceState(null, "", `#/perfil/${userId}`);
      document.title = `Perfil - ${userData.name} | FUDENSA`;
    } else if (currentPage === "catalog") {
      // Catálogo: /cursos
      window.history.replaceState(null, "", "#/cursos");
      document.title = "Catálogo de Cursos | FUDENSA";
    } else if (currentPage === "course" && currentCourseSlug) {
      // Curso: /curso/nombre-del-curso
      window.history.replaceState(null, "", `#/curso/${currentCourseSlug}`);
      document.title = `${currentCourseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | FUDENSA`;
    } else if (currentPage === "lesson" && currentCourseSlug && currentLessonId) {
      // Lección: /curso/nombre-del-curso/leccion/1
      window.history.replaceState(null, "", `#/curso/${currentCourseSlug}/leccion/${currentLessonId}`);
      document.title = `Lección ${currentLessonId} | FUDENSA`;
    } else if (currentPage === "evaluation" && currentCourseSlug) {
      // Evaluación: /curso/nombre-del-curso/evaluacion
      window.history.replaceState(null, "", `#/curso/${currentCourseSlug}/evaluacion`);
      document.title = `Evaluación | FUDENSA`;
    } else if (currentPage === "checkout" && currentCourseSlug) {
      // Checkout: /checkout/nombre-del-curso
      window.history.replaceState(null, "", `#/checkout/${currentCourseSlug}`);
      document.title = `Checkout | FUDENSA`;
    } else if (currentPage === "admin") {
      // Admin: /admin/panel
      window.history.replaceState(null, "", "#/admin/panel");
      document.title = "Panel de Administración | FUDENSA";
    } else if (currentPage === "about") {
      // Sobre nosotros: /sobre-nosotros
      window.history.replaceState(null, "", "#/sobre-nosotros");
      document.title = "Sobre Nosotros | FUDENSA";
    } else if (currentPage === "contact") {
      // Contacto: /contacto
      window.history.replaceState(null, "", "#/contacto");
      document.title = "Contacto | FUDENSA";
    } else if (currentPage === "home") {
      window.history.replaceState(null, "", "#/");
      document.title = "FUDENSA - Formación Profesional en Salud Certificada";
    } else {
      // Páginas restantes
      const pageNames: { [key in Page]: string } = {
        home: "Inicio",
        catalog: "Catálogo de Cursos",
        course: "Detalle del Curso",
        lesson: "Lección",
        checkout: "Checkout",
        profile: "Perfil",
        admin: "Panel de Administración",
        design: "Sistema de Diseño",
        evaluation: "Evaluación",
        about: "Sobre Nosotros",
        contact: "Contacto"
      };
      document.title = `${pageNames[currentPage]} | FUDENSA`;
    }
  }, [currentPage, userData, currentCourseSlug, currentLessonId]);

  // Cargar sesión de Supabase al iniciar
  useEffect(() => {
    // ✨ Inicializar Cache Manager (detección automática de versión)
    initCacheManager()

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Obtener perfil completo
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", session.user.id)
            .single();

          let userData_: { email: string; name: string };
          
          if (profile) {
            userData_ = {
              email: profile.email || session.user.email || "",
              name: profile.full_name || session.user.email?.split('@')[0] || "Usuario",
            };
          } else {
            // Si no tiene perfil, usar los datos del auth
            userData_ = {
              email: session.user.email || "",
              name: session.user.email?.split('@')[0] || "Usuario",
            };
          }
          
          setIsLoggedIn(true);
          setUserData(userData_);
          sessionStorage.setItem('user_session', JSON.stringify(userData_));
        } else {
          // No hay sesión, limpiar todo
          setIsLoggedIn(false);
          setUserData(null);
          sessionStorage.removeItem('user_session');
        }
      } catch (error) {
        console.error("Error cargando sesión:", error);
        setIsLoggedIn(false);
        setUserData(null);
        sessionStorage.removeItem('user_session');
      }
    };

    loadSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", session.user.id)
            .single();

          let userData_: { email: string; name: string };
          
          if (profile) {
            userData_ = {
              email: profile.email || session.user.email || "",
              name: profile.full_name || session.user.email?.split('@')[0] || "Usuario",
            };
          } else {
            userData_ = {
              email: session.user.email || "",
              name: session.user.email?.split('@')[0] || "Usuario",
            };
          }
          
          setIsLoggedIn(true);
          setUserData(userData_);
          sessionStorage.setItem('user_session', JSON.stringify(userData_));
        } catch (error) {
          console.log("Error cargando perfil:", error);
          // Aunque falle el perfil, mantener la sesión autenticada
          const userData_ = {
            email: session.user.email || "",
            name: session.user.email?.split('@')[0] || "Usuario",
          };
          setIsLoggedIn(true);
          setUserData(userData_);
          sessionStorage.setItem('user_session', JSON.stringify(userData_));
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        sessionStorage.removeItem('user_session');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Recuperar courseId y lessonId de localStorage si la página es lesson y no hay IDs
  useEffect(() => {
    if (currentPage === 'lesson') {
      if (!currentCourseId) {
        const savedCourseId = localStorage.getItem('current_course_id');
        if (savedCourseId) {
          setCurrentCourseId(savedCourseId);
        }
      }
      if (!currentLessonId) {
        const savedLessonId = localStorage.getItem('current_lesson_id');
        if (savedLessonId) {
          setCurrentLessonId(savedLessonId);
        }
      }
    }
  }, [currentPage, currentCourseId, currentLessonId]);

  const handleNavigate = (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => {
    setCurrentPage(page as Page);
    if (courseId) {
      setCurrentCourseId(courseId);
      // Persistir courseId en localStorage para recuperación tras recarga
      localStorage.setItem('current_course_id', courseId);
    }
    if (courseSlug) {
      setCurrentCourseSlug(courseSlug);
    }
    if (lessonId) {
      setCurrentLessonId(lessonId);
      // Persistir lessonId en localStorage para recuperación tras recarga
      localStorage.setItem('current_lesson_id', lessonId);
    }
  };

  const handleLogin = (user: { email: string; name: string }) => {
    setIsLoggedIn(true);
    setUserData(user);
    
    // Si había una navegación pendiente, ejecutarla
    if (pendingNavigation) {
      handleNavigate(pendingNavigation.page, pendingNavigation.courseId);
      setPendingNavigation(null);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Iniciando cierre de sesión...");
      
      // Cerrar sesión en Supabase primero
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Error en Supabase signOut:", error);
        throw error;
      }
      
      console.log("✅ Sesión cerrada en Supabase");
      
      // Limpiar estados locales
      setIsLoggedIn(false);
      setUserData(null);
      setCurrentPage("home");
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('user_session');
      
      console.log("✅ Estados y sessionStorage limpiados");
      console.log("✅ Sesión cerrada completamente");
      
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
      
      // Forzar limpieza aunque haya error
      setIsLoggedIn(false);
      setUserData(null);
      sessionStorage.removeItem('user_session');
      setCurrentPage("home");
    }
  };

  // Admin, Lesson Player, and Evaluation have their own layouts
  if (currentPage === "admin") {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPanel onNavigate={handleNavigate} />
        <Toaster />
      </Suspense>
    );
  }

  if (currentPage === "lesson") {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn}
            currentUser={userData}
            onLogout={handleLogout}
            onLogin={handleLogin}
            currentPage={currentPage}
            openLoginModal={showAuthModal}
            onLoginModalChange={setShowAuthModal}
          />

          <main className="flex-1">
            <LessonPlayer 
              onNavigate={handleNavigate} 
              courseId={currentCourseId}
              lessonId={currentLessonId}
            />
          </main>

          <AppFooter />
          <Toaster />
      </div>
    );
  }

  if (currentPage === "evaluation") {
    return (
      <Suspense fallback={<PageLoader />}>
        <Evaluation onNavigate={handleNavigate} />
        <Toaster />
      </Suspense>
    );
  }

  // All other pages use the standard layout with navbar and footer
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar 
        onNavigate={handleNavigate} 
        isLoggedIn={isLoggedIn}
        currentUser={userData}
        onLogout={handleLogout}
        onLogin={handleLogin}
        currentPage={currentPage}
        openLoginModal={showAuthModal}
        onLoginModalChange={setShowAuthModal}
      />
      
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {currentPage === "home" && <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />}
          {currentPage === "catalog" && <CourseCatalog onNavigate={handleNavigate} />}
          {currentPage === "course" && (
            <CourseDetail 
              courseId={currentCourseId}
              onNavigate={handleNavigate} 
              isLoggedIn={isLoggedIn}
              onAuthRequired={(page, courseId) => {
                setPendingNavigation({ page, courseId });
                setShowAuthModal(true);
              }}
            />
          )}
          {currentPage === "checkout" && (
            <Checkout 
              onNavigate={handleNavigate}
              courseId={currentCourseId}
              userData={userData}
            />
          )}
          {currentPage === "profile" && <UserProfile onNavigate={handleNavigate} />}
          {currentPage === "design" && <DesignSystem />}
          {currentPage === "about" && <AboutUs onNavigate={handleNavigate} />}
          {currentPage === "contact" && <Contact />}
        </Suspense>
      </main>

      <AppFooter onNavigate={handleNavigate} />
      
      {/* Quick Access Menu */}
      <div className="fixed bottom-6 right-6 z-100">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
              aria-label="Menú de acceso rápido"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            sideOffset={5}
          >
            <DropdownMenuItem 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleNavigate("profile");
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Perfil de Usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleNavigate("design");
              }}
              className="cursor-pointer"
            >
              <Palette className="mr-2 h-4 w-4" />
              Design System
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleNavigate("admin");
              }}
              className="cursor-pointer"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Panel Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleNavigate("evaluation");
              }}
              className="cursor-pointer"
            >
              <Award className="mr-2 h-4 w-4" />
              Evaluación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Toaster />
    </div>
  );
}
