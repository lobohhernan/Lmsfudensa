import { useState, useEffect, useCallback, useRef, lazy, Suspense, startTransition } from "react";
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
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
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
  | "contact"
  | "reset-password";

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

  if (parts[0] === 'reset-password' || parts[0] === 'recuperar-contraseña') {
    return { page: 'reset-password' };
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return !!sessionStorage.getItem('user_session'); } catch { return false; }
  });
  const [userData, setUserData] = useState<{ email: string; name: string; role: 'student' | 'instructor' | 'admin' } | null>(() => {
    // Inicializar desde sessionStorage para evitar flash del botón admin en recargas
    try {
      const cached = sessionStorage.getItem('user_session');
      if (cached) return JSON.parse(cached);
    } catch { /* ignorar */ }
    return null;
  });
  const [, setPendingNavigation] = useState<{ page: string; courseId?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isResolvingRoute, setIsResolvingRoute] = useState(false);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  
  // 🔧 Ref para evitar duplicar pushState: cuando handleNavigate actualiza la URL,
  // marcamos que lo hizo para que el useEffect no lo repita
  const lastUrlUpdateRef = useRef<{ page: Page; timestamp: number } | null>(null);

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
    
    // 🔧 Si la URL fue actualizada recientemente por handleNavigate (menos de 100ms),
    // NO duplicar el pushState. Permite al useEffect manejar cambios de URL desde otras fuentes
    // (como popstate, F5, cambios de URL directos, etc.)
    const timeSinceLastUpdate = lastUrlUpdateRef.current 
      ? Date.now() - lastUrlUpdateRef.current.timestamp 
      : Infinity;
    
    // Si handleNavigate acaba de actualizar la URL para esta página, saltar
    if (lastUrlUpdateRef.current?.page === currentPage && timeSinceLastUpdate < 100) {
      return;
    }
    
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

  // ── Ref para almacenar datos crudos del usuario autenticado (sin REST calls) ──
  const authUserRef = useRef<{ id: string; email: string; name: string } | null>(null)

  // ══════════════════════════════════════════════════════════════════════
  // EFECTO 1: Auth listener — CERO REST calls dentro del callback
  // ══════════════════════════════════════════════════════════════════════
  // En @supabase/supabase-js v2.95, cada REST call hace:
  //   fetchWithAuth → _getAccessToken → auth.getSession → await initializePromise
  // Si initializePromise no ha resuelto aún (auth lock), el REST call queda
  // colgado SILENCIOSAMENTE (sin error, sin network request).
  // onAuthStateChange se dispara DENTRO de _initialize (con el lock tomado),
  // así que hacer REST calls ahí produce un deadlock circular.
  //
  // Solución: onAuthStateChange SOLO lee datos del objeto session (ya en memoria)
  // y setea estado React. Las REST calls (ensureProfile, fetchRole) se hacen
  // en un useEffect separado que corre DESPUÉS, cuando el lock ya se liberó.
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    initCacheManager()

    // Helper: extraer userData SIN REST calls, usando solo metadata del token
    // ⚠️ IMPORTANTE: No usar full_name del metadata, ya que tarda en sincronizarse con Auth
    // El nombre correcto vendrá del useEffect de syncProfile que obtiene de DB
    const extractUserDataFromMeta = (user: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    }) => {
      const userMeta = user.user_metadata ?? {}
      const appMeta = user.app_metadata ?? {}
      // 🔑 No usar full_name de metadata - usar email como placeholder
      // El nombre real se sincronizará desde la DB en el siguiente useEffect
      const fullName = (user.email?.split('@')[0] || 'Usuario') as string
      const role: 'student' | 'instructor' | 'admin' =
        (appMeta.role || userMeta.role || 'student') as 'student' | 'instructor' | 'admin'
      return { email: user.email || '', name: fullName, role }
    }

    // ── Escuchar cambios de autenticación ──
    // onAuthStateChange emite INITIAL_SESSION automáticamente al registrarse,
    // así NO necesitamos llamar getSession() manualmente (que también toma el lock).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      debug('🔄 [App] Auth state change:', _event, { hasSession: !!session })

      if (session?.user) {
        const userData_ = extractUserDataFromMeta(session.user)
        debug('✅ [App] Auth state:', _event, userData_.email, 'role (metadata):', userData_.role)

        // Guardar ref para el efecto de sincronización de profile
        authUserRef.current = { id: session.user.id, email: userData_.email, name: userData_.name }

        setIsLoggedIn(true)
        
        // 🔑 Usar userData existente de sessionStorage si:
        // 1. Ya tenemos userData en sessionStorage
        // 2. El email coincide (misma persona)
        // 3. Algún dato (nombre o rol) en sessionStorage es diferente (fue actualizado recientemente)
        // Esto evita parpadeos y asegura que datos recientes se mantengan
        const currentData = sessionStorage.getItem('user_session');
        if (currentData) {
          try {
            const cached = JSON.parse(currentData);
            if (cached.email === userData_.email) {
              // Si el nombre O el rol en sessionStorage son diferentes al metadata, usarlos
              // (significa que fueron actualizados recientemente en la DB)
              const nameNewer = cached.name !== userData_.name;
              const roleNewer = cached.role !== userData_.role;
              
              if (nameNewer || roleNewer) {
                debug('✅ [App] Usando datos frescos de sessionStorage')
                const updated = { ...userData_ };
                if (nameNewer) updated.name = cached.name;
                if (roleNewer) updated.role = cached.role;
                setUserData(updated);
                sessionStorage.setItem('user_session', JSON.stringify(updated))
                return
              }
            }
          } catch { /* ignorar */ }
        }
        
        setUserData(userData_)
        sessionStorage.setItem('user_session', JSON.stringify(userData_))
      } else {
        debug('⚠️ [App] Sin sesión activa, evento:', _event)
        authUserRef.current = null
        setIsLoggedIn(false)
        setUserData(null)
        sessionStorage.removeItem('user_session')
      }

      // Siempre marcar bootstrap como completado (con o sin sesión)
      setAuthBootstrapped(true)
    })

    // Detectar callback OAuth y limpiar URL
    const urlSearch = new URLSearchParams(window.location.search)
    const hashStr = window.location.hash
    const isOAuthCallback =
      urlSearch.has('code') ||
      hashStr.includes('access_token=') ||
      hashStr.includes('refresh_token=')

    let urlCleanTimer: ReturnType<typeof setTimeout> | null = null
    let oauthFallbackTimer: ReturnType<typeof setTimeout> | null = null

    if (isOAuthCallback) {
      console.warn('🔐 [App] Callback OAuth detectado en URL')
      // Limpiar URL después de 500ms (Supabase ya procesó el código/token antes)
      urlCleanTimer = setTimeout(() => {
        if (window.location.search || window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }, 500)

      // Fallback: si onAuthStateChange no disparó la sesión en 3 segundos,
      // llamar getSession() explícitamente (el auth lock ya estará libre)
      oauthFallbackTimer = setTimeout(async () => {
        if (authUserRef.current) return // ya hay sesión, no hace falta
        console.warn('🔐 [App] OAuth fallback: llamando getSession()...')
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user && !authUserRef.current) {
            console.warn('🔐 [App] OAuth fallback: sesión encontrada para', session.user.email)
            const userData_ = extractUserDataFromMeta(session.user)
            authUserRef.current = { id: session.user.id, email: userData_.email, name: userData_.name }
            setIsLoggedIn(true)
            setUserData(userData_)
            sessionStorage.setItem('user_session', JSON.stringify(userData_))
            setAuthBootstrapped(true)
          } else {
            console.warn('🔐 [App] OAuth fallback: sin sesión, posible error en intercambio PKCE')
          }
        } catch (err) {
          logError('🔐 [App] OAuth fallback error:', err)
        }
      }, 3000)
    }

    return () => {
      if (urlCleanTimer) clearTimeout(urlCleanTimer)
      if (oauthFallbackTimer) clearTimeout(oauthFallbackTimer)
      subscription?.unsubscribe()
    }
  }, [])

  // ══════════════════════════════════════════════════════════════════════
  // EFECTO 2: Sincronizar profile y rol real desde DB
  // ══════════════════════════════════════════════════════════════════════
  // Corre DESPUÉS de que auth bootstrap termina y el auth lock se libera.
  // Aquí SÍ podemos hacer REST calls sin riesgo de deadlock.
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!authBootstrapped || !isLoggedIn) return

    const authUser = authUserRef.current
    if (!authUser) return

    const syncProfile = async () => {
      try {
        // 1. Obtener el perfil completo desde DB (incluyendo nombre actualizado)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .single()
        
        if (profileError) {
          logError('⚠️ [App] Error obteniendo profile desde DB:', profileError.message, profileError)
          // Si no existe, crear uno básico
          const { error: insertError } = await supabase.from('profiles').insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.name,
            role: 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          if (insertError) {
            logError('⚠️ [App] Error creando profile:', insertError.message, insertError)
          }
          return
        }

        // 2. Actualizar userData con datos frescos de DB (nombre y rol)
        const dbRole = (profile?.role || 'student') as 'student' | 'instructor' | 'admin'
        const dbFullName = profile?.full_name || authUser.name
        
        console.warn('🔑 [App] Perfil desde DB:', { name: dbFullName, role: dbRole }, '| user:', authUser.email)
        
        // 🔑 IMPORTANTE: Asegurar que siempre actualizamos userData, incluso si prev es null
        setUserData(prev => {
          if (!prev) {
            // Si userData está null, crear uno nuevo con datos de DB
            debug(`📍 [App] userData era null, creando con rol: ${dbRole}`);
            return { email: authUser.email, name: dbFullName, role: dbRole };
          }
          // Si ya existe, actualizar con datos de DB
          if (prev.role !== dbRole || prev.name !== dbFullName) {
            debug(`📍 [App] Actualizando userData - rol: ${prev.role} → ${dbRole}, nombre: ${prev.name} → ${dbFullName}`);
          }
          return { ...prev, role: dbRole, name: dbFullName };
        })
        
        // 3. Actualizar sessionStorage con datos frescos
        const cached = sessionStorage.getItem('user_session')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            parsed.role = dbRole
            parsed.name = dbFullName
            sessionStorage.setItem('user_session', JSON.stringify(parsed))
          } catch { /* ignorar */ }
        }
        debug('✅ [App] Profile sincronizado para', authUser.email)
      } catch (err) {
        logError('⚠️ [App] Error sincronizando profile (exception):', err)
      }
    }

    syncProfile()
  }, [authBootstrapped, isLoggedIn])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Escuchar eventos de actualización de perfil desde UserProfile
  // Sincronizar sessionStorage además de userData
  useEffect(() => {
    const handleUserProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { fullName } = customEvent.detail;
      
      // 1. Actualizar userData con el nuevo nombre
      setUserData(prev => prev ? { ...prev, name: fullName } : prev);
      
      // 2. Sincronizar sessionStorage para evitar flash en F5
      try {
        const userSession = sessionStorage.getItem('user_session');
        if (userSession) {
          const parsed = JSON.parse(userSession);
          parsed.name = fullName;
          sessionStorage.setItem('user_session', JSON.stringify(parsed));
        }
      } catch { /* ignorar */ }
    };

    window.addEventListener('userProfileUpdated', handleUserProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleUserProfileUpdate);
  }, []);

  const handleNavigate = useCallback((page: string, courseId?: string, courseSlug?: string, lessonId?: string) => {
    // Proteger acceso al panel admin - solo usuarios con rol admin
    if (page === 'admin') {
      if (!isLoggedIn || !userData || userData.role !== 'admin') {
        toast.error('Acceso denegado. Solo administradores pueden acceder al panel admin.');
        return;
      }
    }
    
    // 🔧 Actualizar URL inmediatamente ANTES de cambiar el estado
    // Esto previene que la URL antigua permanezca mientras React se actualiza
    if (page === 'home') {
      window.history.pushState(null, "", "/");
      lastUrlUpdateRef.current = { page: 'home' as Page, timestamp: Date.now() };
    } else if (page === 'admin') {
      window.history.pushState(null, "", "/admin/panel");
      lastUrlUpdateRef.current = { page: 'admin' as Page, timestamp: Date.now() };
    } else if (page === 'catalog') {
      window.history.pushState(null, "", "/cursos");
      lastUrlUpdateRef.current = { page: 'catalog' as Page, timestamp: Date.now() };
    } else if (page === 'profile' && userData) {
      // Perfil: /perfil/username
      const userId = userData.email.split('@')[0];
      window.history.pushState(null, "", `/perfil/${userId}`);
      lastUrlUpdateRef.current = { page: 'profile' as Page, timestamp: Date.now() };
    } else if (page === 'course' && courseSlug) {
      // Curso: /curso/nombre-del-curso
      window.history.pushState(null, "", `/curso/${courseSlug}`);
      lastUrlUpdateRef.current = { page: 'course' as Page, timestamp: Date.now() };
    } else if (page === 'lesson' && courseSlug && lessonId) {
      // Lección: /curso/nombre-del-curso/leccion/1
      window.history.pushState(null, "", `/curso/${courseSlug}/leccion/${lessonId}`);
      lastUrlUpdateRef.current = { page: 'lesson' as Page, timestamp: Date.now() };
    } else if (page === 'evaluation' && courseSlug) {
      // Evaluación: /curso/nombre-del-curso/evaluacion
      window.history.pushState(null, "", `/curso/${courseSlug}/evaluacion`);
      lastUrlUpdateRef.current = { page: 'evaluation' as Page, timestamp: Date.now() };
    } else if (page === 'checkout' && courseSlug) {
      // Checkout: /checkout/nombre-del-curso
      window.history.pushState(null, "", `/checkout/${courseSlug}`);
      lastUrlUpdateRef.current = { page: 'checkout' as Page, timestamp: Date.now() };
    } else if (page === 'about') {
      // Sobre Nosotros: /sobre-nosotros
      window.history.pushState(null, "", "/sobre-nosotros");
      lastUrlUpdateRef.current = { page: 'about' as Page, timestamp: Date.now() };
    } else if (page === 'contact') {
      // Contacto: /contacto
      window.history.pushState(null, "", "/contacto");
      lastUrlUpdateRef.current = { page: 'contact' as Page, timestamp: Date.now() };
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
          <Evaluation onNavigate={handleNavigate} courseId={currentCourseId} courseSlug={currentCourseSlug} />
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
          {currentPage === "reset-password" && <ResetPasswordPage onNavigate={handleNavigate} />}
        </Suspense>
      </main>

      <AppFooter onNavigate={handleNavigate} />
      
      <Toaster />
    </div>
  );
}
