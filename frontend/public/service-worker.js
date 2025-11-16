/**
 * Service Worker DESHABILITADO
 * Optimización: Sin caché para reducir uso de almacenamiento
 * La app funciona completamente sin service worker
 */

// Install: activar inmediatamente y limpiar todo
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker deshabilitado - limpiando caches');
  self.skipWaiting();
});

// Activate: eliminar TODOS los caches y desregistrarse
self.addEventListener('activate', (event) => {
  console.log('[SW] Limpiando todos los caches existentes');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Eliminando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Todos los caches eliminados');
      return self.clients.claim();
    }).then(() => {
      // Desregistrar este service worker
      return self.registration.unregister();
    })
  );
});

/**
 * Service Worker DESHABILITADO
 * Optimización: Sin caché para reducir uso de almacenamiento
 * La app funciona completamente sin service worker
 */

// Install: activar inmediatamente y limpiar todo
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker deshabilitado - limpiando caches');
  self.skipWaiting();
});

// Activate: eliminar TODOS los caches y desregistrarse
self.addEventListener('activate', (event) => {
  console.log('[SW] Limpiando todos los caches existentes');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Eliminando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Todos los caches eliminados');
      return self.clients.claim();
    }).then(() => {
      // Desregistrar este service worker
      return self.registration.unregister();
    })
  );
});

// Fetch: NO cachear nada - bypass total
self.addEventListener('fetch', (event) => {
  // Dejar pasar todas las peticiones sin interceptar
  return;
});
