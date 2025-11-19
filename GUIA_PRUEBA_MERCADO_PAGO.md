# 🧪 Guía de Prueba: Flujo Completo de Pago Mercado Pago

## ✅ Status Actual

- ✅ Servidor frontend corriendo en: **http://localhost:3001/**
- ✅ Edge Functions desplegadas en Supabase
- ✅ Secrets configurados en Supabase Dashboard
- ✅ Webhook registrado en Mercado Pago

---

## 🎯 Paso 1: Navegar a la Página de Checkout

1. Abre tu navegador
2. Ve a: **http://localhost:3001/#/checkout**

O con un curso específico (si está disponible):
```
http://localhost:3001/#/checkout/[COURSE-ID]
```

---

## 💳 Paso 2: Completar el Formulario

Deberías ver un formulario con campos como:
- ☑️ Resumen del curso
- ☑️ Email del estudiante
- ☑️ Botón "Ir a Mercado Pago"

---

## 🧪 Paso 3: Usar Tarjeta de Prueba

**Para pago EXITOSO:**
- **Email:** `test_user_123456@testuser.com`
- **Tarjeta:** `4111 1111 1111 1111`
- **Vencimiento:** `12/25`
- **CVV:** `123`
- **Titular:** (cualquier nombre)

**Para pago RECHAZADO:**
- **Tarjeta:** `5555 5555 5555 4444`
- Cualquier vencimiento futuro y CVV

---

## 🚀 Paso 4: Completar el Pago

1. Click en botón **"💳 Ir a Mercado Pago"**
2. Serás redirigido a la página de Mercado Pago
3. Ingresa los datos de la tarjeta de prueba
4. Completa el pago

---

## ✨ Paso 5: Verificar el Resultado

**Pago Exitoso:**
- 📍 Redirigido a: `http://localhost:3001/#/checkout/success`
- ✅ Verás página verde con "¡Pago Exitoso!"
- 📧 Se envía email de confirmación (simulado)

**Pago Fallido:**
- 📍 Redirigido a: `http://localhost:3001/#/checkout/failure`
- ❌ Verás página roja con "Pago No Completado"
- 🔄 Opción para reintentar

**Pago Pendiente:**
- 📍 Redirigido a: `http://localhost:3001/#/checkout/pending`
- ⏳ Verás página amarilla con "Pago Pendiente"
- 📝 Estado "En Revisión"

---

## 🔍 Paso 6: Verificar los Logs

### Ver logs de la Edge Function mercadopago-preference:

```bash
npx supabase functions logs mercadopago-preference --project-ref hztkspqunxeauawqcikw
```

Deberías ver:
```
📝 Creando preferencia de pago: {
  courseId: "...",
  courseTitle: "...",
  price: ...,
  email: "..."
}
✅ Preferencia creada exitosamente: pref_...
```

### Ver logs de la Edge Function mercadopago-webhook:

```bash
npx supabase functions logs mercadopago-webhook --project-ref hztkspqunxeauawqcikw
```

Deberías ver:
```
📨 Webhook recibido: {
  signature: "✅ Presente",
  type: "payment",
  action: "payment.created"
}
✅ Firma verificada correctamente
💰 Pago creado: [payment-id]
```

---

## 📊 Flujo Esperado Completo

```
1. Usuario abre http://localhost:3001/#/checkout
   ↓
2. Ve componente MercadoPagoCheckout
   ↓
3. Presiona botón "Ir a Mercado Pago"
   ↓
4. Frontend llama Edge Function: mercadopago-preference
   ↓
5. Edge Function crea preferencia en Mercado Pago API
   ↓
6. Retorna initPoint (URL de checkout)
   ↓
7. Frontend redirige a Mercado Pago
   ↓
8. Usuario completa pago con tarjeta de prueba
   ↓
9. Mercado Pago redirige a /#/checkout/success
   ↓
10. Mercado Pago envía webhook a nuestro servidor
   ↓
11. Edge Function mercadopago-webhook recibe webhook
   ↓
12. Valida firma HMAC
   ↓
13. Procesa pago (aquí se activaría el acceso al curso)
```

---

## 🐛 Troubleshooting

### Error: "No se pudo cargar el SDK de Mercado Pago"
- ✅ Verificar que `.env.local` tiene `VITE_MERCADO_PAGO_PUBLIC_KEY`
- ✅ Revisar en console del navegador (F12)

### Error: "Error al procesar el pago"
- ✅ Ver logs: `npx supabase functions logs mercadopago-preference`
- ✅ Verificar que los secrets están en Supabase
- ✅ Verificar que Edge Functions están "Active" en Dashboard

### Pago se queda en "Procesando..."
- ✅ Revisar logs de la Edge Function
- ✅ Verificar que el Access Token está correcto
- ✅ Probar con otra tarjeta

### Webhook no se recibe
- ✅ Ir a Mercado Pago Dashboard → Developers → Webhooks
- ✅ Ver historial de notificaciones
- ✅ Verificar que la URL es correcta:
  ```
  https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
  ```

---

## 📝 Notas Importantes

✅ Las tarjetas de prueba NO cobran dinero real
✅ Los webhooks pueden tardar 1-5 segundos en llegar
✅ Puedes hacer múltiples pagos de prueba
✅ Los logs se guardan en Supabase por 7 días

---

## 🎉 Después de las Pruebas

Una vez que confirmes que todo funciona:

1. ✅ Pago exitoso llega a success page
2. ✅ Webhook se recibe en Supabase
3. ✅ Logs muestran todo correcto

Estaremos listos para:
- 🚀 Implementar lógica para activar cursos
- 📧 Enviar emails de confirmación
- 💾 Guardar registros de pago en BD
- 🎓 Registrar compra del estudiante

---

## 🚨 Recuerda:

En los logs de Mercado Pago verás webhooks recibidos.
En los logs de Supabase verás si nuestras funciones responden correctamente.

**Reporta si hay algún error en los logs.**

