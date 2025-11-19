# 🧪 Prueba 2: Flujo de Pago Mejorado

## ✅ Cambios Realizados Desde la Última Prueba

- ✅ Agregada página intermedia `/mp-success`
- ✅ Mercado Pago ahora redirige a `/mp-success` (en back_urls)
- ✅ `/mp-success` detecta pago aprobado y redirige a `/payment-callback`
- ✅ Edge Function actualizado y desplegado
- ✅ Frontend compilado

---

## 🚀 Pasos para Probar

### PASO 1: Acceder a un curso
1. Abre: `http://localhost:3001/`
2. Navega a un curso
3. Click en "Comprar"

### PASO 2: Completar pago
```
En Mercado Pago Checkout:
- Tarjeta: 4111 1111 1111 1111
- Vencimiento: 11/25
- CVV: 123
- Click "Pagar"
```

### PASO 3: Observar el nuevo flujo

**Después de pagar, DEBERÍAS VER:**

1. **Pantalla `/mp-success`** (NUEVO)
   ```
   [Loader animado]
   "Redirigiendo..."
   ```
   Duración: 1-2 segundos

2. **Pantalla `/payment-callback`** (Como antes)
   ```
   [Loader animado]
   "Procesando Pago"
   "Por favor espera mientras confirmamos tu pago..."
   (puede tomar entre 10-30 segundos)
   ```
   Duración: 10-30 segundos (polling)

3. **Redirigido a Home** (Final)
   ```
   ✅ Pago completado
   Curso aparece inscrito
   ```

---

## 📊 Monitoreo en Consola (F12)

**Esperado ver:**

```
✅ [MP Success] URL params: {status: "approved", paymentId: "xxx"}
✅ [MP Success] Pago detectado, redirigiendo a payment-callback...

⏳ [PaymentCallback] Intento 1 de 60
⏳ [PaymentCallback] Intento 2 de 60
✅ [PaymentCallback] Respuesta: {success: true, enrolled: true}
✅ Pago completado detectado
```

---

## ❌ Si Algo Sale Mal

### Síntoma: Sigue quedándose en Mercado Pago
**Causa:** back_urls no está funcionando
**Solución:** 
```bash
# Verificar que el deploy fue exitoso
cd backend
npx supabase functions list
# Debe mostrar: mercadopago-preference version 25+
```

### Síntoma: Error en /mp-success
**Causa:** Ruta no configurada en App.tsx
**Verificar:** Ver console para errores (F12)

### Síntoma: No llega a payment-callback
**Causa:** onNavigate no está funcionando
**Solución:** Revisar que MercadoPagoSuccess reciba onNavigate prop

---

## ✨ Resultado Esperado Final

```
✅ Pago completado exitosamente
✅ Usuario redirigido automáticamente
✅ Curso aparece inscrito en perfil
✅ Sin errores en consola
```

---

**IMPORTANTE:** 

El flujo ahora es:
1. Completa pago en Mercado Pago
2. **NUEVO:** Ve `/mp-success` redirigiendo por 1-2 segundos
3. Ve `/payment-callback` esperando 10-30 segundos
4. Redirigido a home con curso inscrito

**La diferencia clave:** Ahora SÍ hay redirección de Mercado Pago a nuestra app
