/**
 * ESTRATEGIA COMPLETA DE CACHÉ INTELIGENTE
 * 
 * ============================================
 * PROBLEMA ORIGINAL:
 * - Usuario accede a la app
 * - Cambio de versión en el servidor
 * - Navegador sirve código/datos antiguos del caché
 * - Usuario no ve cambios, se bloquea en acceso a cursos
 * 
 * ============================================
 * SOLUCIÓN IMPLEMENTADA:
 * 
 * 1. VERSIONAMIENTO (cacheManager.ts)
 *    - APP_VERSION: Cambiar cuando hagas deploy
 *    - Si version cambia → limpiar TODO el caché automáticamente
 * 
 * 2. TTL (Time To Live)
 *    - Cursos: 5 minutos
 *    - Usuarios: 10 minutos
 *    - Lecciones: 3 minutos
 *    - Datos viejos = refetch automático desde BD
 * 
 * 3. DETECCIÓN AUTOMÁTICA
 *    - Escucha cuando usuario regresa a la ventana (tab focus)
 *    - Verifica cada 30 segundos si hay nueva versión
 *    - Si otra pestaña actualiza versión → recarga automática
 * 
 * 4. COMPONENTE UI (CacheControl.tsx)
 *    - Muestra estado del caché en tiempo real
 *    - Botón manual para verificar versión
 *    - Botón para limpiar caché si usuario tiene problemas
 * 
 * 5. HOOKS (useSmartCache.ts)
 *    - useSmartCache(): Hook genérico
 *    - useCoursesWithCache(): Para cursos
 *    - useUsersWithCache(): Para usuarios
 *    - useLessonsWithCache(): Para lecciones
 * 
 * ============================================
 * CÓMO USARLO:
 * 
 * // En App.tsx
 * import { initCacheManager } from '@/lib/cacheManager'
 * 
 * useEffect(() => {
 *   initCacheManager()
 * }, [])
 * 
 * // En AdminPanel.tsx
 * import { useCoursesWithCache, useUsersWithCache } from '@/hooks/useSmartCache'
 * import { supabase } from '@/lib/supabase'
 * 
 * export function AdminPanel() {
 *   const courses = useCoursesWithCache(supabase)
 *   const users = useUsersWithCache(supabase)
 * 
 *   if (courses.loading) return <Loading />
 *   if (courses.error) return <Error error={courses.error} />
 *   
 *   return (
 *     <div>
 *       <CacheControl />
 *       {courses.data?.map(...)}
 *       <button onClick={courses.refetch}>Refrescar</button>
 *     </div>
 *   )
 * }
 * 
 * ============================================
 * FLUJO CUANDO CLIENTE TIENE PROBLEMA:
 * 
 * 1. Sistema detecta cambio de versión automáticamente
 * 2. Limpia todo localStorage
 * 3. Recarga la página sin caché
 * 4. Datos nuevos se cargan desde BD
 * 
 * Si el cliente no espera:
 * 5. Componente CacheControl visible en panel
 * 6. Click en "Limpiar caché" → refresh inmediato
 * 7. O aparece botón "Verificar versión" si algo está mal
 * 
 * ============================================
 * DEPLOYMENT / CAMBIO DE VERSIÓN:
 * 
 * Cuando despliegues cambios en PRODUCCIÓN:
 * 
 * 1. Abre cacheManager.ts
 * 2. Cambia APP_VERSION de '1.0.0' a '1.0.1' (o lo que sea)
 * 3. Commit + Push
 * 4. Deploy
 * 5. Al minuto, TODOS los clientes:
 *    - Detectan nueva versión
 *    - Limpian caché automáticamente
 *    - Se recargan sin datos corruptos
 *    - Ven los cambios nuevos
 * 
 * ============================================
 * VENTAJAS:
 * 
 * ✅ Automático: Usuario NO hace nada
 * ✅ Transparente: Recarga silenciosa en background
 * ✅ Manual: Si algo falla, botón para limpiar caché
 * ✅ Monitoreable: UI muestra estado del caché
 * ✅ Eficiente: No recarga si no es necesario (TTL)
 * ✅ Multi-pestaña: Si una pestaña actualiza versión, todas se recargan
 * ✅ Fallback: Si falla, usuario ve error claro (no página en blanco)
 * 
 * ============================================
 * ARCHIVOS CREADOS:
 * 
 * - frontend/src/lib/cacheManager.ts
 *   → Core de gestión de caché con versionamiento
 * 
 * - frontend/src/hooks/useSmartCache.ts
 *   → Hooks de React para usar en componentes
 * 
 * - frontend/src/components/CacheControl.tsx
 *   → Componente UI para visualizar/controlar caché
 * 
 * ============================================
 * PRÓXIMOS PASOS:
 * 
 * 1. Actualizar App.tsx para llamar initCacheManager()
 * 2. Actualizar AdminPanel.tsx para usar useCoursesWithCache()
 * 3. Actualizar CourseDetail.tsx para usar useLessonsWithCache()
 * 4. Agregar <CacheControl /> en AdminPanel
 * 5. Cuando hagas deploy → cambiar APP_VERSION
 * 
 * ============================================
 */

export const STRATEGY_DOCUMENTATION = true
