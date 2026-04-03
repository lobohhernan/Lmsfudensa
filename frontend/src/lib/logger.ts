// Pequeño logger que habilita mensajes verbosos solo en desarrollo
const isDev = Boolean(import.meta.env && import.meta.env.DEV)

export function debug(...args: unknown[]) {
  if (isDev) console.debug(...args)
}

export function info(...args: unknown[]) {
  if (isDev) console.info(...args)
}

export function warn(...args: unknown[]) {
  if (isDev) console.warn(...args)
}

export function error(...args: unknown[]) {
  // Always show errors in console (helpful in prod)
  console.error(...args)
}

/**
 * Extrae mensaje de error de manera segura
 * Maneja Error, string, y otros tipos desconocidos
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as Record<string, unknown>).message)
  }
  return 'Error desconocido'
}

export default {
  debug,
  info,
  warn,
  error,
  getErrorMessage,
}
