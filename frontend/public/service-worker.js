/**
 * Service Worker para gestión agresiva de cache
 * Limpia automáticamente todos los caches antiguos cuando se activa una nueva versión
 */

const CACHE_VERSION = 'v' + Date.now();
const CACHE_NAME = `lms-fudensa-${CACHE_VERSION}`;

// Install: preparar el nuevo service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker', CACHE_VERSION);
  // Force el nuevo SW a activarse inmediatamente
  self.skipWaiting();
});

// Activate: limpiar todos los caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las páginas abiertas inmediatamente
      return self.clients.claim();
    })
  );
});

// Fetch: estrategia Network First (siempre intenta red primero, cache como fallback)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NO cachear peticiones a APIs externas (Supabase, etc)
  // Solo cachear assets del mismo origen (JS, CSS, imágenes, fonts)
  const isExternalAPI = 
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/realtime/') ||
    url.pathname.startsWith('/storage/');
  
  // NO cachear nada que no sea del mismo origen (excepto assets conocidos)
  const isSameOrigin = url.origin === self.location.origin;
  
  // Si es una petición a API externa o no es GET, dejar pasar sin cachear
  if (isExternalAPI || !isSameOrigin || event.request.method !== 'GET') {
    // Bypass el service worker completamente para APIs
    return;
  }

  // Solo cachear assets estáticos del mismo origen (JS, CSS, imágenes, fonts, etc)
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/) ||
    url.pathname === '/' ||
    url.pathname.startsWith('/assets/');

  if (!isStaticAsset) {
    // No cachear HTML dinámico o rutas desconocidas
    return;
  }

  // Estrategia Network First para assets estáticos
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, intentar desde cache
        return caches.match(event.request);
      })
  );
});
