import { supabase } from "../lib/supabase";
import { debug, info, warn, error as logError } from '../lib/logger'

/**
 * Función de debug para verificar el estado de la sesión de Supabase
 */
export async function debugSupabaseSession() {
  debug("=== DEBUG SUPABASE SESSION ===");

  // 1. Verificar sesión actual (con manejo de errores)
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    debug("Session:", sessionData);
    if (sessionError) warn("Session Error:", sessionError);
  } catch (err) {
    logError("❌ Error obteniendo session (getSession):", err);
  }

  // 2. Verificar usuario actual
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    debug("User:", userData);
    if (userError) warn("User Error:", userError);
  } catch (err) {
    logError("❌ Error obteniendo user (getUser):", err);
  }

  // 3. Verificar localStorage (con protección)
  try {
    const localStorageKeys = Object.keys(localStorage).filter((key) =>
      key.includes('supabase') || key.includes('auth')
    );
    debug("LocalStorage Keys:", localStorageKeys);
    localStorageKeys.forEach((key) => {
      try {
        debug(`${key}:`, localStorage.getItem(key));
      } catch (err) {
        logError(`❌ Error leyendo localStorage[${key}]:`, err);
      }
    });
  } catch (err) {
    logError("❌ Error accediendo a localStorage:", err);
  }

  // 4. Test de conexión simple
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .limit(1);

    debug("Test Query Result:", data);
    if (error) warn("Test Query Error:", error);
  } catch (err) {
    logError("❌ Test Query Exception:", err);
  }

  debug("=== END DEBUG ===");
}

/**
 * Limpia completamente la sesión y el caché local
 */
export async function clearSupabaseSession() {
  debug("Limpiando sesión de Supabase...");
  
  // 1. Sign out
  await supabase.auth.signOut();
  
  // 2. Limpiar localStorage relacionado con Supabase
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    debug(`Removed: ${key}`);
  });
  
  // 3. Limpiar sessionStorage
  const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    debug(`Removed from sessionStorage: ${key}`);
  });
  
  debug("Sesión limpiada. Recarga la página para continuar.");
}
