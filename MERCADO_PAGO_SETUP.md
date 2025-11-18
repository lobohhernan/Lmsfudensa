# Integración Mercado Pago - FUDENSA

Guía completa para integrar Mercado Pago en tu plataforma FUDENSA.

## ✅ Completado

- [x] Instalación del SDK de Mercado Pago
- [x] Configuración de variables de entorno
- [x] Componente `MercadoPagoCheckout`
- [x] Servicio de Mercado Pago
- [x] Edge Function de Supabase
- [x] Integración en página de Checkout

## 📋 Pasos pendientes

### 1. Desplegar Edge Function en Supabase

```bash
# Desde la raíz del proyecto
supabase functions deploy mercadopago-preference
```

**Cuando pida confirmación, ingresa:** `APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970`

### 2. Configurar variables de entorno en Supabase

En tu dashboard de Supabase:

1. Ve a **Project Settings** → **Functions**
2. Haz clic en **Secrets** o **Environment Variables**
3. Agrega:
   - **Nombre:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Valor:** `APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970`

4. Guarda y redeploy la función

### 3. Configurar webhook (Opcional, pero recomendado)

Para recibir notificaciones de pagos completados:

1. Ve a [Mercado Pago - Webhooks](https://www.mercadopago.com.ar/settings/webhooks)
2. Agrega URL: `https://tu-dominio.com/api/webhooks/mercadopago`
3. Suscríbete a eventos: `payment.created`, `payment.updated`

## 🛠️ Archivos creados/modificados

### Frontend
- `frontend/.env.local` - Variables de entorno (agregada VITE_MERCADO_PAGO_PUBLIC_KEY)
- `frontend/src/lib/mercadopago.ts` - Servicio de Mercado Pago
- `frontend/src/components/MercadoPagoCheckout.tsx` - Componente de checkout
- `frontend/src/pages/Checkout.tsx` - Integración en página de checkout

### Backend (Supabase)
- `backend/supabase/functions/mercadopago-preference/index.ts` - Edge Function

## 🧪 Probar localmente

1. **Desarrollo:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Ir a:** `http://localhost:5173/#/checkout/[courseId]`

3. **Completar paso 1** (resumen del curso)

4. **Ir al paso 2** (método de pago)

5. **Hacer clic en "Ir a Mercado Pago"**

   - Serás redirigido a Mercado Pago
   - Usa credenciales de prueba:
     - **Email:** `test_user_123456@testuser.com`
     - **Tarjeta:** `4111 1111 1111 1111`
     - **Vencimiento:** `12/25`
     - **CVV:** `123`

## 🔑 Credenciales

- **Public Key:** `APP_USR-44a40cbd-d836-4dce-9395-39a9baf220af`
- **Access Token:** `APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970`

## 📱 Cómo funciona el flujo

1. Usuario selecciona curso → Va a Checkout
2. Completa paso 1 (resumen) → Continúa
3. En paso 2, hace clic en "Ir a Mercado Pago"
4. **Frontend** llama a Edge Function de Supabase
5. **Edge Function** crea preferencia en Mercado Pago
6. **Frontend** redirige a Mercado Pago para pagar
7. Usuario completa pago
8. Mercado Pago redirige a URL de éxito/fallo
9. (Opcional) Webhook notifica a tu backend

## 🚀 Próximos pasos

1. Crear webhook para procesar pagos (guardar en BD, activar curso, etc.)
2. Implementar páginas de éxito/fallo de pago
3. Implementar reporte de pagos
4. Configurar emails de confirmación

## ❓ Troubleshooting

**Error: "Public Key no configurada"**
- Verifica que `.env.local` tenga `VITE_MERCADO_PAGO_PUBLIC_KEY`

**Error: "Token de Mercado Pago no configurado"**
- Asegúrate de que la variable de entorno está en Supabase Functions

**Error: "No se pudo procesar el pago"**
- Verifica que la Edge Function está deployada
- Revisa los logs en Supabase dashboard

## 📚 Recursos

- [Docs Mercado Pago](https://www.mercadopago.com.ar/developers/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
