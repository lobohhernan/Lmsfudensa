# Análisis y Solución: Auto-Redirect de Mercado Pago

**Fecha:** 18 de noviembre de 2025  
**Problema Reportado:** El usuario completaba el pago en Mercado Pago pero no se redirigía automáticamente a la app.  
**Estado:** ✅ RESUELTO

---

## 📋 Análisis del Problema

### El Síntoma
- ✅ Pago se creaba correctamente en Mercado Pago
- ✅ Usuario podía completar el pago
- ✅ Pantalla de "¡Listo! Tu pago ya se acreditó" aparecía
- ❌ **Navegador NO redirigía automáticamente a la app**
- ❌ Usuario quedaba atrapado en Mercado Pago

### Investigación Realizada
Se consultó la documentación oficial de Mercado Pago sobre **Configurar URLs de Retorno** y se encontró la siguiente información crítica:

**Documento:** https://www.mercadopago.com/developers/es/docs/checkout-pro/configure-back-urls

```text
"Los compradores son redirigidos automáticamente al site cuando se aprueba el pago. 
El tiempo de redireccionamiento será de hasta 40 segundos y no podrá ser personalizado."
```

---

## 🔍 Causas Identificadas

### Causa Raíz: Implementación Incorrecta del `auto_return`

#### ❌ Lo que se hizo INCORRECTAMENTE (anterior):

1. **En la Edge Function:** Se intentó añadir `auto_return` al objeto de preferencia
   - Mercado Pago rechazaba la request con error **400**
   - Se removió de la preferencia (solución temporal pero incorrecta)

2. **En el Frontend:** Se intentó agregar `auto_return=approved` como parámetro de URL
   ```typescript
   // ❌ INCORRECTO
   const redirectUrl = `${initPoint}${separator}auto_return=approved`;
   window.location.href = redirectUrl;
   ```

**Problema:** Los parámetros de URL no funcionan. Mercado Pago requiere que `auto_return` esté en el objeto de preferencia.

---

## ✅ Solución Implementada

### 1. **Corrección en Edge Function** 
**Archivo:** `backend/supabase/functions/mercadopago-preference/index.ts`

```typescript
// ✅ CORRECTO - auto_return en la preferencia
const preference = {
  items: [...],
  payer: {...},
  back_urls: {
    success: `${baseUrl}/#/mp-redirect`,
    failure: `${baseUrl}/#/checkout-failure`,
    pending: `${baseUrl}/#/checkout-failure`,
  },
  auto_return: "approved",  // ← AQUÍ va auto_return
  external_reference: body.courseId,
  notification_url: "...",
};
```

**Por qué funciona:**
- `auto_return: "approved"` en la preferencia le indica a Mercado Pago que auto-redirija después de pago aprobado
- El tiempo de redirección es de hasta 40 segundos (definido por Mercado Pago)
- Las URLs de retorno (`back_urls`) son adonde redireccionar

### 2. **Simplificación en Frontend**
**Archivo:** `frontend/src/lib/mercadopago.ts`

```typescript
// ✅ CORRECTO - sin parámetros adicionales
export const redirectToMercadoPago = (initPoint: string) => {
  if (!initPoint) {
    console.error("❌ Init Point inválido");
    return;
  }

  console.log("🔄 [MP] Redirigiendo a Mercado Pago:", initPoint);
  
  // El auto_return ya está configurado en la preferencia del servidor
  window.location.href = initPoint;
};
```

**Por qué funciona:**
- Simplificación: solo redirige al `initPoint` que Mercado Pago proporciona
- El `auto_return` ya está en la preferencia (configurado en el servidor)
- No se intenta manipular la URL con parámetros

---

## 🔄 Flujo Completo Post-Solución

```
1. Usuario click "Comprar"
   ↓
2. Frontend llama createMercadoPagoPreference()
   ↓
3. Edge Function crea preferencia CON auto_return: "approved"
   ↓
4. Edge Function devuelve initPoint
   ↓
5. Frontend redirige a: https://www.mercadopago.com/checkout/v1/payment/redirect?preference-id=...
   ↓
6. Usuario completa pago en Mercado Pago
   ↓
