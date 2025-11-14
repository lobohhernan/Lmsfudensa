
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // LIMPIEZA: Borrar localStorage cache corrupto
  console.log('🧹 Limpiando localStorage cache...');
  const keysToRemove = ['lms_courses', 'lms_users', 'lms_lessons', 'lms_evaluations', 'lms_app_version', 'lms_last_sync'];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removiendo cache obsoleto: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Register service worker for aggressive cache management
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // Check for updates every time the page loads
          registration.update();
          
          // Listen for new service worker waiting to activate
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available, prompt user to reload
                  if (confirm('Nueva versión disponible. ¿Recargar para actualizar?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  
