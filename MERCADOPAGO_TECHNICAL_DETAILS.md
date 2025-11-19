# Configuración de Mercado Pago - Detalles Técnicos

## 📋 Resumen de Arquitectura

```
Frontend (React + Vite)
    ↓
    └─→ mercadopago.ts (servicio)
        └─→ Edge Function: mercadopago-preference (Supabase)
            └─→ API Mercado Pago: /checkout/preferences
                └─→ Retorna: init_point (URL de checkout)

Usuario completa pago en Mercado Pago
    ↓
    └─→ MP redirige a: /payment-callback?status=approved
        └─→ PaymentCallback.tsx hace polling
            └─→ Edge Function: check-payment-status (Supabase)
                └─→ Verifica inscripción en BD
                    └─→ Si existe: redirige a home
                    └─→ Si no: reintentar

En paralelo:
    MP envía webhook
    ↓
    └─→ Edge Function: mercadopago-webhook (Supabase)
        └─→ Valida HMAC de MP
        └─→ Crea inscripción en BD
        └─→ Polling lo detecta y completa flujo
```

---

## 🔧 Configuración Detallada

### 1. Frontend: `src/lib/mercadopago.ts`

#### Función: `initMercadoPago()`
- **Propósito**: Inicializar el SDK de Mercado Pago en el cliente
- **Fuente de Script**: `index.html` → `<script src="https://sdk.mercadopago.com/js/v2"></script>`
- **Verificación**: Comprueba que `window.MercadoPago` está disponible
- **Error Handling**: Si el SDK no se carga en 500ms, retorna null

```typescript
export const initMercadoPago = async () => {
  const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
  
  if (typeof window !== 'undefined' && window.MercadoPago) {
    return true;
  }
  
  // Esperar un poco e intentar de nuevo
  await new Promise(resolve => setTimeout(resolve, 500));
  return typeof window !== 'undefined' && window.MercadoPago ? true : null;
}
```

#### Función: `createMercadoPagoPreference()`
- **Propósito**: Crear una preferencia de pago en Mercado Pago
- **Método**: POST a Edge Function `mercadopago-preference`
- **Parámetros**:
  - `courseId`: ID del curso a comprar
  - `courseTitle`: Nombre del curso
  - `price`: Precio en ARS (pesos argentinos)
  - `userEmail`: Email del comprador
  - `userName`: (Opcional) Nombre del comprador
  - `baseUrl`: URL base del frontend (enviada automáticamente)

**Flujo**:
```typescript
1. Obtener baseUrl = window.location.origin
2. Si es Netlify (https), validar que sea HTTPS
3. Llamar a Edge Function con estos parámetros
4. Edge Function llama a API de MP
5. MP retorna preferenceId e initPoint
6. Retornar initPoint (URL de checkout)
```

#### Función: `redirectToMercadoPago()`
- **Propósito**: Abrir ventana de Mercado Pago y monitorear cuando se cierre
- **Método**: `window.open()` en lugar de redirección directa
- **Monitoreo**: Cada 1 segundo verifica si `mpWindow.closed === true`
- **Timeout**: Si después de 10 minutos no se cierra, fuerza redirección

**Razón de esta estrategia**:
- Mercado Pago `init_point` es una URL que abre un checkout completo
- En localhost HTTP no hay auto-redirect automático
- En producción HTTPS sí hay auto-redirect pero es impredecible
- Abrir en ventana nueva + monitoreo es más confiable en ambos casos
- Cuando se cierra, redirige a `/payment-callback` para esperar webhook

---

### 2. Edge Function: `mercadopago-preference/index.ts`

**URL**: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-preference`

**Método**: POST

**CORS**: Habilitado globalmente

**Variables de Entorno Requeridas**:
- `MERCADOPAGO_ACCESS_TOKEN`: Token de API de Mercado Pago

**Body esperado**:
```json
{
  "courseId": "string",
  "courseTitle": "string",
  "price": "number",
  "userEmail": "string",
  "userName": "string (opcional)",
  "baseUrl": "string (ej: https://fudensa.netlify.app)"
}
```

**Proceso**:
```typescript
1. Validar que MERCADOPAGO_ACCESS_TOKEN existe
2. Obtener baseUrl del body o del header Origin
3. Remover trailing slashes de baseUrl
4. Crear objeto preference:
   {
     items: [{ id, title, quantity: 1, unit_price }],
     payer: { email },
     back_urls: {
       success: "${baseUrl}/payment-callback?status=approved",
       failure: "${baseUrl}/payment-callback?status=rejected",
       pending: "${baseUrl}/payment-callback?status=pending"
     },
     auto_return: "approved",
     external_reference: courseId,
     notification_url: "https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook"
   }
5. POST a https://api.mercadopago.com/checkout/preferences
6. Si éxito: retornar { success: true, preferenceId, initPoint }
7. Si error: retornar { success: false, error, details }
```

**Response**:
```json
{
  "success": true,
  "preferenceId": "1234567890",
  "initPoint": "https://checkout.mercadopago.com.ar/pay/v1/...",
  "status": 200
}
```

---

### 3. Edge Function: `mercadopago-webhook/index.ts`

**URL**: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`

**Método**: POST (IPN de Mercado Pago)

**Headers Requeridos**:
- `X-Signature`: HMAC SHA256 para validación

**Variables de Entorno Requeridas**:
- `MERCADOPAGO_WEBHOOK_SECRET`: Secret para validar HMAC

