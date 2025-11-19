# Resumen de Cambios - Integración Mercado Pago

## ✅ Cambios Realizados

### 1. **Frontend - Configuración del SDK**

#### Archivo: `frontend/index.html`
```html
<!-- Agregado: Script CDN de Mercado Pago SDK v2 -->
<script src="https://sdk.mercadopago.com/js/v2"></script>
```
- Carga el SDK desde CDN en lugar de npm
- Se ejecuta antes de que la app React se cargue

#### Archivo: `frontend/.env.local`
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-44a40cbd-d836-4dce-9395-39a9baf220af
```
- Agregada la clave pública de Mercado Pago

#### Archivo: `frontend/src/lib/mercadopago.ts`
- Actualizada función `initMercadoPago()` para usar SDK global
- Agregada declaración de tipo TypeScript para `window.MercadoPago`
- La función ahora verifica disponibilidad del SDK en window

### 2. **Frontend - Componente de Pago**

#### Archivo: `frontend/src/pages/Checkout.tsx`
- Reemplazada función `handlePayment()` que simulaba pago
- Ahora simplemente avanza al step 2
- Step 2 renderea el componente `<MercadoPagoCheckout />`
- El componente maneja toda la lógica de crear preferencia y redirigir

#### Archivo: `frontend/src/pages/CheckoutSuccess.tsx`
- Actualizado para inscribir automáticamente al usuario
- Lee el `external_reference` (courseId) de parámetros de URL
- Obtiene usuario autenticado
- Llama a `enrollUser()` para inscribir en el curso
- Maneja errores con mensajes al usuario

### 3. **Backend - Webhook de Mercado Pago**

#### Archivo: `backend/supabase/functions/mercadopago-webhook/index.ts`
- **Removida** validación de autenticación que causaba 401
- **Mejorado** logging para debugging
- Agregado soporte para header `x-signature` (HMAC)
- Responde correctamente con status 200
- CORS configurado para permitir Mercado Pago

#### Archivo: `backend/supabase/functions/mercadopago-preference/index.ts`
- Actualizado `external_reference` para usar solo el `courseId`
- Más fácil de recuperar en CheckoutSuccess

## 🔄 Flujo de Pago Actualizado

```
Usuario hace clic "Comprar"
    ↓
handlePayment() → setStep(2)
    ↓
Step 2 muestra <MercadoPagoCheckout />
    ↓
Usuario hace clic "Ir a Mercado Pago"
    ↓
createMercadoPagoPreference() llama Edge Function
    ↓
Edge Function crea preferencia en MP API
    ↓
Recibe initPoint y redirige a Mercado Pago
    ↓
Usuario paga en Mercado Pago
    ↓
MP redirige a /checkout/success con parámetros
    ↓
CheckoutSuccess lee courseId y enrollUser()
    ↓
Usuario inscrito y puede acceder al curso ✅
    ↓
MP envía webhook a Edge Function
    ↓
Edge Function procesa webhook (ready para lógica adicional)
```

## ⚠️ Próximos Pasos Necesarios

### 1. **Desplegar la Función Webhook (URGENTE)**

Opción A - Supabase Dashboard:
1. Ir a https://app.supabase.com
2. Seleccionar proyecto `hztkspqunxeauawqcikw`
3. Ir a Edge Functions → mercadopago-webhook
4. Reemplazar con contenido de `backend/supabase/functions/mercadopago-webhook/index.ts`
5. Salvar

Opción B - Supabase CLI:
```bash
cd backend
supabase functions deploy mercadopago-webhook
```

### 2. **Registrar Webhook en Mercado Pago**

1. Dashboard MP (https://www.mercadopago.com.ar/settings/account/integrations)
2. Sección "Webhooks"
3. URL: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`
4. Eventos: `payment.created`, `payment.updated`
5. Guardar

### 3. **Test del Webhook**

```bash
# Verificar que la función responde
curl -X GET https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook

# Debe responder con 200 y JSON
```

### 4. **Implementar Lógica de Webhook**

En `mercadopago-webhook/index.ts`, reemplazar los TODOs:
- Guardar pago en tabla `payments`
- Validar firma HMAC
- Actualizar estado de usuario_cursos
- Enviar email de confirmación

## 📋 Checklist de Testing

- [ ] Servidor frontend levantado (`npm run dev`)
- [ ] Supabase tiene los secrets configurados
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Función webhook deployada y accesible
- [ ] Mercado Pago SDK carga sin errores en consola
- [ ] Puedo navegar a Checkout con un curso
- [ ] Botón "Comprar" → Step 2 se muestra
- [ ] Componente MercadoPagoCheckout se carga
- [ ] Botón "Ir a Mercado Pago" abre MP
- [ ] Después de pagar, redirige a /checkout/success
- [ ] Usuario se inscribe automáticamente
- [ ] Webhook recibe notificación de MP (revisar logs)

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "No se pudo cargar el SDK" | Verificar script en index.html, limpiar cache |
| Error 401 en webhook | Asegurar que función está deployada |
| Usuario no se inscribe | Verificar que externalRef llega correctamente |
| Faltan datos en Checkout | Revisar que courseId, userData, courseData están presentes |
| Mercado Pago redirige a error | Verificar URLs de retorno son correctas |

## 📁 Archivos Modificados

```
frontend/
  ├── .env.local (MODIFICADO)
  ├── index.html (MODIFICADO)
  ├── src/
  │   ├── lib/
  │   │   └── mercadopago.ts (MODIFICADO)
  │   ├── components/
  │   │   └── MercadoPagoCheckout.tsx (EXISTÍA)
  │   └── pages/
  │       ├── Checkout.tsx (MODIFICADO)
  │       ├── CheckoutSuccess.tsx (MODIFICADO)
  │       ├── CheckoutFailure.tsx (EXISTÍA)
  │       └── CheckoutPending.tsx (EXISTÍA)
backend/
  └── supabase/functions/
      ├── mercadopago-preference/
      │   └── index.ts (MODIFICADO - external_reference)
      └── mercadopago-webhook/
          └── index.ts (MODIFICADO - Removido 401)
```

## 📞 Contacto/Soporte

Para más detalles sobre la integración de Mercado Pago:
- Documentación: https://developers.mercadopago.com
- Guía de Webhooks: https://developers.mercadopago.com/es/docs/checkout-api/webhooks/v1/integration-guide
- Test: https://developers.mercadopago.com/es/docs/checkout-api/webhooks/v1/testing-notifications
