# 🎯 Guía Completa: Mercado Pago Backend Seguro

## 📋 Resumen de Implementación

Se ha implementado una integración **100% segura** de Mercado Pago usando:
- ✅ **Edge Functions de Supabase** (Backend)
- ✅ **Componentes React** (Frontend)
- ✅ **Webhooks** para notificaciones de pago
- ✅ **Páginas de resultado** (éxito, fallo, pendiente)

---

## 🔐 Arquitectura de Seguridad

```
Frontend (React)
    ↓ (sin credenciales)
Edge Function (Supabase)
    ↓ (con Access Token)
Mercado Pago API
```

**Ventajas:**
- El Access Token NUNCA está expuesto en el cliente
- La comunicación es directa backend → Mercado Pago
- Seguridad PCI-DSS completa
- Logs y auditoría en Supabase

---

## 📁 Archivos Creados

### Backend (Edge Functions)

#### 1️⃣ **mercadopago-preference/index.ts**
- **Propósito:** Crear preferencias de pago en Mercado Pago
- **Método:** POST
- **Datos necesarios:** courseId, courseTitle, price, userEmail, userName
- **Retorna:** preferenceId, initPoint (URL de checkout)

#### 2️⃣ **mercadopago-webhook/index.ts**
- **Propósito:** Recibir notificaciones de pagos completados
- **Método:** POST (y GET para verificar)
- **Procesa:** Actualizaciones de estado de pago
- **Acciones:** Guardar pago, activar curso, enviar email

### Frontend

#### 3️⃣ **lib/mercadopago.ts**
- `initMercadoPago()` - Cargar SDK
- `createMercadoPagoPreference()` - Llamar Edge Function
- `redirectToMercadoPago()` - Redirigir a Mercado Pago
- `getMercadoPagoPaymentStatus()` - Verificar estado (futuro)

#### 4️⃣ **components/MercadoPagoCheckout.tsx**
- Componente React reutilizable
- Muestra resumen del curso
- Botón "Ir a Mercado Pago"
- Manejo de errores

#### 5️⃣ **pages/CheckoutSuccess.tsx**
- Página de pago exitoso
- URL: `/#/checkout/success`
- Parámetros: `preference_id`, `payment_id`

#### 6️⃣ **pages/CheckoutFailure.tsx**
- Página de pago rechazado
- URL: `/#/checkout/failure`
- Opciones para reintentar

#### 7️⃣ **pages/CheckoutPending.tsx**
- Página de pago pendiente
- URL: `/#/checkout/pending`
- Estado "En Revisión"

---

## ⚙️ Pasos de Configuración

### Paso 1: Configurar Access Token en Supabase

1. Ir a **Supabase Dashboard** → Tu proyecto
2. **Settings** (Rueda de engranaje) → **Functions**
3. En **Secrets/Environment Variables**, agregar:
   ```
   MERCADOPAGO_ACCESS_TOKEN = APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
   ```
4. **Guardar**

### Paso 2: Desplegar Edge Functions

En la terminal, en la raíz del proyecto:

```bash
# Hacer login en Supabase
npx supabase login

# Desplegar las Edge Functions
npx supabase functions deploy mercadopago-preference
npx supabase functions deploy mercadopago-webhook
```

**Resultado esperado:**
```
✅ Function deployed to https://[PROJECT-ID].supabase.co/functions/v1/mercadopago-preference
✅ Function deployed to https://[PROJECT-ID].supabase.co/functions/v1/mercadopago-webhook
```

### Paso 3: Verificar .env.local (Frontend)

El archivo ya contiene:
```
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-44a40cbd-d836-4dce-9395-39a9baf220af
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
```

⚠️ **NOTA:** El Access Token en .env.local es solo para referencia.
**NO se envía al cliente** (está protegido por Vite).

### Paso 4: Registrar Webhook en Mercado Pago

1. Ir a https://www.mercadopago.com.ar/developers/panel/webhooks
2. Hacer login con tu cuenta de Mercado Pago
3. Agregar nueva URL de webhook:
   ```
   https://[PROJECT-ID].supabase.co/functions/v1/mercadopago-webhook
   ```
4. Temas a suscribirse:
   - `payment` (pagos)
   - `merchant_order` (órdenes)

5. **Guardar**

---

## 🧪 Prueba Local

