# 🧪 Guía de Testing: Flujo Completo de Pago Mercado Pago

## ✅ Pre-requisitos Verificados

- ✅ Edge Function `mercadopago-preference` desplegado (versión 24)
- ✅ Edge Function `check-payment-status` desplegado (nuevo)
- ✅ Edge Function `mercadopago-webhook` activo (versión 8)
- ✅ Frontend compilado sin errores críticos
- ✅ PaymentCallback.tsx implementado
- ✅ sessionStorage tracking implementado
- ✅ Rutas /payment-callback agregadas a App.tsx

---

## 🚀 Paso 1: Iniciar el Frontend

```bash
cd "d:\Educacion\UTN\IV Cuatrimestre\Trabajo Final\Lmsfudensa\frontend"
npm run dev
```

**Esperado:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Nota: Puede ser `localhost:3000` o `5173` según la configuración de Vite.

---

## 🏠 Paso 2: Navegar a un Curso

1. Abrir: `http://localhost:3000` (o el puerto que use)
2. Ir a **"Catálogo de Cursos"**
3. Seleccionar cualquier curso (ej: "Python Basics")
4. Click en **"Ver Curso"** → Abre la página del curso
5. Click en **"Comprar Curso"** → Abre página de Checkout

---

## 💳 Paso 3: Completar Datos de Pago

**En la página Checkout:**

1. Verificar que los datos sean correctos:
   - Nombre del curso: ✓
   - Precio: ✓
   - Email del usuario: ✓

2. Si es necesario, llenar campos adicionales:
   - Email: `tu-email@example.com`
   - Nombre: Tu nombre

3. **IMPORTANTE:** Observar la consola del navegador (F12):
   ```
   ✅ [MP] Iniciando pago...
   ✅ [MP] initPoint recibido: https://www.mercadopago.com.ar/checkout/v1/...
   ✅ Redirigiendo a Mercado Pago...
   ```

---

## 🎯 Paso 4: Hacer Clic en "Comprar"

**Esperado:**

1. Se muestra loader "Procesando..."
2. Se abre **Mercado Pago Checkout** en una nueva ventana o tab
3. Consola muestra:
   ```
   📍 initPoint recibido: https://www.mercadopago.com.ar/checkout/v1/...
   🔄 Redirigiendo a Mercado Pago...
   ```

### Si aparece Error 400:

```
❌ Error MP: "auto_return invalid. back_url.success must be defined"
```

**Significa:** La versión desplegada aún tiene el campo `auto_return`.  
**Solución:** Revisar que `mercadopago-preference` versión sea 24 o superior.

---

## 💰 Paso 5: Completar Pago en Mercado Pago

**En el checkout de Mercado Pago:**

### Opción A: Usar Tarjeta Test (Recomendado)

1. Seleccionar **"Tarjeta de Crédito"**

2. Completar formulario:
   ```
   Número de tarjeta: 4111 1111 1111 1111
   Nombre: [Tu nombre o cualquiera]
   Email: tu-email@example.com
   Fecha de vencimiento: 11/25 (o cualquier fecha futura)
   CVV: 123 (o cualquier 3 dígitos)
   ```

3. Click en **"Pagar"** o **"Confirmar Pago"**

### Resultado esperado en test mode:

```
✅ Pago completado exitosamente
Estado: APPROVED
Payment ID: 1234567890
```

---

## 🔄 Paso 6: Pantalla PaymentCallback

**Después de completar el pago en Mercado Pago:**

1. **Automáticamente redirigido a:** `http://localhost:3000/payment-callback`

2. **Verás:**
   ```
   🔄 Procesando Pago
   Por favor espera mientras confirmamos tu pago...
   [Loader animado]
   (puede tomar entre 10-30 segundos)
   ```

3. **En la consola del navegador verás:**
   ```
   ⏳ [PaymentCallback] Intento 1 de 60
   📊 [PaymentCallback] Respuesta: {success: true, enrolled: false}
   ⏳ [PaymentCallback] Intento 2 de 60
   ⏳ [PaymentCallback] Intento 3 de 60
   📊 [PaymentCallback] Respuesta: {success: true, enrolled: true} ✅
   ✅ [MP] Pago completado detectado
   ```

### Tiempos típicos:

- **Intento 1-2:** `enrolled: false` (webhook aún procesando)
- **Intento 3-5:** `enrolled: true` (webhook completó) ✅

**Esperado:** Entre **5-30 segundos** desde que completó el pago.

---

## ✅ Paso 7: Confirmación Final

**Cuando el pago se procesa exitosamente:**

1. PaymentCallback muestra:
   ```
   ✅ ¡Pago Completado!
   Tu pago ha sido procesado exitosamente.
   [Botón: Ir al Home]
   ```

2. Automáticamente se redirige a home en **2 segundos**

3. En el home, verificar:
   - Navegar a **"Mi Biblioteca"** o tu perfil
   - Ver que el curso aparece como **"Inscrito"** o **"Acceso Disponible"** ✅

---

## 🔍 Verificación de Logs

### 1. Consola del Navegador (F12 → Console)

**Esperado ver:**
```
✅ [MP] createMercadoPagoPreference iniciado
✅ [MP] Parámetros recibidos: {courseId, courseTitle, price, email, name}
✅ [MP] Respuesta de Edge Function: {success: true, initPoint: "..."}
✅ Redirigiendo a Mercado Pago...

(... usuario completa pago ...)

✅ [PaymentCallback] Intento 1 de 60
✅ [PaymentCallback] Respuesta: {success: true, enrolled: false}
✅ [PaymentCallback] Intento 2 de 60
✅ [PaymentCallback] Respuesta: {success: true, enrolled: true}
✅ [MP] Pago completado detectado via webhook
```

