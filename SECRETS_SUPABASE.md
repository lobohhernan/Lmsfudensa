# 🔐 Secrets para Supabase

Estos son los secrets que deben configurarse en Supabase Dashboard para que Mercado Pago funcione correctamente.

## Ir a Supabase Dashboard

1. https://supabase.com/dashboard
2. Seleccionar proyecto: **E-Learning:LMSFUDENSA**
3. Click en **Settings** (⚙️) en el menú izquierdo
4. Buscar sección **Functions** o **Secrets**

---

## Secret 1: MERCADOPAGO_ACCESS_TOKEN

**Necesario para:** Crear preferencias de pago

**Nombre:** 
```
MERCADOPAGO_ACCESS_TOKEN
```

**Valor:**
```
APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970
```

---

## Secret 2: MERCADOPAGO_WEBHOOK_SECRET

**Necesario para:** Validar la autenticidad de webhooks

**Nombre:**
```
MERCADOPAGO_WEBHOOK_SECRET
```

**Valor:**
```
1b1d1a70cbd291625606148d0f534edd080a968c5ecc5dfaac9d63303e065384
```

---

## Pasos para Agregar Secrets

### Opción 1: Desde el Dashboard (Recomendado)

1. Dashboard → Settings → Functions/Secrets
2. Click en **"New Secret"** o **"Add"**
3. Nombre: `MERCADOPAGO_ACCESS_TOKEN`
4. Valor: Copiar y pegar el valor arriba
5. Click en **Save**
6. Repetir para `MERCADOPAGO_WEBHOOK_SECRET`

### Opción 2: Desde Terminal (Si tienes Supabase CLI)

```bash
# Access Token
npx supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-7655981545959959-111720-406c77af170e5d846b497afc56669857-2999245970

# Webhook Secret
npx supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=1b1d1a70cbd291625606148d0f534edd080a968c5ecc5dfaac9d63303e065384
```

---

## Verificación

Después de agregar los secrets:

```bash
# Ver todos los secrets (sin mostrar valores)
npx supabase secrets list --project-ref hztkspqunxeauawqcikw
```

Deberías ver:
```
✅ MERCADOPAGO_ACCESS_TOKEN
✅ MERCADOPAGO_WEBHOOK_SECRET
```

---

## ⚠️ IMPORTANTE

- 🔒 Estos valores son **sensibles** - no compartir en público
- 🚀 Sin estos secrets, las Edge Functions **NO funcionarán**
- 🔄 Después de agregar/cambiar secrets, las funciones se redepliegan automáticamente

---

## Próximo Paso

Después de configurar los secrets:
1. Ir a https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/functions
2. Verificar que ambas funciones estén **"Active"** (verde)
3. Realizar pruebas locales

