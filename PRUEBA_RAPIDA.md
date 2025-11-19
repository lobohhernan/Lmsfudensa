# 🎬 PRUEBA RÁPIDA: 5 Minutos

## 1️⃣ Servidor Ya Está Corriendo

✅ http://localhost:3001/

---

## 2️⃣ Abre el Navegador

Ve a:
```
http://localhost:3001/#/checkout
```

O con un curso específico (ver lista de cursos):
```
http://localhost:3001/#/courses
```

Elige un curso y haz click en "Comprar"

---

## 3️⃣ Completa el Formulario

Deberías ver:
- ✅ Resumen del curso
- ✅ Email del usuario
- ✅ Botón "💳 Ir a Mercado Pago"

---

## 4️⃣ Presiona el Botón

Click en **"💳 Ir a Mercado Pago"**

---

## 5️⃣ Serás Redirigido a Mercado Pago

Verás página de pago con:
- Email solicitado
- Formulario de tarjeta

**Ingresa estos datos:**
```
Tarjeta:       4111 1111 1111 1111
Vencimiento:   12/25
CVV:           123
Titular:       (cualquier nombre)
Email:         test@example.com
```

---

## 6️⃣ Completa el Pago

Click en "Pagar"

---

## 7️⃣ Verifica el Resultado

Después de unos segundos, deberías ser redirigido a:

✅ **`/#/checkout/success`** - Si todo funcionó

O

❌ **`/#/checkout/failure`** - Si hay error

---

## 🔍 Ver los Logs

En otra terminal (en la carpeta del proyecto):

```powershell
# Ver logs de la función que crea preferencias
npx supabase functions logs mercadopago-preference --project-ref hztkspqunxeauawqcikw --tail

# O ver logs de la función que recibe webhooks
npx supabase functions logs mercadopago-webhook --project-ref hztkspqunxeauawqcikw --tail

# O ejecutar el script (Windows)
.\ver_logs.bat
```

---

## 📊 Qué Esperar Ver en los Logs

### En mercadopago-preference:
```
📝 Creando preferencia de pago: {
  courseId: "course-123",
  courseTitle: "Mi Curso",
  price: 1000,
  email: "user@example.com"
}

✅ Preferencia creada exitosamente: pref_abc123xyz
```

### En mercadopago-webhook:
```
📨 Webhook recibido: {
  signature: "✅ Presente",
  type: "payment",
  action: "payment.created"
}

✅ Firma verificada correctamente

💰 Pago creado: 123456789
```

---

## 🎉 Si Todo Funcionó:

✅ Servidor frontend corriendo
✅ Edge Functions responden
✅ Mercado Pago crea preferencia
✅ Usuario puede pagar
✅ Webhook se recibe
✅ Logs muestran todo correcto

**La integración Mercado Pago está 100% operativa!** 🚀

---

## ❌ Si Hay Errores:

1. Abre F12 (console del navegador)
2. Ve los logs de las Edge Functions
3. Revisa que los secrets estén en Supabase
4. Verifica que las funciones sean "Active" en Dashboard

Reporta cualquier error que veas en los logs.