**Proceso**:
```typescript
1. Recibir notificación de Mercado Pago
2. Validar HMAC usando X-Signature + webhook secret
3. Si HMAC inválido: retornar 401 Unauthorized
4. Si tipo es "payment" y status es "approved":
   a. Extraer payment_id y external_reference (courseId)
   b. Buscar en tabla `payments` por payment_id
   c. Si no existe: obtener detalles del pago desde API de MP
   d. Crear registro en `enrollments`:
      {
        user_email: payer.email,
        course_id: external_reference,
        payment_id: payment_id,
        status: "completed"
      }
   e. Retornar { success: true }
5. Si hay error: retornar { success: false, error }
```

**Webhook Topics que procesa**:
- `payment.created` - Nuevo pago creado
- `payment.updated` - Pago actualizado
- `payment.approved` - Pago aprobado

---

### 4. Edge Function: `check-payment-status/index.ts`

**URL**: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/check-payment-status`

**Método**: POST

**Body esperado**:
```json
{
  "courseId": "string",
  "userEmail": "string"
}
```

**Proceso**:
```typescript
1. Recibir courseId y userEmail
2. Buscar en tabla `enrollments`:
   WHERE user_email = userEmail AND course_id = courseId
3. Si existe registro: retornar { success: true, enrolled: true }
4. Si no existe: retornar { success: true, enrolled: false }
5. Si error de BD: retornar { success: false, error }
```

**Response**:
```json
{
  "success": true,
  "enrolled": true
}
```

---

## 📱 Frontend: `src/pages/PaymentCallback.tsx`

**Ruta**: `/payment-callback`

**Propósito**: Esperar a que el webhook procese el pago

**Parámetros GET**:
- `status`: approved | rejected | pending (enviados por Mercado Pago)
- `payment_id`: ID del pago (si MP lo envía)

**Proceso**:
```typescript
1. Obtener courseId y userEmail de sessionStorage
2. Obtener status y payment_id de URL query params
3. Mostrar "Procesando pago..."
4. Iniciar polling cada 2 segundos
5. Llamar a check-payment-status
6. Si enrolled === true:
   - Mostrar "¡Pago procesado exitosamente!"
   - Limpiar sessionStorage
   - Redirigir a home después de 2 segundos
7. Si timeout (60 intentos = 2 minutos):
   - Mostrar error
   - Permitir retry

```

**Estados de UI**:
- `waiting`: "Procesando pago..."
- `success`: "¡Pago procesado exitosamente! Redirigiendo..."
- `error`: "Timeout esperando confirmación" + botón retry

---

## 🔐 Seguridad

### En el Código

1. **Token Seguro**:
   - `MERCADOPAGO_ACCESS_TOKEN` está en Supabase secrets (no en .env público)
   - Solo Edge Functions pueden acceder a él
   - No se envía nunca al cliente

2. **Validación de Webhook**:
   - HMAC SHA256 validado contra `MERCADOPAGO_WEBHOOK_SECRET`
   - Rechaza webhooks no autenticados
   - Valida que el `external_reference` coincida con courseId

3. **RLS en Base de Datos**:
   - Tabla `enrollments` tiene RLS habilitada
   - Solo Edge Functions autenticadas pueden insertar registros
   - Los usuarios no pueden modificar su estado de inscripción

### En Producción

1. **HTTPS Obligatorio**:
   - Netlify proporciona SSL/TLS automáticamente
   - Back URLs de Mercado Pago requieren HTTPS
   - CSP headers validan que los scripts vengan de dominios permitidos

2. **Validación de Dominio**:
   - Back URLs deben coincidir con dominio registrado en Mercado Pago
   - Webhook URL debe ser HTTPS y accesible publicamente

---

## 🧪 Testing Local

### Requisitos

1. Proyecto Supabase creado
2. Token de Mercado Pago (TEST mode)
3. Webhooks configurados en Mercado Pago Console

### Pasos

```bash
# 1. Iniciar servidor local
cd frontend
npm run dev

# 2. En otra terminal, observar logs de Supabase
cd backend
npx supabase functions list
npx supabase functions logs mercadopago-preference --tail

# 3. En navegador: http://localhost:3000
# 4. Ir a checkout y hacer click en "Pagar"
# 5. Usar tarjeta TEST: 4111 1111 1111 1111
# 6. Observar logs en tiempo real
```

---

## 📊 Monitoreo

### Logs a Monitorear

En Supabase Console → Edge Functions:

```
mercadopago-preference:
  ✅ Preferencia creada exitosamente
  ❌ Token no configurado
  ❌ Error al conectar con API de MP

mercadopago-webhook:
  ✅ Pago procesado exitosamente
  ✅ Inscripción creada en BD
  ❌ HMAC inválido (webhook no auténtico)
  ❌ Usuario ya inscrito (skipped)

check-payment-status:
  ✅ Inscripción encontrada
  ✅ Pendiente de inscripción
  ❌ Error de base de datos
```

### Métricas a Verificar

- Latencia de Edge Functions (< 1 segundo)
- Tasa de éxito de webhooks (> 99%)
- Tiempo desde pago hasta inscripción (< 5 segundos)
- Errores CORS (debe ser 0)

---

## 🚀 Deployment

### Pasos

```bash
# 1. Asegurar que Edge Functions estén desplegadas
cd backend
npx supabase functions deploy mercadopago-preference --no-verify-jwt
npx supabase functions deploy mercadopago-webhook --no-verify-jwt
npx supabase functions deploy check-payment-status --no-verify-jwt

# 2. Compilar frontend
cd ../frontend
npm run build

# 3. Push a rama Deploy (Netlify se actualiza automáticamente)
cd ..
git push origin Lobo-Branch:Deploy

# 4. Verificar en Netlify Console que el deploy se completó
```

---

**Última actualización**: 18 de Noviembre de 2025
**Versión**: 1.0
**Estado**: ✅ PRODUCCIÓN
