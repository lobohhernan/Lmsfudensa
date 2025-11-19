# 🚀 Deploying mercadopago-preference Edge Function

## El Problema CORS que Encontramos

El navegador envía un header `cache-control` que no estaba permitido en CORS.

**Error antes:**
```
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Error después:**
```
Request header field cache-control is not allowed by Access-Control-Allow-Headers
```

## La Solución ✅

He actualizado la función para aceptar `cache-control` en los headers CORS.

**Archivo modificado:** `backend/supabase/functions/mercadopago-preference/index.ts`

**Cambios:**
1. Agregué `Cache-Control` a `Access-Control-Allow-Headers`
2. Creé constante `CORS_HEADERS` reutilizable
3. Creé función helper `responseWithCORS()`
4. Todas las respuestas ahora incluyen headers CORS

## 📦 Cómo Deployar

### Opción 1: Usar Supabase Dashboard (Recomendado para Windows)

1. **Abre el dashboard:**
   - Va a: https://supabase.com/dashboard
   - Login con tu cuenta
   - Selecciona el proyecto `hztkspqunxeauawqcikw`

2. **Editar la función:**
   - Panel izquierdo → Edge Functions
   - Click en `mercadopago-preference`
   - Click en "Edit" (botón derecha arriba)

3. **Copiar el nuevo código:**
   - Abre: `backend/supabase/functions/mercadopago-preference/index.ts`
   - Copia TODO el contenido
   - Pega en el editor del dashboard

4. **Deploy:**
   - Click "Deploy" (botón verde abajo a la derecha)
   - Espera confirmación

### Opción 2: CLI (Si instalas Supabase CLI)

```bash
cd backend
supabase functions deploy mercadopago-preference
```

## ✅ Verificar que Funcionó

1. **Desde consola del navegador (F12):**
   - Ve a Checkout
   - Click "Comprar" → "Ir a Mercado Pago"
   - En consola deberías ver:
     ```
     📝 Creando preferencia de pago en backend...
     ✅ Preferencia creada: pref_...
     ```

2. **Ver Network Tab:**
   - F12 → Network
   - Click "Ir a Mercado Pago"
   - Busca request a `/mercadopago-preference`
   - Status debería ser `200 OK` (no 406)
   - Response headers deberían tener:
     ```
     access-control-allow-origin: *
     access-control-allow-headers: Content-Type, Authorization, Cache-Control
     ```

3. **Logs de Supabase:**
   - Dashboard → Edge Functions → `mercadopago-preference` → Logs
   - Deberías ver:
     ```
     ✅ Preferencia creada exitosamente: pref_...
     ```

## 🐛 Si Sigue Fallando

### Problema: Sigue diciendo 406 CORS error

**Causa:** La función no fue deployada correctamente

**Solución:**
1. Abre Supabase Dashboard
2. Edge Functions → mercadopago-preference
3. Click "Edit"
4. Borra TODO el código (Ctrl+A, Delete)
5. Copia y pega el código nuevo desde `backend/supabase/functions/mercadopago-preference/index.ts`
6. Click "Deploy"

### Problema: Error 500 en backend

**Causa:** Access Token no está configurado

**Solución:**
1. Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Verifica que exista `MERCADOPAGO_ACCESS_TOKEN`
4. Si no existe, créalo con tu token de MP

### Problema: Sigue sin funcionar después de todo

Intenta limpiar el cache del navegador:
- Ctrl + Shift + Delete
- Selecciona "Todas las cookies y datos de sitios"
- Click "Borrar datos"
- Recarga la página (Ctrl + F5)

## 📝 Archivo Actualizado

El archivo ya está actualizado localmente. Solo necesitas deployarlo en Supabase.

**Ubicación:** `backend/supabase/functions/mercadopago-preference/index.ts`

**Cambios resumidos:**
```typescript
// ANTES
const CORS_HEADERS = { /* Content-Type, Authorization */ }

// DESPUÉS
const CORS_HEADERS = { /* + Cache-Control */ }

// Ahora todas las respuestas usan:
responseWithCORS(data, status)
```

---

**¡Después de deployar, prueba nuevamente el checkout!** 🎉