### 2. Supabase Functions Dashboard

Acceder a: https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/functions

**Logs esperados:**

#### Edge Function: `mercadopago-preference`
```
✅ [MP] Recibido request: POST
✅ [MP] Base URL final a usar: http://localhost:3000
✅ [MP] Preference object: {items: [...], back_urls: {...}}
✅ [MP] Respuesta MP status: 201
✅ [MP] Preferencia creada: 1234567890
```

#### Edge Function: `check-payment-status`
```
✅ [Check Payment] Verificando pago: {courseId, userEmail}
✅ [Check Payment] Resultado de búsqueda: {enrollmentData: [...]}
✅ [Check Payment] Estado final: {isEnrolled: true}
```

#### Edge Function: `mercadopago-webhook`
```
✅ [Webhook] IPN recibida: {topic: "payment", id: 1234567890}
✅ [Webhook] Payment ID: 1234567890, Status: approved
✅ [Webhook] Usuario inscrito: user@example.com en curso: courseId
✅ [Webhook] Enrollment creado exitosamente
```

### 3. Base de Datos (Supabase Console)

Navegar a: https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/editor

**Tabla: `enrollments`**

Buscar por tu email, deberías ver un nuevo registro:
```
| id | course_id | user_email | status | created_at |
|----|-----------|----|--------|------------|
| ... | python-basics | tu@email.com | enrolled | 2025-11-19 00:xx:xx |
```

---

## ❌ Troubleshooting

### Problema 1: "Error 400: auto_return invalid"

**Síntomas:**
```
❌ Error MP: "auto_return invalid. back_url.success must be defined"
```

**Causa:** Edge Function aún envía `auto_return: "approved"`

**Solución:**
```bash
# Verificar versión desplegada
cd backend
npx supabase functions list

# Debería mostrar: mercadopago-preference | ACTIVE | 24+

# Si es versión <24, redeploy:
npx supabase functions deploy mercadopago-preference --no-verify-jwt
```

---

### Problema 2: PaymentCallback aparece pero nunca termina

**Síntomas:**
```
⏳ [PaymentCallback] Intento 1 de 60
⏳ [PaymentCallback] Intento 2 de 60
... (nunca llega a enrolled: true)
⏰ Timeout esperando confirmación del pago
```

**Causa:** Webhook no está creando el enrollment

**Solución:**

1. Verificar logs de webhook en Supabase:
   ```
   ✅ [Webhook] IPN recibida...
   ✅ [Webhook] Payment status: approved
   ```

2. Si no aparecen logs del webhook:
   - Verificar que webhook URL es correcta:
     ```
     https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
     ```

3. Si logs dicen "Enrollment creado" pero PaymentCallback no lo ve:
   - Problema: Tabla `enrollments` no existe o tiene RLS habilitado
   - Solución: Verificar permisos en Supabase Console

---

### Problema 3: "sessionStorage vacío" en PaymentCallback

**Síntomas:**
```
❌ Datos de pago incompletos
Error: Datos de pago no encontrados.
```

**Causa:** Mercado Pago abrió checkout en nueva pestaña/ventana

**Solución:**
- En desarrollo con localhost, asegurarse de que Mercado Pago abre en la **misma ventana**
- Si abre en nueva pestaña, sessionStorage no se comparte

---

### Problema 4: Mercado Pago abre popup bloqueado

**Síntomas:**
```
Nada sucede al hacer clic en "Comprar"
```

**Causa:** Navegador bloqueó popup

**Solución:**
1. Permitir popups en navegador para `localhost:3000`
2. O revisar que `window.location.href` está correctamente asignado

---

## ✨ Checklist de Validación

- [ ] Frontend iniciado en http://localhost:3000
- [ ] Navegaste a un curso
- [ ] Hiciste clic en "Comprar" sin error 400
- [ ] Mercado Pago checkout se abrió
- [ ] Usaste tarjeta test: 4111 1111 1111 1111
- [ ] Completaste el pago en Mercado Pago
- [ ] Fuiste redirigido a /payment-callback
- [ ] Viste el loader esperando (10-30s)
- [ ] PaymentCallback mostró "¡Pago Completado!"
- [ ] Fuiste redirigido a home automáticamente
- [ ] El curso aparece en tu biblioteca como inscrito ✅

---

## 📝 Datos para Referencia

**Proyecto Supabase:**
- ID: `hztkspqunxeauawqcikw`
- URL: `https://hztkspqunxeauawqcikw.supabase.co`

**Edge Functions:**
- mercadopago-preference: v24+
- check-payment-status: v1+
- mercadopago-webhook: v8+

**Tarjetas Test Mercado Pago:**
- Visa: `4111 1111 1111 1111`
- Mastercard: `5425 2334 3010 9903`
- American Express: `3711 803012 57522`

**URLs Importantes:**
- Frontend: `http://localhost:3000`
- PaymentCallback: `http://localhost:3000/payment-callback`
- Supabase Console: `https://supabase.com/dashboard/project/hztkspqunxeauawqcikw`

---

**Última actualización:** 19 de noviembre de 2025
**Estado:** ✅ Listo para Testing
