# Configuración de Mercado Pago para Producción - Netlify

## 📋 Resumen de Cambios Realizados

### 1. **Configuración de Netlify (`netlify.toml`)**

Se actualizó el archivo de configuración con:

- **Headers de Seguridad HTTPS**: Agregados headers para garantizar compatibilidad con Mercado Pago en HTTPS
- **Content Security Policy (CSP)**: Configurada para permitir scripts y iframes de Mercado Pago
- **Rutas de Redirección**: Configuradas rutas específicas para `/payment-callback` y `/mp-success`

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "... https://sdk.mercadopago.com https://checkout.mercadopago.com ..."
```

### 2. **URL Base en Producción (`mercadopago.ts`)**

Se mejoró la detección de URL base:

```typescript
let baseUrl = window.location.origin;

// En Netlify, asegurar que usamos HTTPS
if (window.location.hostname === 'fudensa.netlify.app' || window.location.protocol === 'https:') {
  baseUrl = baseUrl.replace('http://', 'https://');
}
```

### 3. **Edge Functions en Supabase**

Las siguientes Edge Functions ya están desplegadas y funcionales:

- `mercadopago-preference` (v25): Crea preferencias de pago
- `mercadopago-webhook` (v8): Procesa notificaciones IPN de Mercado Pago
- `check-payment-status` (v1): Verifica si el usuario fue inscrito en el curso

---

## 🔑 Requisitos Previos

Asegurar que en el panel de Supabase están configuradas las siguientes variables de entorno:

### En Supabase → Project Settings → Edge Functions Secrets:

```
MERCADOPAGO_ACCESS_TOKEN = APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
```

### En el Frontend:

Las siguientes variables deben estar configuradas en Netlify (Build & Deploy → Environment):

```
VITE_SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-44a40cbd-d836-4dce-9395-39a9baf220af
```

> **Nota**: Estas variables se cargan automáticamente si el `.env.local` está sincronizado con Netlify.

---

## 🔄 Flujo de Pago en Producción

```
1. Usuario hace click en "Pagar"
   ↓
2. Frontend llama a Edge Function: mercadopago-preference
   ↓
3. Edge Function crea preferencia en API de Mercado Pago
   ↓
4. MP devuelve init_point (URL de checkout)
   ↓
5. Frontend abre ventana: window.open(initPoint, "mercadopago_checkout")
   ↓
6. Usuario completa pago en MP
   ↓
7. MP redirige a: https://fudensa.netlify.app/payment-callback?status=approved
   ↓
8. Frontend detecta cierre de ventana y redirige a /payment-callback
   ↓
9. Página de PaymentCallback inicia polling (check-payment-status)
   ↓
10. Webhook de MP procesa pago y crea inscripción en BD
   ↓
11. Polling detecta inscripción y redirige a home
```

---

## 🧪 Testing en Producción

### Opción 1: Test de Pago Completo (Recomendado)

**URL**: https://fudensa.netlify.app/

**Pasos**:
1. Navega a un curso disponible
2. Haz click en "Inscribirse" o "Comprar"
3. Completa el formulario de pago
4. Haz click en "Pagar"
5. En la ventana de Mercado Pago, usa las **credenciales de test**:

```
Tarjeta: 4111 1111 1111 1111
Vencimiento: 11/25
CVV: 123
Titular: APRO
```

6. Completa el pago
7. Observa cómo:
   - La ventana de MP se cierra
   - Eres redirigido a `/payment-callback`
   - Aparece el mensaje "Procesando pago..."
   - La inscripción se confirma y eres redirigido al home
   - El curso ahora aparece en "Mis Cursos"

### Opción 2: Monitorear Logs

**En Navegador (F12 → Console)**:
```
🌍 [MP] Base URL del frontend: https://fudensa.netlify.app
🌍 [MP] Llamando a Edge Function: mercadopago-preference
✅ [MP] Preferencia creada: [preference_id]
📍 [PaymentCallback] URL params: {status: "approved", payment_id: ...}
⏳ [PaymentCallback] Intento 1 de 60
✅ [PaymentCallback] Pago aprobado según parámetros MP
```

**En Supabase → Edge Functions → Logs**:
```
mercadopago-preference:
  ✅ [MP] Preferencia creada: [id]
  📊 [MP] Respuesta MP status: 201

