import { useState, useEffect, useCallback, lazy, Suspense, startTransition } from "react";
import { AppNavbar } from "./components/AppNavbar";
import { AppFooter } from "./components/AppFooter";
import { PageLoader } from "./components/PageLoader";
import { Home } from "./pages/Home";
import { CourseCatalog } from "./pages/CourseCatalog";

// ✅ Code-splitting: lazy load de páginas no críticas para reducir bundle inicial
const CourseDetail = lazy(() => import("./pages/CourseDetail").then(m => ({ default: m.CourseDetail })));
const LessonPlayer = lazy(() => import("./pages/LessonPlayer").then(m => ({ default: m.LessonPlayer })));
const Checkout = lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback").then(m => ({ default: m.PaymentCallback })));
const MercadoPagoSuccess = lazy(() => import("./pages/MercadoPagoSuccess"));
const MercadoPagoRedirect = lazy(() => import("./pages/MercadoPagoRedirect"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutFailure = lazy(() => import("./pages/CheckoutFailure"));
const UserProfile = lazy(() => import("./pages/UserProfile").then(m => ({ default: m.UserProfile })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const DesignSystem = lazy(() => import("./pages/DesignSystem").then(m => ({ default: m.DesignSystem })));
const Evaluation = lazy(() => import("./pages/Evaluation").then(m => ({ default: m.Evaluation })));
const AboutUs = lazy(() => import("./pages/AboutUs").then(m => ({ default: m.AboutUs })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "./lib/supabase";
import { initCacheManager } from "./lib/cacheManager";
import { debug, error as logError } from './lib/logger'
import { useStorageCleanup } from "./hooks/useStorageCleanup"
import { resolveCourseSlugToId } from "./lib/courseResolver"

type Page =
  | "home"
  | "catalog"
  | "course"
  | "lesson"
  | "checkout"
  | "payment-callback"
  | "mp-success"
  | "mp-redirect"
  | "checkout-success"
  | "checkout-failure"
  | "profile"
  | "admin"
  | "design"
  | "evaluation"
  | "about"
  | "contact";

// Función para parsear la ruta desde el pathname y hash
function parseRouteFromPath(): {
  page: Page;
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
} {
  // Detectar parámetros de Mercado Pago en query string
  const urlParams = new URLSearchParams(window.location.search);
  const mpPaymentId = urlParams.get("payment_id");
  const mpExternalRef = urlParams.get("external_reference");
  const mpStatus = urlParams.get("status") || "approved"; // Mercado Pago envía status=approved o status=pending/rejected

  // Si hay parámetros de Mercado Pago, determinar si fue éxito o fracaso
  if (mpPaymentId && (mpExternalRef || mpStatus)) {
    // Si está aprobado (o no rechazado explícitamente), es éxito
    if (mpStatus === "approved" || mpStatus === "pending" || !mpStatus) {
      return { page: 'checkout-success' };
    } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
      return { page: 'checkout-failure' };
    }
  }

  // Primero verificar si hay hash (/#/...)
  const hash = window.location.hash.substring(2); // Remove '#/'
  if (hash) {
    const hashParts = hash.split('/').filter(Boolean);
    
    // Ruta de redirección de Mercado Pago
    if (hashParts[0] === 'mp-redirect') {
      return { page: 'mp-redirect' };
    }
    
    // Rutas de checkout
    if (hashParts[0] === 'checkout') {
      if (hashParts[1] === 'success') {
        return { page: 'checkout-success' };
      }
      if (hashParts[1] === 'failure') {
        return { page: 'checkout-failure' };
      }
      if (hashParts[1]) {
        return { page: 'checkout', courseSlug: hashParts[1] };
      }
    }
  }

  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);

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

  if (parts[0] === 'payment-callback') {
    return { page: 'payment-callback' };
  }

  if (parts[0] === 'mp-success') {
    return { page: 'mp-success' };
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

  // Hidratar estado inicial desde URL pathname (sin hash)
  const initialRoute = parseRouteFromPath();
  
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>(initialRoute.courseId);
  const [currentCourseSlug, setCurrentCourseSlug] = useState<string | undefined>(initialRoute.courseSlug);
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(initialRoute.lessonId);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ email: string; name: string; role: 'student' | 'instructor' | 'admin' } | null>(null);
  const [, setPendingNavigation] = useState<{ page: string; courseId?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isResolvingRoute, setIsResolvingRoute] = useState(false);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);

  // ✅ Resolver courseSlug a courseId cuando navegamos por URL (F5)
  useEffect(() => {
    const resolveSlugToId = async () => {
      // Si ya tenemos courseId, no hacer nada
      if (currentCourseId) return;
      
      // Si tenemos slug pero NO id, resolver
      if (currentCourseSlug && !currentCourseId) {
        setIsResolvingRoute(true);
        debug(`🔄 [App] Resolviendo slug "${currentCourseSlug}" a ID...`);
        
        const resolvedId = await resolveCourseSlugToId(currentCourseSlug);
        
        if (resolvedId) {
          debug(`✅ [App] Slug resuelto: ${currentCourseSlug} → ${resolvedId}`);
          setCurrentCourseId(resolvedId);
        } else {
          logError(`❌ [App] No se pudo resolver slug: ${currentCourseSlug}`);
        }
        
        setIsResolvingRoute(false);
      }
    };
    
    resolveSlugToId();
  }, [currentCourseSlug, currentCourseId]);

  // Actualizar URL según la página activa
  // ⚠️ NO ejecutar pushState mientras haya parámetros OAuth pendientes
  useEffect(() => {
    if (!authBootstrapped) return; // Esperar a que auth termine bootstrap
    if (currentPage === "profile" && userData) {
      // Perfil: /perfil/username
      const userId = userData.email.split('@')[0];
      window.history.pushState(null, "", `/perfil/${userId}`);
      document.title = `Perfil - ${userData.name} | FUDENSA`;
    } else if (currentPage === "catalog") {
      // Catálogo: /cursos
      window.history.pushState(null, "", "/cursos");
      document.title = "Catálogo de Cursos | FUDENSA";
    } else if (currentPage === "course" && currentCourseSlug) {
      // Curso: /curso/nombre-del-curso
      window.history.pushState(null, "", `/curso/${currentCourseSlug}`);
      document.title = `${currentCourseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | FUDENSA`;
    } else if (currentPage === "lesson" && currentCourseSlug && currentLessonId) {
      // Lección: /curso/nombre-del-curso/leccion/1
      window.history.pushState(null, "", `/curso/${currentCourseSlug}/leccion/${currentLessonId}`);
      document.title = `Lección ${currentLessonId} | FUDENSA`;
    } else if (currentPage === "evaluation" && currentCourseSlug) {
      // Evaluación: /curso/nombre-del-curso/evaluacion
      window.history.pushState(null, "", `/curso/${currentCourseSlug}/evaluacion`);
      document.title = `Evaluación | FUDENSA`;
    } else if (currentPage === "checkout" && currentCourseSlug) {
      // Checkout: /checkout/nombre-del-curso
      window.history.pushState(null, "", `/checkout/${currentCourseSlug}`);
      document.title = `Checkout | FUDENSA`;
    } else if (currentPage === "payment-callback") {
      // Payment Callback: /payment-callback
      window.history.pushState(null, "", `/payment-callback`);
      document.title = `Procesando Pago | FUDENSA`;
    } else if (currentPage === "mp-success") {
      // Mercado Pago Success: /mp-success
      window.history.pushState(null, "", `/mp-success`);
      document.title = `Confirmando Pago | FUDENSA`;
    } else if (currentPage === "admin") {
      // Admin: /admin/panel
      window.history.pushState(null, "", "/admin/panel");
      document.title = "Panel de Administración | FUDENSA";
    } else if (currentPage === "about") {
      // Sobre Nosotros: /sobre-nosotros
      window.history.pushState(null, "", "/sobre-nosotros");
      document.title = "Sobre Nosotros | FUDENSA";
    } else if (currentPage === "contact") {
      // Contacto: /contacto
      window.history.pushState(null, "", "/contacto");
      document.title = "Contacto | FUDENSA";
    } else if (currentPage === "home") {
      window.history.pushState(null, "", "/");
      document.title = "FUDENSA - Formación Profesional en Salud Certificada";
    } else {
      // Páginas restantes
      const pageNames: { [key in Page]: string } = {
        home: "Inicio",
        catalog: "Catálogo de Cursos",
        course: "Detalle del Curso",
        lesson: "Lección",
        checkout: "Checkout",
        "payment-callback": "Procesando Pago",
        "mp-success": "Confirmando Pago",
        "mp-redirect": "Redirigiendo Pago",
        "checkout-success": "Pago Exitoso",
        "checkout-failure": "Pago Fallido",
        profile: "Perfil",
        admin: "Panel de Administración",
        design: "Sistema de Diseño",
        evaluation: "Evaluación",
        about: "Sobre Nosotros",
        contact: "Contacto"
      };
      document.title = `${pageNames[currentPage]} | FUDENSA`;
    }
  }, [currentPage, userData, currentCourseSlug, currentLessonId, authBootstrapped]);

  // Proteger acceso al panel admin por URL directa
  // ⚠️ Esperar a authBootstrapped antes de evaluar: si no, redirige mientras
  // Supabase aún está restaurando la sesión desde localStorage (ej: F5 en /admin)
  useEffect(() => {
    if (!authBootstrapped) return;
    if (currentPage === 'admin') {
      if (!isLoggedIn || !userData || userData.role !== 'admin') {
        toast.error('Acceso denegado. Solo administradores pueden acceder al panel admin.');
        startTransition(() => {
          setCurrentPage('home');
          window.history.pushState(null, "", "/");
        });
      }
    }
  }, [currentPage, isLoggedIn, userData, authBootstrapped]);

  // ✅ Listener para botón atrás/adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromPath();
      startTransition(() => {
        setCurrentPage(route.page);
        setCurrentCourseId(route.courseId);
        setCurrentCourseSlug(route.courseSlug);
        setCurrentLessonId(route.lessonId);
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cargar sesión de Supabase al iniciar
  useEffect(() => {
    // ✨ Inicializar Cache Manager (detección automática de versión)
    initCacheManager()

    // ── Helper: Asegurar que exista un profile para cualquier usuario autenticado ──
    const ensureProfile = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) => {
      try {
        const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario') as string
        await supabase.from('profiles').upsert([{
          id: user.id,
          email: user.email ?? '',
          full_name: fullName,
          // role NO incluido: DB default 'student' aplica solo para usuarios nuevos.
          // ignoreDuplicates:true garantiza que el rol existente (admin/instructor) NUNCA se pisa.
          updated_at: new Date().toISOString(),
        }], { onConflict: 'id', ignoreDuplicates: true })
        debug('✅ [App] Profile asegurado para', user.email)
      } catch (err) {
        logError('⚠️ [App] Error asegurando profile:', err)
      }
    }

    // ── Helper: Extraer userData de una sesión de Supabase ──
    const extractUserData = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) => {
      const userMeta = user.user_metadata ?? {}
      const appMeta = user.app_metadata ?? {}
      const fullName = (userMeta.full_name || userMeta.name || user.email?.split('@')[0] || 'Usuario') as string
      let role: 'student' | 'instructor' | 'admin' = ((appMeta.role || userMeta.role || 'student') as 'student' | 'instructor' | 'admin')

      // Intentar obtener el rol real desde profiles (puede ser admin)
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role) {
          role = profile.role as 'student' | 'instructor' | 'admin'
        }
      } catch { /* ignorar, usa fallback */ }

      return { email: user.email || '', name: fullName, role }
    }

    const loadSession = async () => {
      try {
        // ── Detectar callback OAuth ──
        const urlSearch = new URLSearchParams(window.location.search)
        const isOAuthCallback =
          urlSearch.has('code') ||
          window.location.hash.includes('access_token=') ||
          window.location.hash.includes('refresh_token=')

        if (isOAuthCallback) {
          debug('🔐 [App] Callback OAuth detectado, intercambiando tokens...')
          await supabase.auth.getSession()
          window.history.replaceState(null, '', window.location.pathname)
          debug('🔐 [App] Tokens OAuth intercambiados, URL limpiada')
          // onAuthStateChange(SIGNED_IN) disparará desde aquí
          return
        }

        // ✅ Fallback de seguridad: si INITIAL_SESSION no dispara (raro pero posible),
        //    getSession() fuerza la lectura de localStorage y resuelve el bootstrap.
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          debug('⚠️ [App] getSession() sin sesión → usuario no autenticado')
          setIsLoggedIn(false)
          setUserData(null)
          setAuthBootstrapped(true)
        }
        // Si session existe, onAuthStateChange(INITIAL_SESSION) llega en ms y maneja el estado.
      } catch (error) {
        logError('Error en loadSession OAuth:', error)
        setIsLoggedIn(false)
        setUserData(null)
        setAuthBootstrapped(true)
      }
    };

    loadSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } } | null) => {
      debug('🔄 [App] Auth state change:', _event, { hasSession: !!session })

      // TOKEN_REFRESHED: el token se renovó automáticamente (~55 min) pero el usuario
      // y su rol no cambiaron — solo actualizamos el flag y salimos sin re-queries a DB.
      if (_event === 'TOKEN_REFRESHED' && session?.user) {
        debug('🔑 [App] Token renovado, sin re-consultar perfil')
        setAuthBootstrapped(true)
        return
      }

      if (session?.user) {
        // Asegurar profile solo en INITIAL_SESSION / SIGNED_IN / USER_UPDATED
        // Es idempotente — ignoreDuplicates:true no sobreescribe el perfil existente
        await ensureProfile(session.user)

        const userData_ = await extractUserData(session.user)

        debug('✅ [App] Auth state:', _event, userData_.email, 'role:', userData_.role)
        setIsLoggedIn(true)
        setUserData(userData_)
        sessionStorage.setItem('user_session', JSON.stringify(userData_))
        setAuthBootstrapped(true)
      } else {
        debug('⚠️ [App] Sin sesión activa, evento:', _event)
        setIsLoggedIn(false)
        setUserData(null)
        sessionStorage.removeItem('user_session')
        setAuthBootstrapped(true)
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

  const handleNavigate = useCallback((page: string, courseId?: string, courseSlug?: string, lessonId?: string) => {
    // Proteger acceso al panel admin - solo usuarios con rol admin
    if (page === 'admin') {
      if (!isLoggedIn || !userData || userData.role !== 'admin') {
        toast.error('Acceso denegado. Solo administradores pueden acceder al panel admin.');
        return;
      }
    }
    
    // startTransition evita que React.lazy suspenda sincrónicamente durante un clic,
    // lo que causaría "A component suspended while responding to synchronous input".
    startTransition(() => {
      setCurrentPage(page as Page);
      // ✅ Siempre sobrescribir (incluso con undefined) para limpiar el estado
      // previo del curso/lección. Sin esto, navegar del Curso A→Catálogo→Curso B
      // (sin pasar courseId) mantiene el courseId del Curso A y carga el curso equivocado.
      setCurrentCourseId(courseId);
      setCurrentCourseSlug(courseSlug);
      setCurrentLessonId(lessonId);
    });
  }, [isLoggedIn, userData]);

  const handleLogin = useCallback((user: { email: string; name: string; role: 'student' | 'instructor' | 'admin' }) => {
    setIsLoggedIn(true);
    setUserData(user);
    
    // Si había una navegación pendiente, ejecutarla
    setPendingNavigation((prev) => {
      if (prev) {
        handleNavigate(prev.page, prev.courseId);
      }
      return null;
    });
  }, [handleNavigate]);

  const handleLogout = useCallback(async () => {
    try {
      debug("🚪 Iniciando cierre de sesión...");
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logError("❌ Error en Supabase signOut:", error);
        throw error;
      }
      
      debug("✅ Sesión cerrada en Supabase");
      
      // El listener onAuthStateChange se encargará de limpiar los estados
      // pero forzamos la navegación a home
      startTransition(() => {
        setCurrentPage("home");
        window.history.pushState(null, "", "/");
      });
      
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      logError("❌ Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
      
      // Forzar limpieza aunque haya error
      setIsLoggedIn(false);
      setUserData(null);
      sessionStorage.removeItem('user_session');
      startTransition(() => {
        setCurrentPage("home");
        window.history.pushState(null, "", "/");
      });
    }
  }, []);

  // Mostrar loader mientras resolvemos la ruta del curso
  if (isResolvingRoute) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg font-medium">Cargando curso...</p>
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

        <main id="main-content" className="flex-1" role="main">
          <LessonPlayer 
            onNavigate={handleNavigate} 
            courseId={currentCourseId}
            courseSlug={currentCourseSlug}
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

        <main id="main-content" className="flex-1" role="main">
          <Evaluation onNavigate={handleNavigate} courseId={currentCourseId} />
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
      
      <main id="main-content" className="flex-1" role="main">
        <Suspense fallback={<PageLoader />}>
          {currentPage === "home" && <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />}
          {currentPage === "catalog" && <CourseCatalog onNavigate={handleNavigate} />}
          {currentPage === "course" && (
            <CourseDetail 
              courseId={currentCourseId}
              courseSlug={currentCourseSlug}
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
              courseSlug={currentCourseSlug}
              userData={userData}
            />
          )}
          {currentPage === "payment-callback" && <PaymentCallback />}
          {currentPage === "mp-success" && <MercadoPagoSuccess onNavigate={handleNavigate} />}
          {currentPage === "mp-redirect" && <MercadoPagoRedirect onNavigate={handleNavigate} />}
          {currentPage === "checkout-success" && <CheckoutSuccess onNavigate={handleNavigate} />}
          {currentPage === "checkout-failure" && <CheckoutFailure onNavigate={handleNavigate} />}
          {currentPage === "profile" && <UserProfile onNavigate={handleNavigate} />}
          {currentPage === "design" && <DesignSystem />}
          {currentPage === "about" && <AboutUs onNavigate={handleNavigate} />}
          {currentPage === "contact" && <Contact />}
        </Suspense>
      </main>

      <AppFooter onNavigate={handleNavigate} />
      
      <Toaster />
    </div>
  );
}
