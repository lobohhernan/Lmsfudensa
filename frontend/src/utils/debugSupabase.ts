import { supabase } from "../lib/supabase";

/**
 * Función de debug para verificar el estado de la sesión de Supabase
 */
export async function debugSupabaseSession() {
  console.log("=== DEBUG SUPABASE SESSION ===");
  
  // 1. Verificar sesión actual
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log("Session:", sessionData);
  console.log("Session Error:", sessionError);
  
  // 2. Verificar usuario actual
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log("User:", userData);
  console.log("User Error:", userError);
  
  // 3. Verificar localStorage
  const localStorageKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  console.log("LocalStorage Keys:", localStorageKeys);
  localStorageKeys.forEach(key => {
    console.log(`${key}:`, localStorage.getItem(key));
  });
  
  // 4. Test de conexión simple
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .limit(1);
    
    console.log("Test Query Result:", data);
    console.log("Test Query Error:", error);
  } catch (err) {
    console.error("Test Query Exception:", err);
  }
  
  console.log("=== END DEBUG ===");
}

/**
 * Limpia completamente la sesión y el caché local
 */
export async function clearSupabaseSession() {
  console.log("Limpiando sesión de Supabase...");
  
  // 1. Sign out
  await supabase.auth.signOut();
  
  // 2. Limpiar localStorage relacionado con Supabase
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  // 3. Limpiar sessionStorage
  const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`Removed from sessionStorage: ${key}`);
  });
  
  console.log("Sesión limpiada. Recarga la página para continuar.");
}
