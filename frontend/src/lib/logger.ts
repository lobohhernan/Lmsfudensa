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

export default {
  debug,
  info,
  warn,
  error,
}
