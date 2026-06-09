# Guía Magistral: Desglose Completo de Funciones por Página

## Estructura
Recorremos el proyecto página a página, componente a componente, función a función.
Cada sección explica QUÉ hace, DÓNDE está, CÓMO funciona, y muestra fragmentos comentados.

---

## PÁGINA 1: Home (Pantalla Principal)

### ¿Qué es Home?
Es la landing page/dashboard del proyecto. Muestra:
- Hero section con llamada a acción
- Sección "Continuar Aprendiendo" (solo logueados) con progreso real
- Cursos destacados filtrados y activos
- Beneficios de la plataforma

### Flujo visual del usuario
1. Llega a home sin login → ve Hero + Cursos destacados
2. Llega logueado → ve Hero + Cursos en progreso + Cursos destacados

---

## FUNCIÓN 1: scrollToContinueLearning()

**Propósito:**
Centrar la vista en la sección "Continuar Aprendiendo" con animación suave cuando el usuario logueado hace click en el botón "Continuar Aprendiendo".

**Ubicación:**
[frontend/src/pages/Home.tsx](frontend/src/pages/Home.tsx#L28-L54)

**Flujo paso a paso:**
1. Obtiene referencia al div de la sección mediante useRef
2. Calcula posición objetivo en viewport
3. Centra esa sección en la pantalla (no solo llega al tope)
4. Aplica easing cubic (ease-in-out) para movimiento suave
5. Anima con requestAnimationFrame durante 1 segundo

**Entradas y salidas:**
- Entradas: ninguna (usa continueLearningSectionRef como estado)
- Salidas: efecto secundario window.scrollTo() animado
- Estado compartido: continueLearningSectionRef (useRef)

**Riesgo típico para defensa:**
- Si ref es null → la función debería salir sin error
- Si se llama múltiples veces → puede haber múltiples animaciones superpuestas

**Fragmento comentado:**
```typescript
const scrollToContinueLearning = () => {
  if (!continueLearningSectionRef.current) return; // seguridad: ref puede no existir
  
  const targetElement = continueLearningSectionRef.current;
  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = 1000; // milisegundos
  
  let start: number | null = null;
  const smoothScroll = (currentTime: number) => {
    if (start === null) start = currentTime; // primer frame
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1); // 0 a 1
    
    // ease-in-out: acelera al inicio, desacelera al final
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : -1 + (4 - 2 * progress) * progress;
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    if (elapsed < duration) {
      requestAnimationFrame(smoothScroll); // recursión hasta completar
    }
  };
  
  requestAnimationFrame(smoothScroll); // inicia la animación
};
```

**Cómo justificar ante jurado:**
"Prioricé UX sin depender de librerías externas. El scroll centrado reduce fricción: el usuario ve directamente el progreso que logró sin buscar en la página. La easing suave mejora la experiencia visual y es un detalle que humaniza la interfaz."

---

## FUNCIÓN 2: displayCourses (useMemo)

**Propósito:**
Derivar una lista de cursos limpia (solo activos, máx 3) para mostrar en la sección de "Cursos Destacados" sin recalcular en cada render.

**Ubicación:**
[frontend/src/pages/Home.tsx](frontend/src/pages/Home.tsx#L65-L78)

**Flujo paso a paso:**
1. Filtra allCourses dejando solo is_active !== false
2. Toma solo los 3 primeros (slice)
3. Mapea cada curso a un shape cómodo para UI
4. Memoriza el resultado: si allCourses no cambió, no recalcula
5. La lista queda lista para renderizar en grid

**Entradas y salidas:**
- Entradas: allCourses (array de Course)
- Salidas: displayCourses (array memoizado de { id, title, slug, image, duration, level, certified, students })
- Dependencia: [allCourses] (si cambia, recalcula)

**Riesgo típico para defensa:**
- Si allCourses es [] → displayCourses es []
- Si todos los cursos tienen is_active === false → displayCourses es []
- No hay fallback automático; debe manejarse en UI

**Fragmento comentado:**
```typescript
const displayCourses = useMemo(() => 
  allCourses
    .filter(course => course.is_active !== false) // excluye inactivos
    .slice(0, 3) // solo primeros 3
    .map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      image: course.image || "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200", // fallback
      duration: course.duration || "8 horas", // default si falta
      level: (course.level || "Básico") as "Básico" | "Intermedio" | "Avanzado",
      certified: course.certified || false,
      students: course.students,
    })),
  [allCourses] // recalcula solo si allCourses cambia
);
```

**Cómo justificar ante jurado:**
"useMemo previene renders innecesarios cuando el padre se redibuja sin cambiar datos. Es una micro-optimización pero suma en páginas con muchos rerenderes. Además, normalizo datos aquí: fallbacks de image, duration, level hacen que los componentes UI sean más robustos."

---

## FUNCIÓN 3: useCoursesRealtime() - Hook completo

**Propósito:**
Cargar cursos desde Supabase en dos etapas (activos primero, inactivos después) y suscribirse a cambios en tiempo real para mantener la lista siempre sincronizada.

**Ubicación:**
[frontend/src/hooks/useCoursesRealtime.ts](frontend/src/hooks/useCoursesRealtime.ts)

**Flujo paso a paso:**
1. **Etapa 1 (useEffect)**: Inicia fetchActiveCourses() y crea subscription realtime
2. **Etapa 2 (fetchActiveCourses)**: Query a DB con is_active=true, normaliza, setea loading=false
3. **Etapa 3 (fetchInactiveCourses)**: Diferido, query inactivos y anexa al final
4. **Etapa 4 (subscription)**: Escucha INSERT/UPDATE/DELETE y reordena lista
5. **Cleanup**: Removes channel y marca mountedRef.current = false

**Entradas y salidas:**
- Entradas: ninguna (autónomo, usa supabase)
- Salidas: { courses, loading, inactiveLoading, error, refetch }
- Estados internos: courses, loading, inactiveLoading, error, mountedRef

**Riesgo típico para defensa:**
- setState tras unmount → se previene con mountedRef.current check
- Errores transitorios de red → se reintenta con exponential backoff
- Realtime connection fail → app sigue funcionando (es una mejora, no bloqueante)

**Fragmento comentado (fetchActiveCourses):**
```typescript
const fetchActiveCourses = async (retryCount = 0) => {
  try {
    setLoading(true); // muestra spinner
    console.log('📡 Fetching active courses...');
    
    const { data, error: queryError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true) // filter key: solo activos
      .order('created_at', { ascending: false }); // más nuevos primero
    
    if (!mountedRef.current) return; // seguridad: evita setState si unmounted
    if (queryError) throw queryError;
    
    const processed = (data || []).map(course => ({
      ...course,
      is_active: true, // normaliza
      students: course.students && course.students > 0 ? course.students : undefined,
    }));
    
    setCourses(processed); // actualiza estado
    setError(null); // limpia error anterior
    console.log(`✅ ${processed.length} active courses loaded`);
    
    // Stage 2: cargar inactivos de forma deferred (no bloquean el render)
    fetchInactiveCourses();
  } catch (err) {
    if (!mountedRef.current) return;
    
    const isTransient = err instanceof Error && err.message.includes('Failed to fetch');
    if (isTransient && retryCount < MAX_RETRIES) {
      setTimeout(() => {
        if (mountedRef.current) fetchActiveCourses(retryCount + 1);
      }, RETRY_DELAY);
      return;
    }
    
    setError(err instanceof Error ? err.message : 'Error fetching courses');
  } finally {
    if (mountedRef.current) setLoading(false);
  }
};
```

**Cómo justificar ante jurado:**
"Staged loading mejora tiempo percibido: el usuario ve cursos activos de inmediato sin esperar inactivos (que casi nunca se necesitan). La suscripción realtime mantiene el catálogo sincronizado sin recargar. El manejo de errores transitorios + mountedRef previene memory leaks, que es crítico en SPAs de larga duración."

---

## FUNCIÓN 4: useEnrollmentProgress() - Hook de progreso

**Propósito:**
Cargar los cursos donde el usuario está inscrito y calcular su progreso real (%) en cada uno sin patrón N+1.

**Ubicación:**
[frontend/src/hooks/useEnrollmentProgress.ts](frontend/src/hooks/useEnrollmentProgress.ts)

**Flujo paso a paso:**
1. Si no logueado → retorna vacío
2. Obtiene usuario autenticado de Supabase
3. Query enrollments del usuario con JOIN a courses
4. Para CADA enrollment, calcula progreso en paralelo (3 queries a la vez)
5. Retorna array de EnrollmentWithProgress con { progress %, currentLesson, totalLessons, completedLessons }

**Entradas y salidas:**
- Entradas: isLoggedIn (bool), limit (number opcional)
- Salidas: { courses, loading, error, refetch }
- Tipos: EnrollmentWithProgress[]

**Riesgo típico para defensa:**
- Patrón N+1: si hiciera queries secuenciales sería lento
- Inconsistencia temporal: Promise.all puede traer datos de momentos diferentes
- RLS: si el usuario no tiene permiso a enrollments, query falla

**Fragmento comentado (computeEnrollmentProgress):**
```typescript
async function computeEnrollmentProgress(
  userId: string,
  enrollment: Enrollment
): Promise<EnrollmentWithProgress> {
  const courseId = enrollment.course_id;
  
  // ✅ 3 queries EN PARALELO (no secuencial)
  const [totalResult, completedResult, lastLessonResult] = await Promise.all([
    // Query 1: cuántas lecciones hay en total
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true }) // count=exact es eficiente
      .eq('course_id', courseId),
    
    // Query 2: cuántas completó el usuario
    supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true),
    
    // Query 3: última lección que vio (para mostrar "Lección actual")
    supabase
      .from('user_progress')
      .select('lesson_id, lessons(title)')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('last_accessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  
  // Cálculos seguros con fallbacks
  const total = totalResult.count || 0;
  const completed = (completedResult as any).count || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const currentLesson = (lastLessonResult as any)?.data?.lessons?.title || 'Lección 1';
  
  return {
    id: courseId,
    title: enrollment.courses?.title || 'Curso sin título',
    slug: enrollment.courses?.slug || '',
    image: enrollment.courses?.image || 'fallback-url',
    progress,
    currentLesson,
    totalLessons: total,
    completedLessons: completed,
  };
}
```

**Cómo justificar ante jurado:**
"Promise.all paraleliza 3 queries que antes se hacían secuenciales. Para 10 enrollments, esto es 3 queries vs 30 queries. La mejora de latencia es enorme. Aceptamos pequeña desincronía temporal (datos pueden venir de momentos ligeramente diferentes) porque UX de progreso no exige precisión exacta y se sincroniza en recargas."

---

## PÁGINA 2: Navbar (Navegación Principal)

### ¿Qué es AppNavbar?
Es el componente de navegación global de la app. Controla:
- Navegación entre páginas públicas
- Estado visual del header (transparente/sólido según scroll o página)
- Menú móvil animado
- Acceso a perfil, panel admin y logout
- Modal de login/registro + OAuth Google

### Flujo visual del usuario
1. Usuario no logueado: ve botón Iniciar Sesión
2. Usuario logueado: ve avatar + menú de usuario
3. En mobile: abre/cierra menú con animación

---

## FUNCIÓN 1: handleNavigate() local (Navbar)

**Propósito:**
Encapsular la navegación desde el navbar hacia App sin duplicar onNavigate en cada botón.

**Ubicación:**
[frontend/src/components/AppNavbar.tsx](frontend/src/components/AppNavbar.tsx#L82)

**Flujo paso a paso:**
1. Recibe el nombre de página
2. Llama al callback onNavigate del padre si existe
3. Es memoizada con useCallback para reducir renders

**Entradas y salidas:**
- Entrada: page (string)
- Salida: side effect de navegación vía callback

**Riesgo típico para defensa:**
- Si onNavigate no llega por props, el botón no navega (aunque no rompe)

**Fragmento comentado:**
```typescript
const handleNavigate = useCallback((page: string) => {
  onNavigate?.(page); // navegación delegada al App
}, [onNavigate]); // se recrea solo si cambia el callback padre
```

**Cómo justificar ante jurado:**
"Centralizo la intención de navegación en una sola función para evitar repetir lógica en todos los botones del navbar."

---

## FUNCIÓN 2: Estado visual del navbar (needsSolidNavbar + scrolled)

**Propósito:**
Decidir cuándo el navbar debe verse sólido (fondo azul) para legibilidad, según página actual o scroll.

**Ubicación:**
[frontend/src/components/AppNavbar.tsx](frontend/src/components/AppNavbar.tsx#L126)

**Flujo paso a paso:**
1. Define páginas que requieren navbar sólido siempre
2. Escucha scroll para detectar si el usuario avanzó
3. Cambia clase CSS dinámicamente en el `<nav>`

**Entradas y salidas:**
- Entradas: currentPage, scrollY
- Salida: clases visuales del navbar

**Riesgo típico para defensa:**
- Re-render excesivo por scroll, mitigado comparando estado anterior

**Fragmento comentado:**
```typescript
const solidNavbarPages = ["course", "checkout", "profile", "admin", "lesson", "evaluation"];
const needsSolidNavbar = solidNavbarPages.includes(currentPage);

useEffect(() => {
  const scrolledRef = { current: scrolled }; // evita setState repetido
  const handleScroll = () => {
    const isScrolled = window.scrollY > 20; // umbral visual
    if (isScrolled !== scrolledRef.current) {
      scrolledRef.current = isScrolled;
      setScrolled(isScrolled); // actualiza solo si cambió
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

**Cómo justificar ante jurado:**
"Mejoro accesibilidad visual: en páginas densas y al hacer scroll, el contraste del navbar se mantiene estable."

---

## FUNCIÓN 3: getUserInitials()

**Propósito:**
Generar iniciales del usuario para el AvatarFallback cuando no hay imagen.

**Ubicación:**
[frontend/src/components/AppNavbar.tsx](frontend/src/components/AppNavbar.tsx#L118)

**Flujo paso a paso:**
1. Si no hay nombre, devuelve "US"
2. Divide el nombre por espacios
3. Toma primera letra de cada palabra
4. Limita a 2 caracteres y convierte a mayúsculas

**Entradas y salidas:**
- Entrada: currentUser.name
- Salida: string con iniciales

**Riesgo típico para defensa:**
- Nombres con formatos raros (espacios múltiples) pueden producir iniciales no ideales

**Fragmento comentado:**
```typescript
const getUserInitials = () => {
  if (!currentUser?.name) return "US"; // fallback seguro
  return currentUser.name
    .split(" ")
    .map((n: string) => n[0]) // primera letra de cada palabra
    .join("")
    .substring(0, 2) // máximo 2 letras
    .toUpperCase();
};
```

**Cómo justificar ante jurado:**
"Aseguro continuidad visual del perfil aunque no exista foto cargada."

---

## FUNCIÓN 4: Login submit (signInWithPassword + profile)

**Propósito:**
Autenticar al usuario con Supabase, traer perfil (nombre/rol) y sincronizar estado global de sesión.

**Ubicación:**
[frontend/src/components/AppNavbar.tsx](frontend/src/components/AppNavbar.tsx#L407)

**Flujo paso a paso:**
1. Valida campos email/password
2. Ejecuta `supabase.auth.signInWithPassword`
3. Si auth ok, consulta tabla `profiles`
4. Arma objeto de usuario y llama `onLogin`
5. Cierra modal y muestra toast de éxito

**Entradas y salidas:**
- Entradas: login-email, login-password
- Salidas: onLogin({ email, name, role }), cierre de modal

**Riesgo típico para defensa:**
- Si falla query de profile, existe fallback (nombre desde email y rol student)

**Fragmento comentado:**
```typescript
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (authError || !authData.user) {
  toast.error("Email o contraseña incorrectos");
  return;
}

const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, email, role")
  .eq("id", authData.user.id)
  .single();

onLogin?.({
  email,
  name: profile?.full_name || email.split('@')[0], // fallback
  role: profile?.role || 'student',
});
```

**Cómo justificar ante jurado:**
"Separé autenticación (Auth) de datos de perfil (tabla profiles) para mantener el dominio de usuario extensible y con roles." 

---

## FUNCIÓN 5: Registro + creación de profile

**Propósito:**
Crear cuenta nueva, validar reglas básicas, persistir perfil y auto-login para reducir fricción.

**Ubicación:**
[frontend/src/components/AppNavbar.tsx](frontend/src/components/AppNavbar.tsx#L536)

**Flujo paso a paso:**
1. Valida contraseña y confirmación
2. Ejecuta `supabase.auth.signUp`
3. Inserta registro en `profiles` con rol `student`
4. Hace auto-login con signInWithPassword
5. Llama `onLogin`, cierra modal y notifica éxito

**Entradas y salidas:**
- Entradas: name, email, password, confirmPassword
- Salidas: sesión iniciada y estado global actualizado

**Riesgo típico para defensa:**
- Error de duplicate key en profiles se maneja sin bloquear flujo

**Fragmento comentado:**
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: name } },
});
if (authError || !authData.user) return;

await supabase.from("profiles").insert([{
  id: authData.user.id,
  email,
  full_name: name,
  role: "student", // rol inicial por defecto
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}]);

await supabase.auth.signInWithPassword({ email, password }); // auto-login
onLogin?.({ email, name, role: "student" });
```

**Cómo justificar ante jurado:**
"Optimicé onboarding: tras registro exitoso, el usuario entra directo sin pasos extra."

---

## Continuará...
Próximas secciones:
- CURSO DETAIL PAGE
- LECCIÓN PLAYER PAGE
- CHECKOUT FLOW
- BACKEND: Edge Functions y RLS

¿Quieres que continúe con Course Detail?
