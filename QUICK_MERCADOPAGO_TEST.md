# Checklist Rápido - Mercado Pago en fudensa.netlify.app

## 🔄 Estado Actual del Deployment

**URL en Producción**: https://fudensa.netlify.app/

### ✅ Backend (Supabase Edge Functions)

| Función | Versión | Estado | Última Actualización |
|---------|---------|--------|---------------------|
| mercadopago-preference | v25 | ✅ ACTIVE | 2025-11-19 00:40 |
| mercadopago-webhook | v8 | ✅ ACTIVE | 2025-11-18 20:00 |
| check-payment-status | v1 | ✅ ACTIVE | 2025-11-19 00:29 |

### ✅ Frontend (Netlify)

| Componente | Estado | Actualizado |
|-----------|--------|------------|
| netlify.toml | ✅ Configurado | 19-Nov-2025 |
| mercadopago.ts | ✅ URL HTTPS | 19-Nov-2025 |
| index.html | ✅ Script MP | Presente |
| PaymentCallback.tsx | ✅ Polling | Implementado |

---

## 🧪 Test de Flujo Rápido (5 minutos)

### Paso 1: Ir a la app
```
→ https://fudensa.netlify.app/
```

### Paso 2: Seleccionar un curso y hacer click en "Inscribirse"

### Paso 3: Llenar el formulario
```
Email: cualquier-email@test.com
Nombre: Tu Nombre
```

### Paso 4: Hacer click en "Pagar"

### Paso 5: En ventana de Mercado Pago, usar tarjeta TEST
```
Número:     4111 1111 1111 1111
Vencimiento: 11/25
CVV:        123
Nombre:     APRO
```

### Paso 6: Validar resultado esperado
```
✅ Se abre ventana de MP
✅ Completas el pago
✅ Ventana se cierra automáticamente
✅ Ves "Procesando pago..."
✅ Eres redirigido al home
✅ El curso aparece en "Mis Cursos"
```

---

## 🔍 Monitoreo mientras Testas

### Abre DevTools (F12 → Console)

Busca estos mensajes en orden:

```
1. 🌍 [MP] Base URL del frontend: https://fudensa.netlify.app
2. 🌍 [MP] Llamando a Edge Function: mercadopago-preference
3. 📝 Creando preferencia de pago en backend...
4. ✅ [MP] Preferencia creada: [ID]
5. 🔄 [MP] Redirigiendo a Mercado Pago: https://...
6. ✅ [MP] Usuario cerró ventana de Mercado Pago
7. 🔄 [MP] Redirigiendo a payment-callback para verificar pago...
8. 📍 [PaymentCallback] URL params: {status: "approved", payment_id: ...}
9. ⏳ [PaymentCallback] Intento 1 de 60
10. ✅ [PaymentCallback] Pago aprobado según parámetros MP
11. ✅ Pago procesado exitosamente! Redirigiendo...
```

---

## ⚠️ Si Algo Falla

### 1. No se abre ventana de Mercado Pago

**En console busca**:
```
❌ [MP] [error message]
```

**Soluciones**:
- [ ] Verifica que el SDK de MP está cargado (Network → sdk.mercadopago.com)
- [ ] Verifica que `VITE_MERCADO_PAGO_PUBLIC_KEY` está configurada
- [ ] Recarga la página (Ctrl+R)

### 2. Ventana se abre pero dice "Error"

**Causa**: Edge Function no puede crear preferencia

**Soluciona**:
- [ ] Verifica que `MERCADOPAGO_ACCESS_TOKEN` está en Supabase secrets
- [ ] Mira logs en Supabase → Edge Functions → mercadopago-preference
- [ ] Busca error message en console del navegador

### 3. No redirige a /payment-callback

**Causa**: Netlify redirects no están funcionar

**Soluciona**:
- [ ] Verifica que `netlify.toml` está en la carpeta `frontend/`
- [ ] Redeploy manual en Netlify Console → Deploys → "Trigger deploy"
- [ ] Limpia cache: Ctrl+Shift+Delete

### 4. Queda en "Procesando pago..." para siempre

**Causa**: El webhook no procesó el pago O el polling no detectó la inscripción

**Soluciona**:
- [ ] Mira logs en Supabase → Edge Functions → mercadopago-webhook
- [ ] Verifica que la tabla `enrollments` tiene el registro
- [ ] Recarga la página manualmente

---

## 🚀 Próximos Pasos

1. **Hacer test completo** siguiendo el "Test de Flujo Rápido"
2. **Revisar logs** en Supabase y Netlify mientras testas
3. **Si todo funciona**: ✅ Listo para usuarios finales
4. **Si hay errores**: Revisar sección "Si Algo Falla"

---

## 📞 Debugging Avanzado

### Ver todos los logs de Supabase

```bash
# Terminal
cd backend
npx supabase functions list  # Ver todas las funciones
npx supabase functions logs mercadopago-preference --tail  # Ver logs en tiempo real
```

### Ver logs de Netlify

En Netlify Console:
```
Site settings → Build & Deploy → Deploys → Latest Deploy → Deploy log
```

### Test manual de Edge Function

```bash
curl -X POST https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-preference \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "test",
    "courseTitle": "Test Course",
    "price": 100,
    "userEmail": "test@test.com",
    "baseUrl": "https://fudensa.netlify.app"
  }'
```

---

**Última actualización**: 18 de Noviembre de 2025
**URL de Producción**: https://fudensa.netlify.app/
**Estado**: ✅ LISTO PARA TESTING