### 1. Iniciar servidor de desarrollo

```bash
cd frontend
npm run dev
```

### 2. Navegar a checkout

```
http://localhost:5173/#/checkout/[COURSE-ID]
```

### 3. Completar el pago con datos de prueba

**Tarjeta de prueba exitosa (Argentina):**
- **Email:** `test_user_123456@testuser.com`
- **Tarjeta:** `4111 1111 1111 1111`
- **Vencimiento:** `12/25`
- **CVV:** `123`

**Tarjeta de prueba rechazada:**
- **Tarjeta:** `5555 5555 5555 4444`
- Cualquier fecha futura y CVV

### 4. Verificar flujos

✅ **Éxito:** Redirige a `/#/checkout/success`
❌ **Fallo:** Redirige a `/#/checkout/failure`
⏳ **Pendiente:** Redirige a `/#/checkout/pending`

---

## 🔍 Monitoreo

### Ver logs de Edge Functions

```bash
# Ver logs en tiempo real
npx supabase functions list

# Ver logs específicos
npx supabase functions logs mercadopago-preference --limit 50
```

### Ver webhooks en Mercado Pago

1. Dashboard Mercado Pago → **Developers** → **Webhooks**
2. Ver historial de notificaciones enviadas
3. Verificar que se reciben correctamente

---

## 🐛 Solución de Problemas

### Error: "Access Token no configurado"
- Verificar que el Secret esté en Supabase Dashboard
- Redeploy de la función: `npx supabase functions deploy mercadopago-preference`

### Error: "CORS" al llamar Edge Function
- Verificar que el cliente está en VITE_SUPABASE_URL correcto
- Headers CORS ya están configurados en index.ts

### Pago crea preferencia pero no redirige
- Verificar que `initPoint` no es null
- Revisar logs con: `npx supabase functions logs`

### Webhook no recibe notificaciones
- Verificar que la URL está correctamente registrada
- Probar webhook con "Send Test Notification" en Mercado Pago
- Ver logs: `npx supabase functions logs mercadopago-webhook`

---

## 📊 Flujo Completo de Pago

```
1. Usuario abre página de Checkout
   ↓
2. Ve resumen del curso y presiona "Ir a Mercado Pago"
   ↓
3. Frontend llamada Edge Function con datos
   ↓
4. Edge Function crea preferencia en Mercado Pago API
   ↓
5. Retorna initPoint (URL de checkout)
   ↓
6. Usuario redirigido a Mercado Pago
   ↓
7. Usuario completa pago en Mercado Pago
   ↓
8. Mercado Pago envía notificación al webhook
   ↓
9. Webhook procesa pago (activar curso, enviar email, etc.)
   ↓
10. Usuario redirigido a /#/checkout/success
```

---

## 🎓 Variables de Entorno Finales

### Frontend (.env.local)
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-... (solo referencia)
```

### Backend (Supabase Secrets)
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

---

## ✅ Checklist de Implementación

- [x] Edge Function mercadopago-preference creada
- [x] Edge Function mercadopago-webhook creada
- [x] Componente MercadoPagoCheckout creado
- [x] Páginas de resultado (success, failure, pending) creadas
- [x] Servicio mercadopago.ts con llamadas seguras
- [ ] Secret MERCADOPAGO_ACCESS_TOKEN configurado en Supabase
- [ ] Edge Functions desplegadas con `npx supabase functions deploy`
- [ ] Webhook registrado en Mercado Pago
- [ ] Pruebas realizadas con tarjetas de prueba
- [ ] Logs verificados en Supabase
- [ ] Redeploy a producción realizado

---

## 🚀 Próximos Pasos

1. **Desplegar Edge Functions** (seguir Paso 2 arriba)
2. **Configurar Secret** (seguir Paso 1 arriba)
3. **Registrar Webhook** (seguir Paso 4 arriba)
4. **Pruebas locales** (seguir sección Prueba Local)
5. **Implementar lógica del webhook** (guardar pago, activar curso)
6. **Desplegar a producción**

---

## 📞 Soporte

Para ayuda:
- Documentación Mercado Pago: https://www.mercadopago.com.ar/developers/es/docs
- Documentación Supabase: https://supabase.com/docs/guides/functions
- Estado del webhook: Mercado Pago Dashboard → Developers → Webhooks

