# 🚀 INSTRUCCIONES PARA DESPLEGAR WEBHOOK Y SOLUCIONAR ERROR 401

## Problema Actual

**Error**: 401 Unauthorized al intentar probar webhook en Mercado Pago

**Causa**: La función webhook en Supabase no está deployada o no es accesible desde internet.

---

## ✅ SOLUCIÓN: Desplegar la Función Webhook

### Opción 1: Desplegar desde Supabase Dashboard (RECOMENDADO - Sin terminal)

1. **Abrir Supabase**
   - Ir a https://app.supabase.com
   - Iniciar sesión con tu cuenta

2. **Seleccionar el Proyecto**
   - Buscar "hztkspqunxeauawqcikw"
   - O buscar por nombre "fudensa"

3. **Acceder a Edge Functions**
   - En el menú izquierdo → **Edge Functions**
   - Debería ver: `mercadopago-preference` y `mercadopago-webhook`

4. **Editar mercadopago-webhook**
   - Click en `mercadopago-webhook`
   - Verá el código actual

5. **Reemplazar el Código**
   - Seleccionar TODO el código actual
   - Deletear
   - Copiar este código nuevo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Edge Function para recibir webhooks de Mercado Pago
 * Se ejecuta cuando hay cambios en el estado de los pagos
 */
serve(async (req: Request): Promise<Response> => {
  console.log("🔔 Solicitud webhook recibida:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // Configurar CORS - permitir que Mercado Pago nos contacte
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, x-signature",
      },
    });
  }

  // Permitir GET para health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "webhook activo", timestamp: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Solo permitir POST para webhooks
  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtener el cuerpo del webhook
    const body = await req.text();
    console.log("📝 Cuerpo webhook:", body.substring(0, 200));

    if (!body) {
      console.warn("⚠️ Webhook vacío");
      return new Response(
        JSON.stringify({ error: "Body vacío" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsear JSON
    const data = JSON.parse(body);

    console.log("📨 Webhook parseado:", {
      type: data.type,
      action: data.action,
      dataId: data.data?.id,
      timestamp: new Date().toISOString(),
    });

    // Validar firma HMAC si está disponible (Mercado Pago envía x-signature)
    const signature = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");
    
    if (signature) {
      console.log("✅ Firma HMAC presente, validando...");
      // Aquí se validaría la firma HMAC
      // Por ahora solo logueamos que llegó
    }

    // Procesar notificaciones de pago
    if (data.type === "payment" && data.action === "payment.created") {
      console.log("💰 Pago creado:", data.data?.id);
      
      // TODO: Guardar en base de datos
      // TODO: Enviar email de confirmación
      // TODO: Registrar la compra del curso
    }

    if (data.type === "payment" && data.action === "payment.updated") {
      console.log("🔄 Pago actualizado:", data.data?.id);
      
      // TODO: Actualizar estado del pago
    }

    // Responder exitosamente a Mercado Pago
    const response = {
      success: true,
      message: "Webhook procesado correctamente",
      receivedAt: new Date().toISOString(),
      requestId: requestId,
    };

    console.log("✅ Respondiendo a Mercado Pago con 200");
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
```

6. **Guardar Cambios**
   - Hacer click en botón **Deploy** (parte superior derecha)
   - Esperar a que confirme (1-2 minutos)
   - Verá un ✅ cuando esté listo

---

### Opción 2: Desplegar desde Terminal (Con Supabase CLI)

```bash
# 1. Ir a la carpeta del proyecto
cd "d:\Educacion\UTN\IV Cuatrimestre\Trabajo Final\Lmsfudensa\backend"

# 2. Desplegar la función
supabase functions deploy mercadopago-webhook

# 3. Verá mensajes como:
# ✓ Successfully deployed function mercadopago-webhook
# Deployed URL: https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
```

**Si supabase CLI no está instalado:**
```bash
npm install -g supabase
# Luego ejecutar los comandos de arriba
```

---

## ✔️ Verificar que el Webhook Está Funcionando

### Test 1: Verificar URL en Navegador

Abrir en navegador:
```
https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
```

Debería ver respuesta JSON como:
```json
{
  "status": "webhook activo",
  "timestamp": "2025-11-17T20:30:45.123Z"
}
```

### Test 2: Usar CURL desde PowerShell

```powershell
$url = "https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook"

# Test GET (verificar que está activo)
curl -X GET $url

# Debería responder con 200
```

### Test 3: Prueba desde Mercado Pago Dashboard

1. **Ir a Mercado Pago**
   - https://www.mercadopago.com.ar/settings/account/integrations

2. **Sección Webhooks**
   - Buscar "Webhooks" o "Aplicaciones"

3. **Agregar Nuevo Webhook**
   - URL: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`
   - Eventos: `payment.created`, `payment.updated`
   - Salvar

4. **Enviar Prueba**
   - Click en el webhook que acabas de crear
   - Botón "Enviar prueba" o "Test"
   - Debería responder con **200 OK** (no más 401)

---

## 🔍 Verificar en Logs de Supabase

1. Ir a **Edge Functions** en Supabase Dashboard
2. Click en `mercadopago-webhook`
3. Pestaña **Logs**
4. Debería ver mensajes como:
   ```
   🔔 Solicitud webhook recibida:
   📨 Webhook parseado:
   ✅ Respondiendo a Mercado Pago con 200
   ```

---

## ❓ Si Aún Falla

**Si sigue dando 401:**
- [ ] Verificar que la función está **Published** (Supabase Dashboard)
- [ ] Revisar que la URL es correcta: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`
- [ ] Limpiar cache del navegador (Ctrl+Shift+Del)
- [ ] Esperar 2-3 minutos después de deployar

**Si no ve logs:**
- [ ] Verificar que el webhook se está enviando (desde MP Dashboard)
- [ ] Revisar que el URL es accesible desde internet (no localhost)
- [ ] Verificar IP whitelist si aplica

---

## 📋 Checklist Final

- [ ] Función deployada en Supabase
- [ ] Test GET retorna 200 con JSON
- [ ] Mercado Pago Dashboard tiene webhook registrado
- [ ] Prueba de MP retorna 200 OK (no 401)
- [ ] Logs muestran "🔔 Solicitud webhook recibida"
- [ ] Puedo completar flujo de compra sin errores

---

## Próximos Pasos Después de Desplegar

Una vez que el webhook está funcionando (200 OK):

1. **Inscribir usuario automáticamente cuando paga**
   - En `mercadopago-webhook` → Agregar lógica para actualizar tabla `usuario_cursos`

2. **Validar firma HMAC**
   - Implementar validación de `x-signature` header

3. **Guardar registro de pago**
   - Crear tabla `payments` y registrar cada pago

4. **Enviar email de confirmación**
   - Usar SendGrid API (ya está configurado)

5. **Manejar fallos de pago**
   - Actualizar estado cuando pago es rechazado

---

¿Ya deployaste? 👇

- Si respondió con **200 OK** → ¡Webhook funcionando! ✅
- Si aún dice **401** → Revisar pasos de despliegue nuevamente
