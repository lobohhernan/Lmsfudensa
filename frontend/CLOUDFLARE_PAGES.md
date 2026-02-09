# Cloudflare Pages Configuration

## Deploy Settings
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `frontend`
- **Node.js version**: `20.x`

## Environment Variables
Configurar en Cloudflare Dashboard/Pages:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

## SPA Routing
El archivo `public/_redirects` maneja automáticamente el routing de la SPA.
Todas las rutas no encontradas se redirigen a `index.html` con status 200.

## Build Optimization
- ESNext target para mejor rendimiento
- Tree-shaking automático
- Asset hashing para cache busting
- Code-splitting para rutas lazy-loaded

## Performance
- Vite dev server con HMR
- Playwright E2E tests configurados
- Vitest unit tests con coverage
