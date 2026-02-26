
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/globals.css";
  import "./index.css";

  // ✅ Desregistrar cualquier Service Worker existente para evitar caché agresivo
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister().then(ok => {
          if (ok) console.log('[SW] Service Worker desregistrado:', registration.scope);
        });
      }
    });
  }

  // Inicialización limpia
  createRoot(document.getElementById("root")!).render(<App />);
  