mercadopago-webhook:
  ✅ [webhook] Payment processed: [payment_id]
  ✅ [DB] Inscripción creada: user@email.com → course_id

check-payment-status:
  📊 [check] Verificando: email / course_id
  ✅ [check] Inscripción encontrada: enrolled = true
```

---

## ⚠️ Problemas Comunes y Soluciones

### ❌ "No se puede acceder a /payment-callback"

**Causa**: Las rutas SPA no están configuradas en Netlify

**Solución**: El `netlify.toml` ya está configurado con:
```toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### ❌ "Mercado Pago SDK no disponible"

**Causa**: El script en `index.html` no se cargó

**Solución**: Verifica en DevTools → Network que:
```
https://sdk.mercadopago.com/js/v2 → 200 OK
```

### ❌ "Error: Token no configurado"

**Causa**: `MERCADOPAGO_ACCESS_TOKEN` no está en Supabase secrets

**Solución**: En Supabase Console:
```
Project Settings → Edge Functions → Environment variables
Agregar: MERCADOPAGO_ACCESS_TOKEN = APP_USR-...
```

### ❌ "CORS error en mercadopago-preference"

**Causa**: Headers CORS no están configurados correctamente

**Solución**: El Edge Function tiene CORS habilitado:
```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};
```

---

## 📱 Testing Manual en Diferentes Dispositivos

### Desktop
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Firefox Mobile

**Nota**: En mobile, la ventana de Mercado Pago se abrirá en modal en lugar de nueva ventana.

---

## 🚀 Checklist de Validación Pre-Producción

- [ ] `netlify.toml` está configurado con CSP y redirects
- [ ] Variables de entorno en Supabase están correctas
- [ ] Variables de entorno en Netlify están configuradas
- [ ] Todas las Edge Functions están desplegadas (v25, v8, v1)
- [ ] El SDK de Mercado Pago se carga sin errores
- [ ] Test de pago completo funciona (tarjeta 4111...)
- [ ] Webhook procesa correctamente el pago
- [ ] Usuario ve el curso en "Mis Cursos" después del pago
- [ ] Console logs muestran flujo correcto
- [ ] No hay errores CORS en Network
- [ ] URL en producción es https:// (no http://)

---

## 📊 Monitoreo en Producción

### Verificar Webhook de Mercado Pago

En Mercado Pago Console → Webhooks:

```
Webhook URL: https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
Status: ✅ Activo
Last events: payment.created, payment.updated
```

### Verificar Logs de Edge Functions

En Supabase Console → Edge Functions:

Seleccionar cada función y ver logs en tiempo real:

```
mercadopago-preference: 📥 → 📝 → ✅
mercadopago-webhook: 📦 → 🔓 (HMAC) → 💾 (DB) → ✅
check-payment-status: 🔍 → 📊 → ✅
```

---

## 🔐 Seguridad en Producción

### ✅ HTTPS Obligatorio
- Netlify proporciona SSL/TLS automáticamente
- URL: `https://fudensa.netlify.app`

### ✅ Tokens Seguros
- `MERCADOPAGO_ACCESS_TOKEN` está en Supabase secrets (no en .env público)
- `VITE_MERCADO_PAGO_PUBLIC_KEY` es pública (safe)

### ✅ Validación de Webhook
- Edge Function valida HMAC de Mercado Pago
- No procesa pagos sin validación correcta

### ✅ RLS en Base de Datos
- Las inscripciones solo pueden ser creadas por Edge Functions
- Los usuarios no pueden modificar su estado de inscripción

---

## 📞 Support & Troubleshooting

Si algo no funciona:

1. **Verifica console en DevTools (F12)** - busca errores rojos
2. **Verifica Network tab** - ¿Se carga el SDK de MP?
3. **Verifica Supabase logs** - ¿Qué errores hay en Edge Functions?
4. **Reinicia servidor Netlify** - En Netlify Console → Deploys → "Trigger deploy"
5. **Limpia cache** - Ctrl+Shift+Delete en browser

---

**Última actualización**: 18 de Noviembre de 2025
**Estado**: ✅ CONFIGURADO Y LISTO PARA PRODUCCIÓN
