# 🧪 Testing - Flujo Completo de Checkout Pro

## ✅ Pre-requisitos Verificados

- [x] Servidor frontend corre en `http://localhost:3000/`
- [x] Supabase tiene secrets configurados
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET`
- [x] Mercado Pago Account existe
- [x] Cuenta en Mercado Pago con modo Sandbox activo

---

## 🚀 Testing Paso a Paso

### PASO 1: Iniciar Servidor

```bash
cd frontend
npm run dev
```

Deberías ver:
```
✓ Vite v6.3.5 ready in XXX ms
✓ Local: http://localhost:3000/
```

### PASO 2: Abrir Aplicación

1. Abre navegador en `http://localhost:3000/`
2. Deberías ver la página de inicio
3. Inicia sesión (o crea cuenta si es necesario)

### PASO 3: Ir a un Curso

1. Click en "Ver Cursos" o "Catálogo de Cursos"
2. Selecciona cualquier curso
3. Click en "Comprar" (botón color azul)

### PASO 4: Checkout - Step 1

Deberías ver:
- ✓ Título del curso
- ✓ Descripción
- ✓ Precio
- ✓ Resumen del pedido (derecha)
- ✓ Botón "Continuar al Pago"

**Verifica en Consola (F12):**
```
🛒 [Checkout] Props: { courseId: "...", courseSlug: "...", hasUserData: true }
```

### PASO 5: Click "Continuar al Pago"

Deberías ver:
- ✓ Step 2 del checkout
- ✓ Resumen del curso
- ✓ Métodos de pago disponibles
- ✓ Botón "Ir a Mercado Pago"

**Verifica en Consola:**
```
step cambió a 2
```

### PASO 6: Click "Ir a Mercado Pago"

**Verifica en Consola (IMPORTANTE):**
```
💳 Iniciando pago con Checkout Pro...
📝 Creando preferencia de pago en backend...
✅ Preferencia creada: pref_123456...
✅ Preferencia creada, redirigiendo a Mercado Pago...
```

**Si ves estos logs = ✅ PASO CORRECTO**

**Si ves error:**
```
❌ Error al crear preferencia
```

Entonces revisar:
1. ¿Edge Function `mercadopago-preference` está deployada?
2. ¿Access Token está en Supabase secrets?
3. ¿Logs de Supabase muestran error?

### PASO 7: Mercado Pago Checkout

Serás redirigido a: `https://www.mercadopago.com.ar/checkout/v1/...`

Si NO redirige:
- Revisar que `initPoint` no es null en consola
- Verificar que `redirectToMercadoPago()` se ejecuta
- Buscar errores de CORS

Si SÍ redirige:
- Verás página de Mercado Pago
- Opción de pagar como invitado
- Seleccionar método de pago

### PASO 8: Completar Pago en Mercado Pago

1. Click "Pagar como invitado" (o login si tienes cuenta MP)
2. Selecciona "Tarjeta de crédito o débito"
3. Ingresa datos:
   - Número: `4111 1111 1111 1111` (tarjeta test VISA)
   - Mes: `11`
   - Año: `25`
   - CVV: `123`
   - Nombre: Cualquiera
   - Email: Cualquiera (ej: test@test.com)
4. Click "Pagar" o "Completar compra"

**Resultado esperado:**
- ✅ Pago aprobado
- ✅ Redirige a tu sitio

### PASO 9: CheckoutSuccess

Serás redirigido a: `http://localhost:3000/#/checkout/success?...`

Deberías ver:
- ✓ Mensaje "¡Pago Exitoso!"
- ✓ "Acceso al curso activado"
- ✓ Botones "Ver Mis Cursos" y "Volver al Inicio"

**Verifica en Consola:**
```
📚 Inscribiendo usuario ... en curso ...
✅ Usuario inscrito correctamente
```

Si ves error:
```
⚠️ Error en inscripción:
```

Entonces revisar:
1. ¿`external_reference` llega en URL?
2. ¿`enrollUser` función existe?
3. ¿Supabase Database tiene tabla `usuario_cursos`?

### PASO 10: Verificar Inscripción

1. Click "Ver Mis Cursos"
2. Deberías ver el curso comprado
3. Deberías poder ver lecciones

---

## 🐛 Troubleshooting

