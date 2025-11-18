# ⚙️ Configurar Access Token en Supabase Dashboard

## Pasos para Configurar el Secret

### 1. Acceder al Supabase Dashboard
- Ir a: https://supabase.com/dashboard
- Seleccionar tu proyecto: **E-Learning:LMSFUDENSA**

### 2. Ir a Settings → Functions
1. En el menú lateral izquierdo, click en **Settings** (⚙️)
2. Buscar la sección **Functions** o **Secrets**
3. Click en "New Secret" o "Add Environment Variable"

### 3. Agregar la Variable

**Nombre de la variable:**
```
MERCADOPAGO_ACCESS_TOKEN
```

**Valor:**
```
APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
```

### 4. Guardar
- Click en "Save" o "Add"
- Esperar confirmación ✅

---

## Verificación

Después de agregar el secret, ejecutar en terminal:

```bash
npx supabase functions list --project-ref hztkspqunxeauawqcikw
```

Deberías ver:
```
✅ mercadopago-preference
✅ mercadopago-webhook
```

---

## 🔗 URLs de las Edge Functions (después del deploy)

```
https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-preference
https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
```

---

## 📝 Próximo Paso: Registrar Webhook en Mercado Pago

1. Ir a: https://www.mercadopago.com.ar/developers/panel/webhooks
2. Hacer login
3. Agregar URL:
   ```
   https://hztkspqunxeauawqcikw.supabase.co/functions/v1/mercadopago-webhook
   ```
4. Temas a suscribirse:
   - `payment`
   - `merchant_order`
5. Guardar

---

**⚠️ IMPORTANTE:** Sin el secret configurado, las Edge Functions no podrán autenticarse con Mercado Pago y los pagos fallarán.

