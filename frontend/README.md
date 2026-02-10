
# Frontend - FUDENSA

Aplicación React moderna para FUDENSA con Vite, TypeScript, y Tailwind CSS.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

Disponible en `http://localhost:3000`

## 🔧 Scripts

### Desarrollo
- `npm run dev` - Servidor de desarrollo con HMR
- `npm run build` - Build para producción

## 📚 Documentación

- [README.md](../README.md) - Documentación principal del proyecto

## 🏗️ Arquitectura

- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context API + Supabase
- **Testing**: Vitest + @testing-library + Playwright
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
 Deploy

### Cloudflare Pages (Recomendado)
1. Conectar repositorio a Cloudflare
2. Build command: `npm run build`
3. Build folder: `frontend/dist`
4. Configurar variables de entorno en Cloudflare Dashboard

Ver [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) para más detalles.
DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE
## 📊 Código de Calidad

- **Coverage**: 40%+ (objetivo 50%+)
- **Type Safety**: Strict mode habilitado
- **CI/CD**: GitHub Actions con deployment
## 🔑 Variables de Entorno

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

  