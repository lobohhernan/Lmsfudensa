
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
- `npm run preview` - Vista previa del build

### Testing
- `npm run test` - Ejecutar tests en watch mode
- `npm run test:run` - Ejecutar tests una sola vez
- `npm run test:ui` - Vitest UI Dashboard
- `npm run test:coverage` - Generar reporte de cobertura
- `npm run e2e` - Ejecutar E2E tests (headless)
- `npm run e2e:headed` - E2E tests con navegador visible
- `npm run e2e:debug` - Debug de E2E tests
- `npm run e2e:report` - Ver reporte de E2E tests

## 📚 Documentación

- [TESTING.md](./TESTING.md) - Guía completa de testing
- [E2E_TESTING.md](./E2E_TESTING.md) - Testing E2E con Playwright
- [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) - Configuración para Cloudflare Pages
- [README.md](../README.md) - Documentación principal del proyecto

## 🏗️ Arquitectura

- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context API + Supabase
- **Testing**: Vitest + @testing-library + Playwright
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)

## 🚢 Deploy

### Cloudflare Pages (Recomendado)
1. Conectar repositorio a Cloudflare
2. Build command: `npm run build`
3. Build folder: `frontend/dist`
4. Configurar variables de entorno en Cloudflare Dashboard

Ver [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) para más detalles.

## 📊 Código de Calidad

- **Coverage**: 40%+ (objetivo 50%+)
- **Type Safety**: Strict mode habilitado
- **Tests**: 67 unit tests + 17 E2E tests
- **CI/CD**: GitHub Actions con testing automático

## 🔑 Variables de Entorno

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

  