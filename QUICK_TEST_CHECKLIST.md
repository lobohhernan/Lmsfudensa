# 🧪 Checklist Rápido: Testing de Pago Mercado Pago

## ✅ Estado Actual

- ✅ **Frontend:** Iniciado en `http://localhost:3001/`
- ✅ **Edge Function mercadopago-preference:** v24+ desplegado
- ✅ **Edge Function check-payment-status:** v1+ desplegado  
- ✅ **Edge Function mercadopago-webhook:** v8+ activo
- ✅ **Base de datos:** Supabase conectada
- ✅ **sessionStorage:** Implementado para tracking de pagos

---

## 🚀 Flujo de Testing (Paso a Paso)

### PASO 1: Abrir la aplicación
```
1. Abre el navegador
2. Ve a: http://localhost:3001/
3. Deberías ver la página de inicio de FUDENSA
```

### PASO 2: Navegar a un curso
```
1. Click en "Catálogo" o "Cursos"
2. Selecciona cualquier curso (ej: "Python Basics")
3. Click en "Ver Detalles" o "Comprar"
4. Deberías ver la página del curso
```

### PASO 3: Ir a checkout
```
1. En la página del curso, busca el botón "Comprar Curso" o "Adquirir"
2. Click en ese botón
3. Deberías ver la página de Checkout con:
   - Nombre del curso
   - Precio
   - Campos para email/nombre
```

### PASO 4: Completar datos y pagar
```
1. Asegúrate de que los datos sean correctos
2. Click en "Comprar" o "Pagar Ahora"
3. IMPORTANTE: Abre la consola del navegador (F12 → Console)
   para ver los logs en tiempo real
```

### PASO 5: Completar pago en Mercado Pago
```
Cuando se abra Mercado Pago:

1. Selecciona "Tarjeta de Crédito"

2. Completa con datos TEST:
   Número: 4111 1111 1111 1111
   Nombre: Tu Nombre
   Email: tu-email@example.com
   Vencimiento: 11/25 (o cualquier mes/año futuro)
   CVV: 123

3. Click en "Pagar"
```

### PASO 6: Esperar confirmación
```
Después de pagar:

1. Mercado Pago redirige automáticamente
2. Deberías ver: "Procesando Pago"
3. Espera 10-30 segundos mientras aparece un loader
4. Console mostrará "Intento 1 de 60", "Intento 2 de 60", etc.
```

### PASO 7: Verificar inscripción
```
Cuando se complete:

1. Serás redirigido al home
2. Ve a tu perfil o "Mi Biblioteca"
3. Deberías ver el curso como "Inscrito" ✅
```

---

## 📊 Monitoreo en Tiempo Real

### Consola del Navegador (F12)
```
Abre: F12 → Console
Busca logs como:
  ✅ [MP] createMercadoPagoPreference iniciado
  ✅ [MP] initPoint recibido: https://...
  ✅ [PaymentCallback] Intento 1 de 60
  ✅ [PaymentCallback] Respuesta: {enrolled: true}
```

### Supabase Functions Logs
```
Url: https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/functions

Busca logs de:
  - mercadopago-preference (debe mostrar status 201)
  - mercadopago-webhook (debe mostrar payment approved)
  - check-payment-status (debe mostrar enrolled: true)
```

---

## ❌ Si Algo Falla

### Error 400 "auto_return invalid"
```
Significa: Versión desplegada tiene auto_return
Solución: Redeploy de mercadopago-preference

cd backend
npx supabase functions deploy mercadopago-preference --no-verify-jwt
```

### PaymentCallback se queda esperando
```
Significa: Webhook no procesó el pago
Solución: Verificar logs de webhook en Supabase
  - ¿Llegó el IPN?
  - ¿Validó HMAC?
  - ¿Creó enrollment?
```

### Consola muestra error de CORS
```
Significa: Problema de permisos Edge Function
Solución: Verificar que Edge Functions tienen CORS headers
```

---

## 🎯 Resultado Esperado

✅ Después de completar todo el flujo deberías ver:

1. **En consola:**
   ```
   ✅ [PaymentCallback] Respuesta: {success: true, enrolled: true}
   ✅ [MP] Pago completado
   ```

2. **En la BD (Supabase):**
   ```
   Table: enrollments
   Tu email aparece inscrito en el curso
   ```

3. **En la app:**
   ```
   Tu perfil → Mi Biblioteca → Curso aparece como "Inscrito"
   ```

---

## 📋 Tabla de Referencia Rápida

| Elemento | Ubicación | Esperado |
|----------|-----------|----------|
| **Frontend** | http://localhost:3001 | Página de inicio |
| **Consola** | F12 → Console | Logs de [MP] y [PaymentCallback] |
| **Supabase** | Dashboard → Functions | Logs de Edge Functions |
| **BD** | Supabase → enrollments | Nueva fila con tu email |
| **Perfil** | http://localhost:3001/perfil | Curso como "Inscrito" |

---

## ⏱️ Tiempos Esperados

| Etapa | Duración |
|-------|----------|
| Crear preferencia | <1s |
| Abrir Mercado Pago | Inmediato |
| Completar pago manual | 5-10s |
| Webhook procesar | 2-5s |
| Polling detectar | 5-15s |
| **Total** | **15-30s** |

---

**¡Listo para probar! Comienza en PASO 1 y síguelos en orden.**
