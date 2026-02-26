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
import { supabase, AUTH_STORAGE_KEY } from "./lib/supabase";
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
  const [pendingNavigation, setPendingNavigation] = useState<{ page: string; courseId?: string } | null>(null);
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
  useEffect(() => {
    if (currentPage === 'admin') {
      if (!isLoggedIn || !userData || userData.role !== 'admin') {
        toast.error('Acceso denegado. Solo administradores pueden acceder al panel admin.');
        startTransition(() => {
          setCurrentPage('home');
          window.history.pushState(null, "", "/");
        });
      }
    }
  }, [currentPage, isLoggedIn, userData]);

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

    const authTimeoutRef: { current: number | null } = { current: null }

    const clearAuthTimeout = () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
        authTimeoutRef.current = null
      }
    }

    // ── Helper: Asegurar que exista un profile para cualquier usuario autenticado ──
    const ensureProfile = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) => {
      try {
        const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario') as string
        const { error: upsertError } = await supabase.from('profiles').upsert([{
          id: user.id,
          email: user.email ?? '',
          full_name: fullName,
          role: 'student',
          updated_at: new Date().toISOString(),
        }], { onConflict: 'id', ignoreDuplicates: true })
        if (upsertError) {
          logError('⚠️ [App] Error en upsert de profile:', upsertError.message)
        } else {
          debug('✅ [App] Profile asegurado para', user.email)
        }
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
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profileError) {
          logError('⚠️ [App] Error obteniendo rol de profile:', profileError.message)
        } else if (profile?.role) {
          role = profile.role as 'student' | 'instructor' | 'admin'
          debug('✅ [App] Rol obtenido de profiles:', role)
        }
      } catch (err) {
        logError('⚠️ [App] Excepción obteniendo profile:', err)
      }

      return { email: user.email || '', name: fullName, role }
    }

    const loadSession = async () => {
      try {
        debug('🔐 [App] Cargando sesión...')

        // ── Detectar callback OAuth ──
        // PKCE envía ?code= en query, flujo implícito envía #access_token= en hash
        const urlSearch = new URLSearchParams(window.location.search)
        const isOAuthCallback =
          urlSearch.has('code') ||
          window.location.hash.includes('access_token=') ||
          window.location.hash.includes('refresh_token=')

        // ── Buscar sesión guardada con la KEY que realmente usa el cliente ──
        const hasStoredSession = Object.keys(localStorage).some(k => k.startsWith(AUTH_STORAGE_KEY))

        if (!hasStoredSession && !isOAuthCallback) {
          debug('⚠️ [App] No hay tokens en localStorage ni callback OAuth, saltando verificación')
          setIsLoggedIn(false)
          setUserData(null)
          sessionStorage.removeItem('user_session')
          setAuthBootstrapped(true)
          return
        }

        if (isOAuthCallback) {
          debug('🔐 [App] Callback OAuth detectado, procesando tokens...')
        }

        // ── getSession() PRIMERO: necesita leer ?code= ANTES de limpiarlo ──
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        // Ahora sí limpiamos la URL (el code ya fue intercambiado)
        if (isOAuthCallback) {
          window.history.replaceState(null, '', window.location.pathname)
        }

        if (sessionError) {
          logError('❌ [App] Error obteniendo sesión:', sessionError)
        }

        debug('🔐 [App] Sesión obtenida:', { hasSession: !!session, userId: session?.user?.id, email: session?.user?.email })

        if (session?.user) {
          debug('🔐 [App] Usuario autenticado')

          // Asegurar profile (idempotente — no sobreescribe si ya existe)
          await ensureProfile(session.user)

          const userData_ = await extractUserData(session.user)

          debug('✅ [App] Login exitoso:', userData_.email, 'name:', userData_.name, 'role:', userData_.role)
          setIsLoggedIn(true)
          setUserData(userData_)
          sessionStorage.setItem('user_session', JSON.stringify(userData_))
          clearAuthTimeout()
        } else {
          debug('⚠️ [App] No hay sesión válida, finalizando...')
          setIsLoggedIn(false)
          setUserData(null)
          sessionStorage.removeItem('user_session')
          clearAuthTimeout()
        }
      } catch (error) {
        logError('Error cargando sesión:', error)
        setIsLoggedIn(false)
        setUserData(null)
        sessionStorage.removeItem('user_session')
        clearAuthTimeout()
      } finally {
        setAuthBootstrapped(true)
      }
    };

    loadSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } } | null) => {
      debug('🔄 [App] Auth state change:', _event, { hasSession: !!session })
      // Si llegó alguna actualización de auth, cancelar el timeout de no-auth
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
        authTimeoutRef.current = null
      }
      if (session?.user) {
        // Asegurar profile para CUALQUIER evento (no solo SIGNED_IN)
        // Es idempotente — ignoreDuplicates:true no sobreescribe existentes
        await ensureProfile(session.user)

        const userData_ = await extractUserData(session.user)

        setIsLoggedIn(true)
        setUserData(userData_)
        sessionStorage.setItem('user_session', JSON.stringify(userData_))
        setAuthBootstrapped(true)
      } else {
        setIsLoggedIn(false)
        setUserData(null)
        sessionStorage.removeItem('user_session')
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
      if (courseId) {
        setCurrentCourseId(courseId);
      }
      if (courseSlug) {
        setCurrentCourseSlug(courseSlug);
      }
      if (lessonId) {
        setCurrentLessonId(lessonId);
      }
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
      <div className="min-h-screen bg-gradient-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] flex items-center justify-center">
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
