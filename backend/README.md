# Backend - FUDENSA

Backend serverless con Supabase (PostgreSQL) y Edge Functions (Deno).

## 🚀 Inicio Rápido

```bash
npm install
npx supabase start
npx supabase db push
npx supabase functions serve
```

## 📁 Estructura

```
supabase/
├── migrations/           # Migraciones SQL
├── functions/           # Edge Functions
│   ├── mercadopago-preference/
│   └── mercadopago-webhook/
└── config.toml
```

## 🔧 Comandos Útiles

```bash
# Iniciar Supabase localmente
npx supabase start

# Ejecutar migraciones
npx supabase db push

# Servir Edge Functions
npx supabase functions serve

# Deploy a producción
npx supabase functions deploy admin-operations
npx supabase functions deploy bright-action
npx supabase functions deploy check-payment-status
npx supabase functions deploy mercadopago-preference --no-verify-jwt
npx supabase functions deploy mercadopago-webhook --no-verify-jwt
npx supabase functions deploy send-reset-email
npx supabase functions deploy send_contact_email
npx supabase functions deploy server

# Ver logs
npx supabase functions logs mercadopago-webhook
```

## 🌍 Variables de Entorno

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MERCADOPAGO_ACCESS_TOKEN=
```

## 📚 Tecnologías

- PostgreSQL (Supabase)
- Deno Runtime
- Edge Functions
- PostgREST API

## 📖 Documentación

Ver [README.md](../README.md) principal para información completa.
