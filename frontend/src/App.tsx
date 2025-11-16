import { useState, useEffect, Suspense } from "react";
import { Palette, LayoutDashboard, Menu, Award, User, LogIn, LogOut } from "lucide-react";
import { AppNavbar } from "./components/AppNavbar";
import { AppFooter } from "./components/AppFooter";
import { PageLoader } from "./components/PageLoader";
import { Home } from "./pages/Home";
import { CourseCatalog } from "./pages/CourseCatalog";
import { CourseDetail } from "./pages/CourseDetail";
import { LessonPlayer } from "./pages/LessonPlayer";
import { Checkout } from "./pages/Checkout";
import { UserProfile } from "./pages/UserProfile";
import { AdminPanel } from "./pages/AdminPanel";
import { DesignSystem } from "./pages/DesignSystem";
import { Evaluation } from "./pages/Evaluation";
import { AboutUs } from "./pages/AboutUs";
import { Contact } from "./pages/Contact";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { supabase } from "./lib/supabase";
import { initCacheManager } from "./lib/cacheManager";
import { debugSupabaseSession, clearSupabaseSession } from "./utils/debugSupabase";
import { debug, error as logError } from './lib/logger'
import { useStorageCleanup } from "./hooks/useStorageCleanup"
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

export default function App() {
  // 🧹 Limpiar storage corrupto al iniciar
  useStorageCleanup()

  // Hidratar estado inicial desde URL hash
  const initialRoute = parseRouteFromHash();
  
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>(initialRoute.courseId);
  const [currentCourseSlug, setCurrentCourseSlug] = useState<string | undefined>(initialRoute.courseSlug);
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(initialRoute.lessonId);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Estado de carga inicial
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

    const authTimeoutRef: { current: number | null } = { current: null }

    const clearAuthTimeout = () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
        authTimeoutRef.current = null
      }
    }

    const loadSession = async () => {
      try {
        console.log('🔐 [App] Cargando sesión...')
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 [App] Sesión obtenida:', { hasSession: !!session, userId: session?.user?.id, email: session?.user?.email })
        
        if (session?.user) {
          console.log('🔐 [App] Usuario autenticado, consultando perfil...')
          
          // Obtener perfil completo con TIMEOUT de 2 segundos
          const profilePromise = supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", session.user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout profiles')), 2000)
          );
          
          let profile = null;
          let profileError = null;
          
          try {
            const result = await Promise.race([profilePromise, timeoutPromise]) as any;
            profile = result.data;
            profileError = result.error;
          } catch (err: any) {
            console.warn('⚠️ [App] Timeout o error en profiles:', err.message);
            profileError = err;
          }
          
          console.log('🔐 [App] Respuesta profiles:', { hasProfile: !!profile, error: profileError?.message });

          let userData_: { email: string; name: string };
          
          if (profile) {
            console.log('✅ [App] Perfil encontrado:', profile.full_name)
            userData_ = {
              email: profile.email || session.user.email || "",
              name: profile.full_name || session.user.email?.split('@')[0] || "Usuario",
            };
          } else {
            // Si no tiene perfil, usar los datos del auth (esto es OK)
            console.log('⚠️ [App] No hay perfil en DB, usando datos de auth')
            userData_ = {
              email: session.user.email || "",
              name: session.user.email?.split('@')[0] || "Usuario",
            };
          }
          
          console.log('✅ [App] Login exitoso:', userData_.email)
          setIsLoggedIn(true);
          setUserData(userData_);
          sessionStorage.setItem('user_session', JSON.stringify(userData_));
          setIsInitializing(false); // Marcar inicialización completa
          clearAuthTimeout()
        } else {
          // No hay sesión inmediata — esperar un poco por si la rehidratación llega
          console.log('⚠️ [App] No hay sesión, esperando 3s...')
          clearAuthTimeout()
          authTimeoutRef.current = window.setTimeout(() => {
            console.log('❌ [App] Timeout alcanzado, marcando como no autenticado')
            setIsLoggedIn(false)
            setUserData(null)
            sessionStorage.removeItem('user_session')
            setIsInitializing(false) // Marcar fin de inicialización
            authTimeoutRef.current = null
          }, 3000)  // Aumentado de 800ms a 3000ms para redes lentas
        }
      } catch (error) {
        logError("Error cargando sesión:", error);
        // En caso de error, marcar como no autenticado después de corto retraso
        clearAuthTimeout()
        authTimeoutRef.current = window.setTimeout(() => {
          setIsLoggedIn(false)
          setUserData(null)
          sessionStorage.removeItem('user_session')
          setIsInitializing(false) // Marcar fin de inicialización
          authTimeoutRef.current = null
        }, 3000)  // Aumentado de 800ms a 3000ms para redes lentas
      }
    };

    loadSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 [App] Auth state change:', _event, { hasSession: !!session })
      // Si llegó alguna actualización de auth, cancelar el timeout de no-auth
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
        authTimeoutRef.current = null
      }
      if (session?.user) {
        try {
          // Timeout en onAuthStateChange también
          const profilePromise = supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", session.user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout profiles')), 2000)
          );
          
          const result = await Promise.race([profilePromise, timeoutPromise]) as any;
          const profile = result?.data;

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
          logError("Error cargando perfil:", error);
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
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
        authTimeoutRef.current = null
      }
    };
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: string, courseId?: string, courseSlug?: string, lessonId?: string) => {
    setCurrentPage(page as Page);
    if (courseId) {
      setCurrentCourseId(courseId);
    }
    if (courseSlug) {
      setCurrentCourseSlug(courseSlug);
    }
    if (lessonId) {
      setCurrentLessonId(lessonId);
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
      debug("🚪 Iniciando cierre de sesión...");
      
      // Cerrar sesión en Supabase primero
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Error en Supabase signOut:", error);
        throw error;
      }
      
      debug("✅ Sesión cerrada en Supabase");
      
      // Limpiar estados locales
      setIsLoggedIn(false);
      setUserData(null);
      setCurrentPage("home");
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('user_session');
      
      debug("✅ Estados y sessionStorage limpiados");
      debug("✅ Sesión cerrada completamente");
      
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

  // Mostrar loader mientras se inicializa la sesión
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Admin, Lesson Player, and Evaluation have their own layouts
  if (currentPage === "admin") {
    return (
      <>
        <AdminPanel onNavigate={handleNavigate} />
        <Toaster />
      </>
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

        <AppFooter onNavigate={handleNavigate} />
        <Toaster />
      </div>
    );
  }

  if (currentPage === "evaluation") {
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
          <Evaluation onNavigate={handleNavigate} />
        </main>

        <AppFooter onNavigate={handleNavigate} />
        <Toaster />
      </div>
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
              courseSlug={currentCourseSlug}
              userData={userData}
              isInitializing={isInitializing}
            />
          )}
          {currentPage === "profile" && <UserProfile onNavigate={handleNavigate} />}
          {currentPage === "design" && <DesignSystem />}
          {currentPage === "about" && <AboutUs onNavigate={handleNavigate} />}
          {currentPage === "contact" && <Contact />}
        </Suspense>
      </main>

      <AppFooter onNavigate={handleNavigate} />
      
      {/* Quick Access Menu - Demo purposes */}
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
                setIsLoggedIn(!isLoggedIn);
                toast.success(
                  isLoggedIn 
                    ? "Vista de visitante activada" 
                    : "Vista de usuario autenticado activada"
                );
                if (!isLoggedIn) {
                  handleNavigate("home");
                }
              }}
              className="cursor-pointer"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Ver como Visitante
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Ver como Usuario Autenticado
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
              onClick={async (e: React.MouseEvent) => {
                e.preventDefault();
                        try {
                          // Ejecutar debug de Supabase en la pestaña normal
                          // Muestra resultados en consola del navegador
                          await debugSupabaseSession();
                          toast.success("Debug Supabase ejecutado (ver consola)");
                        } catch (err) {
                          logError("Error ejecutando debugSupabaseSession:", err);
                          toast.error("Error ejecutando debug");
                        }
              }}
              className="cursor-pointer"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Debug Supabase
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async (e: React.MouseEvent) => {
                e.preventDefault();
                try {
                  await clearSupabaseSession();
                  toast.success("Sesión local limpiada");
                } catch (err) {
                  logError("Error clearSupabaseSession:", err);
                  toast.error("Error limpiando sesión");
                }
              }}
              className="cursor-pointer"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M9 6v12M15 6v12"/></svg>
              Limpiar Sesión Supabase
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
