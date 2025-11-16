
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Inicialización limpia sin service worker para reducir caché
  createRoot(document.getElementById("root")!).render(<App />);
  