### Problema: No redirige a Mercado Pago

**Causa Posible:** `initPoint` es null

**Solución:**
```javascript
// En consola, antes de click al botón pago
// Agregar en Checkout.tsx:
console.log("initPoint:", initPoint);
console.log("redirectURL:", initPoint);
```

### Problema: Error 401 en Edge Function

**Causa Posible:** Access Token no configurado o incorrecto

**Solución:**
1. Ir a Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Verificar `MERCADOPAGO_ACCESS_TOKEN` está presente
4. Copiar token correcto de MP (sin espacios)

### Problema: "Usuario no autenticado" en CheckoutSuccess

**Causa Posible:** Session expiró

**Solución:**
1. Volver a login
2. Intentar compra nuevamente

### Problema: Usuario inscrito pero no ve lecciones

**Causa Posible:** Permiso en base de datos

**Solución:**
1. Revisar tabla `usuario_cursos` en Supabase
2. Verificar `inscrito = true` está guardado
3. Revisar RLS policies si están configuradas

### Problema: Webhook 401

**Ya está resuelto** - Función webhook acepta sin autenticación

### Problema: Webhook no llega

**Verificar:**
1. URL en Mercado Pago es: `https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook`
2. Eventos seleccionados: `payment.created`, `payment.updated`
3. Revisar logs de Edge Function

---

## 📊 Checklist de Validación

### ✅ Antes de Testing
- [ ] npm run dev ejecutándose
- [ ] http://localhost:3000/ abre sin errores
- [ ] Usuario logueado
- [ ] Acceso a un curso

### ✅ Durante Testing
- [ ] Step 1 muestra resumen
- [ ] Step 2 muestra opción de pago
- [ ] Click "Ir a Mercado Pago" redirige
- [ ] Logs de consola muestran preferencia creada
- [ ] Pago se completa en Mercado Pago

### ✅ Después de Testing
- [ ] Redirige a CheckoutSuccess
- [ ] Logs muestran inscripción
- [ ] "Ver Mis Cursos" muestra curso comprado
- [ ] Puedo acceder a lecciones
- [ ] Webhook eventualmente recibe notificación

---

## 🔍 Logs Esperados

### Lado Frontend
```
🛒 [Checkout] Props: {...}
💳 Iniciando pago con Checkout Pro...
📝 Creando preferencia de pago en backend...
✅ Preferencia creada: pref_123
✅ Preferencia creada, redirigiendo a Mercado Pago...
📚 Inscribiendo usuario ... en curso ...
✅ Usuario inscrito correctamente
```

### Edge Function Logs (Supabase)
```
📝 Creando preferencia de pago:
✅ Preferencia creada exitosamente: pref_123
```

### Webhook Logs (Supabase)
```
🔔 Solicitud webhook recibida:
📨 Webhook parseado:
💰 Pago creado: payment-id
✅ Respondiendo a Mercado Pago con 200
```

---

## 💡 Tips de Testing

1. **Usa DevTools (F12)** - Abre consola para ver logs
2. **Revisa Network** - Ve las requests a Edge Functions
3. **Abre Supabase Logs** - Ve qué pasa en backend
4. **Prueba múltiples cursos** - Asegúrate funciona con todos
5. **Prueba logout/login** - Verifica sesión se mantiene

---

## 🎯 Resultado Exitoso

Cuando todo funcione:
- ✅ Usuario compra curso
- ✅ Se redirige a Mercado Pago
- ✅ Completa pago
- ✅ Se redirige a CheckoutSuccess
- ✅ Se inscribe automáticamente
- ✅ Puede ver lecciones
- ✅ Webhook recibe notificación

---

## 📞 Si Algo Falla

1. **Revisar Consola del Navegador** (F12)
2. **Revisar Logs de Supabase** (Edge Functions)
3. **Verificar Secrets en Supabase**
4. **Verificar URLs son correctas**
5. **Revisar que no haya typos**

**Comandos útiles:**
```bash
# Limpiar cache
Ctrl + Shift + Del

# Recargar sin cache
Ctrl + Shift + R

# Ver logs en tiempo real
# Ir a Supabase Dashboard → Edge Functions → mercadopago-preference → Logs
```

---

**¡Listo para testing! 🚀**