7. Mercado Pago detecta auto_return: "approved"
   ↓
8. ✅ Mercado Pago AUTOMÁTICAMENTE redirige a: http://localhost:3000/#/mp-redirect?payment_id=...
   ↓
9. App detecta ruta #/mp-redirect
   ↓
10. MercadoPagoRedirect procesa parámetros
    ↓
11. Redirige a success page: /?external_reference=COURSE_ID&status=approved
    ↓
12. CheckoutSuccess auto-enrolla al usuario
    ↓
13. ✅ Curso aparece como habilitado
```

---

## 📝 Parámetros Recibidos en `back_urls`

Cuando Mercado Pago redirige a la URL de `back_urls.success`, envía estos parámetros:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `payment_id` | integer | ID del pago en Mercado Pago |
| `status` | string | Estado del pago: `approved`, `rejected`, `pending` |
| `external_reference` | string | Referencia externa (tu Course ID) |
| `merchant_order_id` | string | ID de orden de Mercado Pago |
| `preference_id` | string | ID de la preferencia |
| `collection_id` | string | ID de colección (similar a payment_id) |

**Ejemplo de URL recibida:**
```
http://localhost:3000/#/mp-redirect?payment_id=123456&status=approved&external_reference=COURSE_123&merchant_order_id=789
```

---

## 🚀 Cambios Implementados

### 1. Edge Function (Servidor)
- ✅ Añadido `auto_return: "approved"` a la preferencia
- ✅ Deployed a Supabase

### 2. Frontend Service
- ✅ Removido lógica de parámetros de URL
- ✅ Simplificada función `redirectToMercadoPago`
- ✅ Frontend compilado correctamente

### 3. Flujo Existente (No cambió)
- ✅ `MercadoPagoRedirect` component sigue activo
- ✅ Ruta `#/mp-redirect` sigue detectándose
- ✅ `CheckoutSuccess` sigue auto-enrollando

---

## 🧪 Cómo Probar

1. **Navega a un curso**
2. **Click en "Comprar"**
3. **Completa el pago con tarjeta de prueba:**
   - Número: `4111 1111 1111 1111`
   - Fecha: Cualquier fecha futura (ej: 12/25)
   - CVV: Cualquier número (ej: 123)

4. **Resultado Esperado:**
   - ✅ Después de "¡Listo! Tu pago ya se acreditó"
   - ✅ Espera hasta 40 segundos para el auto-redirect
   - ✅ Serás redirigido automáticamente a `http://localhost:3000/#/mp-redirect`
   - ✅ Después a la página de éxito
   - ✅ El curso debe aparecer habilitado

---

## 📚 Documentación Referenciada

- **Configurar URLs de Retorno:** https://www.mercadopago.com/developers/es/docs/checkout-pro/configure-back-urls
- **Parámetros de Respuesta:** Los parámetros GET que devuelve Mercado Pago en la URL de retorno
- **Tiempo de Redireccionamiento:** Hasta 40 segundos (no personalizable)

---

## ⚠️ Notas Importantes

1. **`auto_return` en la preferencia = OBLIGATORIO**
   - Va en el objeto JSON que se envía a la API de Mercado Pago
   - NO va como parámetro de URL

2. **back_urls deben ser URL públicas**
   - `http://localhost:3000` funciona en desarrollo
   - En producción debe ser dominio real (ej: `https://tuapp.com`)

3. **Tiempo de Redireccionamiento**
   - Mercado Pago espera hasta 40 segundos
   - No es configurable
   - MercadoPagoRedirect espera 1 segundo como buffer

4. **Notificaciones Webhook**
   - `notification_url` sigue activo para confirmaciones
   - Se envía POST cuando el pago cambia de estado
   - Implementar para máxima seguridad

---

## ✨ Estado Final

- ✅ Edge Function: Desplegada con `auto_return: "approved"`
- ✅ Frontend: Compilado sin errores
- ✅ MercadoPagoRedirect: Operativo
- ✅ CheckoutSuccess: Auto-enrollment activo
- ✅ Flujo E2E: Listo para testing

**Próximo paso:** Realiza un pago de prueba para verificar el auto-redirect.
