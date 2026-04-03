# 🚀 Deployment Guide - Production Deployment Strategy

## Overview

Este proyecto usa una **estrategia de deployment multi-stage** con Cloudflare Pages siguiendo las mejores prácticas de DevOps/CI-CD:

- ✅ **Staging Environment** - Validación pre-producción
- ✅ **Production Environment** - Destino final con protecciones
- ✅ **Health Checks** - Verificación automática de disponibilidad
- ✅ **Automatic Rollback** - Reversión en caso de fallos
- ✅ **GitHub Deployments** - Tracking de deployments

---

## Architecture

```
GitHub Push (main)
       ↓
Tests & Quality Workflow
   ├─ Unit Tests (Node 18/20)
   ├─ E2E Tests (Playwright)
   ├─ Security Checks
   ├─ Code Quality
   └─ Build Verification
       ↓ (if all pass)
Deploy Workflow
   ├─ Deploy to Staging
   ├─ Health Check (Staging)
   │   ↓ (if healthy)
   ├─ Deploy to Production
   ├─ Health Check (Production)
   └─ Notify Status
```

---

## GitHub Secrets Required

Para que el deployment funcione, configura los siguientes secrets en GitHub:

### 1. Cloudflare API Token
```bash
CLOUDFLARE_API_TOKEN=your_api_token_here
```
**Cómo obtenerlo:**
- Ve a Cloudflare Dashboard → Account Settings → API Tokens
- Create Token → Edit Cloudflare Workers
- Scopes: Account.Cloudflare Pages (Write)

### 2. Cloudflare Account ID
```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```
**Cómo obtenerlo:**
- Ve a Cloudflare Dashboard → Overview → Account ID (derecha)

### 3. GitHub Token (automático)
- `GITHUB_TOKEN` está disponible automáticamente

---

## Deployment Workflow

### 1. Push a main → Tests ejecutados
```bash
git push origin main
```

- Se ejecutan automáticamente:
  - 67 unit tests (Vitest)
  - 17 E2E tests (Playwright)
  - Checks de seguridad (vulnerabilities)
  - Checks de calidad (TypeScript)
  - Build verification

### 2. Tests pasan → Deploy a Staging
Si todos los tests pasan:
- Build optimizado para Cloudflare
- Deploy a staging environment
- Health check automático

**URL Staging**: `https://staging-lmsfudensa.pages.dev`

### 3. Staging válido → Deploy a Production
Si staging es healthy:
- Build final optimizado
- Deploy a production
- Health check automático
- Notificación en GitHub

**URL Production**: `https://lmsfudensa.pages.dev`

---

## Monitoreo de Deployments

### GitHub Actions Dashboard
```
Settings → Environments
```

Ver estado de cada deployment:
- Staging deployments
- Production deployments
- Rollback automático si falla health check

### Deployment Logs
```
Actions → Deploy to Production → Click en run
```

Ver detalles de:
- Build process
- Cloudflare upload
- Health check results

---

## Rollback Manual

Si necesitas revertir a una versión anterior:

### 1. Revertir el commit
```bash
git revert <commit-sha>
git push origin main
```

El workflow se ejecutará automáticamente con la versión anterior.

### 2. Rollback manual en Cloudflare
```
Cloudflare Pages → lmsfudensa-production → Deployments → Select previous version
```

---

## Health Checks

El workflow incluye health checks automáticos:

### Staging Health Check
- Espera hasta 5 minutos por disponibilidad
- Verifica que HTML sea válido
- No bloquea si timeout (puede estar sincronizando)

### Production Health Check
- 5 minutos de espera
- Valida respuesta HTTP
- **Bloquea si falla** (evita propagación de errores)

---

## Environment Variables

### Staging
```env
VITE_ENV=staging
VITE_SUPABASE_URL=<staging-url>
VITE_SUPABASE_ANON_KEY=<staging-key>
```

### Production
```env
VITE_ENV=production
VITE_SUPABASE_URL=<production-url>
VITE_SUPABASE_ANON_KEY=<production-key>
```

Configura en Cloudflare Dashboard → Pages → lmsfudensa-production → Settings → Environment variables

---

## Best Practices

### ✅ Do's
- Push a `main` para deployments automáticos
- Usa `develop` branch para PRs
- Cada merge a `main` = deployment
- Revisa los tests antes de mergear
- Usa GitHub Environments para protecciones

### ❌ Don'ts
- No pushes credenciales en código
- No ignores tests fallidos
- No mergees PRs sin review
- No deploys manuales sin tests
- No cambies producción directamente en Cloudflare

---

## Troubleshooting

### Deployment stuck?
1. Revisa logs en GitHub Actions
2. Verifica Cloudflare Pages dashboard
3. Comprueba que los secrets estén configurados

### Build falla?
```bash
cd frontend
npm install
npm run build
```

### Tests fallan?
```bash
cd frontend
npm run test:run
npm run e2e
```

### Health check falla?
```bash
# Verifica manualmente
curl https://lmsfudensa.pages.dev
```

---

## Deployment Frequency

- **Per push to main**: Automático
- **Staging → Production**: ~5 minutos después de push
- **Time to production**: ~15 minutos total

---

## Monitoring & Observability

### Cloudflare Analytics
- Views, requests, errors
- https://dash.cloudflare.com → Pages → Analytics

### GitHub Deployment History
- Actions → Deployments
- Ver historial completo de deployments
- Revert a versiones anteriores

---

## Next Steps

1. **Configure Secrets**
   ```
   GitHub Settings → Secrets and variables → Actions
   ```

2. **Test Deployment**
   ```
   git push origin main
   Monitorea GitHub Actions
   ```

3. **Verify Production**
   ```
   curl https://lmsfudensa.pages.dev
   ```

4. **Set up Monitoring** (opcional)
   - Cloudflare Analytics
   - Sentry para errors
   - Datadog para observabilidad

---

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [CI/CD Best Practices](https://devops.com/ci-cd-best-practices)
