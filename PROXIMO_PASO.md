# 🎯 SIGUIENTE PASO: Configurar Secrets en Supabase

## ✅ Lo que ya se completó:

1. ✅ Edge Functions desplegadas (mercadopago-preference, mercadopago-webhook)
2. ✅ Webhook registrado en Mercado Pago
3. ✅ Clave secreta del webhook recibida y configurada
4. ✅ Validación HMAC-SHA256 implementada en la Edge Function
5. ✅ Componentes React listos
6. ✅ Páginas de resultado creadas

---

## 🔐 AHORA: Configurar los Secrets en Supabase Dashboard

### Paso 1: Abre Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/hztkspqunxeauawqcikw

Deberías ver tu proyecto: **E-Learning:LMSFUDENSA**

---

### Paso 2: Ve a Settings → Functions/Secrets

1. En el menú izquierdo, click en **Settings** (⚙️)
2. Busca la sección **"Functions"** o **"Environment Variables"** o **"Secrets"**
3. Click en **"New Secret"** o **"Add Environment Variable"**

---

### Paso 3: Agregar Secret #1 - MERCADOPAGO_ACCESS_TOKEN

**Campo "Name":**
```
MERCADOPAGO_ACCESS_TOKEN
```

**Campo "Value":**
```
APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
```

Click en **Save** o **Add**

---

### Paso 4: Agregar Secret #2 - MERCADOPAGO_WEBHOOK_SECRET

**Campo "Name":**
```
MERCADOPAGO_WEBHOOK_SECRET
```

**Campo "Value":**
```
1b1d1a70cbd291625606148d0f534edd080a968c5ecc5dfaac9d63303e065384
```

Click en **Save** o **Add**

---

## ✨ Después de Agregar los Secrets:

1. Espera ~30 segundos para que se replieguen las funciones
2. Ve a la pestaña **Functions** en el Dashboard
3. Verifica que ambas funciones están **"Active"** (con un punto verde)

---

## 📝 Archivos de Referencia:

- **SECRETS_SUPABASE.md** - Documentación detallada de los secrets
- **MERCADO_PAGO_BACKEND_SETUP.md** - Guía completa del backend
- **STATUS_MERCADO_PAGO.md** - Estado general de la implementación

---

## 🚀 Después de Configurar los Secrets:

Una vez que hayas configurado los secrets, podemos hacer pruebas locales:

```bash
# Terminal 1: Iniciar servidor frontend
cd frontend
npm run dev

# En el navegador:
# http://localhost:5173/#/checkout/[COURSE-ID]
```

---

## ⚠️ IMPORTANTE:

Sin estos secrets configurados, las Edge Functions:
- ❌ No podrán autenticarse con Mercado Pago
- ❌ No podrán crear preferencias de pago
- ❌ No podrán validar webhooks

**Los pagos no funcionarán hasta que configures estos secrets.**

---

## 💡 Pro Tips:

- 🔒 Los secrets están encriptados en Supabase
- 🔄 Los cambios se aplican automáticamente
- 📊 Puedes ver los logs en: Dashboard → Functions → Logs
- 🔍 Para debugging: `npx supabase functions logs mercadopago-preference`

---

**Una vez completado, escribe en el chat y continuamos con las pruebas locales. 🎉**

