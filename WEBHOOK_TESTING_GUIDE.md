# Guía de Testing de Webhooks de Mercado Pago

## Estado Actual

Se ha actualizado la función `mercadopago-webhook` para recibir webhooks correctamente. El problema 401 se debía a que Mercado Pago espera que el endpoint responda sin requerir autenticación adicional.

## Pasos para Desplegar la Función Actualizada

### Opción 1: Usar Supabase Dashboard (RECOMENDADO)

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar el proyecto `hztkspqunxeauawqcikw`
3. Ir a **SQL Editor** o **Edge Functions**
4. Copiar el contenido actualizado de `backend/supabase/functions/mercadopago-webhook/index.ts`
5. Reemplazar la función existente

### Opción 2: Usar Supabase CLI

```bash
cd backend
supabase functions deploy mercadopago-webhook
```

## Verificar que el Webhook Está Funcionando

### 1. Prueba de Conectividad (GET)

```bash
curl -X GET https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
```

Respuesta esperada:
```json
{
  "status": "webhook activo",
  "timestamp": "2025-11-17T..."
}
```

### 2. Test en Mercado Pago Dashboard

1. Ir a [Mercado Pago Developers](https://developers.mercadopago.com)
2. Dashboard → Configuración de aplicación
3. Sección "Webhooks" → Agregar webhook
4. URL: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`
5. Eventos: `payment.updated`, `payment.created`
6. Hacer clic en "Enviar prueba"

### 3. Respuesta Esperada

La función debe responder con:

```json
{
  "success": true,
  "message": "Webhook procesado correctamente",
  "receivedAt": "2025-11-17T...",
  "requestId": "..."
}
```

## Próximos Pasos

Una vez que el webhook esté funcionando:

1. **Almacenar el Pago en Base de Datos**
   - Crear tabla `payments` en Supabase
   - Registrar: `payment_id`, `user_id`, `course_id`, `amount`, `status`

2. **Validar Firma HMAC**
   - Implementar validación de `x-signature`
   - Usar `MERCADOPAGO_WEBHOOK_SECRET`

3. **Inscribir Usuario Automáticamente**
   - Al recibir webhook con `payment.approved`
   - Inscribir usuario en el curso
   - Enviar email de confirmación

4. **Manejar Fallos de Pago**
   - Actualizar estado en base de datos
   - Notificar al usuario

## Logs

Los logs de la función se ven en:
1. Supabase Dashboard → Edge Functions → Logs
2. Consola del navegador (si se llama desde el frontend)

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Autenticación incorrecta | La función ahora acepta sin auth |
| 404 Not Found | URL incorrecta | Verificar URL de Supabase |
| 500 Internal Server | Error en la función | Revisar logs en Dashboard |
| Connection timeout | Firewall bloqueando | Verificar IP de Mercado Pago |

## Cambios Realizados

### `mercadopago-webhook/index.ts`

✅ Removida validación de autenticación innecesaria
✅ Mejorado logging para debugging
✅ Agregado soporte para `x-signature` (header de HMAC)
✅ Respondiendo correctamente con status 200
✅ Headers CORS configurados para Mercado Pago

### `.env.local`

✅ Agregada: `VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-44a40cbd-d836-4dce-9395-39a9baf220af`

### `index.html`

✅ Agregado script CDN de Mercado Pago SDK v2
✅ Script se carga automáticamente antes de la app

### `lib/mercadopago.ts`

✅ Actualizada función `initMercadoPago()` para usar SDK global
✅ Agregada declaración de tipo para `window.MercadoPago`
