
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/globals.css";
  import "./index.css";

  // Desregistrar service workers antiguos que puedan interferir con las requests
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) console.log('[SW] Service worker antiguo desregistrado');
        });
      }
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  
