# 📚 FUDENSA - Stack Tecnológico Detallado

**Fecha:** 4 de mayo de 2026  
**Proyecto:** Plataforma de Educación en Línea FUDENSA  
**Versión:** 0.1.0

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Frontend](#frontend)
3. [Backend](#backend)
4. [Base de Datos](#base-de-datos)
5. [Servicios Externos](#servicios-externos)
6. [Infraestructura & Deployment](#infraestructura--deployment)
7. [Herramientas de Desarrollo](#herramientas-de-desarrollo)
8. [Flujo de Datos](#flujo-de-datos)
9. [Arquitectura General](#arquitectura-general)

---

## Descripción General

FUDENSA es una **plataforma de educación en línea moderna, escalable y segura** construida con un stack completamente moderno y basado en tecnologías serverless. El proyecto está diseñado para gestionar:

- 📚 Cursos y lecciones
- 👥 Usuarios y autenticación
- 💳 Pagos integrados con Mercado Pago
- 📜 Certificados digitales
- 📊 Reportes y seguimiento de progreso
- 🔐 Seguridad con Row Level Security (RLS)

---

## Frontend

### 🏗️ Estructura Tecnológica

```
FRONTEND (React SPA)
├── Framework: React 18.3.1
├── Language: TypeScript 5.9.3
├── Build Tool: Vite 6.3.5
└── Port Local: 3000
```

### 📦 Dependencias Principales

#### Framework & Runtime

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 18.3.1 | Framework UI principal |
| **React DOM** | 18.3.1 | Renderizado del DOM |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Vite** | 6.3.5 | Build tool y dev server |
| **@vitejs/plugin-react-swc** | 3.10.2 | Compilador SWC para React en Vite |

#### Routing

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React Router DOM** | 7.9.6 | Enrutamiento de páginas |

**Características:**
- SPA (Single Page Application) sin recargas
- Rutas dinámicas y anidadas
- Lazy loading de componentes
- Historial de navegación

#### Estilos & UI

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Tailwind CSS** | Latest | CSS utilities framework |
| **Shadcn UI** | Latest | Componentes sin estilos con Radix |
| **Motion** | Latest | Animaciones suaves |
| **Lucide React** | 0.487.0 | Librería de iconos |

**Componentes Radix UI Incluidos (20+):**

```typescript
@radix-ui/react-accordion       // Acordeones expandibles
@radix-ui/react-alert-dialog    // Diálogos de alerta
@radix-ui/react-aspect-ratio    // Ratio de aspecto
@radix-ui/react-avatar          // Avatares de usuario
@radix-ui/react-checkbox        // Checkboxes
@radix-ui/react-collapsible     // Contenido colapsible
@radix-ui/react-context-menu    // Menú contextual
@radix-ui/react-dialog          // Diálogos modales
@radix-ui/react-dropdown-menu   // Menús desplegables
@radix-ui/react-hover-card      // Tarjetas hover
@radix-ui/react-label           // Etiquetas formulario
@radix-ui/react-menubar         // Barra de menú
@radix-ui/react-navigation-menu // Menú navegación
@radix-ui/react-popover         // Popovers
@radix-ui/react-progress        // Barras de progreso
@radix-ui/react-radio-group     // Botones radio
@radix-ui/react-scroll-area     // Áreas con scroll
@radix-ui/react-select          // Selects personalizados
@radix-ui/react-separator       // Separadores
@radix-ui/react-slider          // Sliders
@radix-ui/react-switch          // Switches toggle
@radix-ui/react-tabs            // Pestañas
@radix-ui/react-toggle          // Botones toggle
@radix-ui/react-tooltip         // Tooltips
```

#### Formularios & Validación

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React Hook Form** | 7.55.0 | Gestión eficiente de formularios |
| **Zod** | 4.3.6 | Validación de schemas TypeScript |
| **Input OTP** | 1.4.2 | Componente para códigos OTP |

**Características:**
- Validación en tiempo real
- Integración perfecta con TypeScript
- Soporte para One-Time Password (OTP)
- Manejo de errores tipado

#### Backend & Data Fetching

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **@supabase/supabase-js** | 2.80.0 | Cliente HTTP y Realtime |

**Funcionalidades:**
- Autenticación (Email, Google OAuth)
- CRUD operations (Create, Read, Update, Delete)
- Subscripciones en tiempo real (WebSocket)
- Gestión de sesiones con JWT

#### Exportación & Generación de Documentos

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **XLSX** | 0.18.5 | Lectura y escritura de archivos Excel |
| **ExcelJS** | 4.4.0 | Generación avanzada de Excel |
| **jsPDF** | Latest | Generación de PDFs |
| **html2canvas** | Latest | Conversión HTML a imagen |

**Casos de Uso:**
- Descarga de listados en Excel
- Exportación de certificados en PDF
- Captura de reportes en imagen
- Generación de reportes avanzados

#### Componentes UI Adicionales

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Embla Carousel** | 8.6.0 | Carruseles de contenido |
| **React Resizable Panels** | 2.1.7 | Paneles redimensionables |
| **React Day Picker** | 8.10.1 | Selector de fechas |
| **Sonner** | 2.0.3 | Notificaciones (toasts) |
| **Cmdk** | 1.1.1 | Command palette |
| **Next Themes** | 0.4.6 | Gestión de temas (dark mode) |
| **Vaul** | 1.1.2 | Componente Drawer |
| **Class Variance Authority** | 0.7.1 | Utilidades de estilos |
| **Recharts** | 2.15.2 | Gráficos y visualización |
| **Clsx & Tailwind Merge** | Latest | Utilidades de clases CSS |

#### Dependencias de Desarrollo

```json
{
  "@types/node": "^20.19.24",
  "@types/react": "^19.2.2",
  "@types/react-dom": "^19.2.2",
  "vite": "6.3.5"
}
```

### 🔧 Configuración Vite

**Archivo:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],                    // Plugin React con SWC
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),  // Alias para imports
    },
  },
  build: {
    target: 'esnext',                    // Target moderno
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,            // Para React Router
  },
});
```

### 📂 Estructura de Carpetas Frontend

```
frontend/
├── public/                  # Archivos estáticos
│   ├── _redirects          # Redirecciones Cloudflare
│   ├── robots.txt          # SEO
│   ├── sitemap.xml         # Mapa del sitio
│   └── service-worker.js   # PWA support
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Componente principal
│   ├── index.css          # Estilos globales
│   ├── vite-env.d.ts      # Tipos de Vite
│   ├── assets/            # Imágenes y recursos
│   ├── components/        # Componentes reutilizables
│   │   ├── AppNavbar.tsx
│   │   ├── AppFooter.tsx
│   │   ├── CourseCard.tsx
│   │   ├── CertificateCard.tsx
│   │   ├── CertificateTemplate.tsx
│   │   ├── CourseForm.tsx
│   │   ├── TeacherForm.tsx
│   │   ├── UserForm.tsx
│   │   ├── LessonList.tsx
│   │   ├── ForgotPasswordModal.tsx
│   │   ├── PaymentTestButtons.tsx
│   │   ├── SEOHead.tsx
│   │   ├── PageLoader.tsx
│   │   ├── figma/         # Componentes Figma
│   │   └── ui/            # Componentes Shadcn
│   ├── hooks/             # Custom hooks
│   │   ├── useCourses.ts
│   │   ├── useCoursesRealtime.ts
│   │   ├── useCertificates.ts
│   │   ├── useEnrollmentProgress.ts
│   │   ├── useEnrollmentCounts.ts
│   │   ├── usePasswordReset.ts
│   │   ├── usePayments.ts
│   │   ├── useTeachers.ts
│   │   ├── useSEOTracking.ts
│   │   └── useStorageCleanup.ts
│   ├── lib/               # Utilidades y lógica
│   │   ├── supabase.ts           # Cliente público
│   │   ├── supabaseAdmin.ts      # Cliente admin
│   │   ├── mercadopago.ts        # Integración MP
│   │   ├── paymentSimulator.ts   # Simulador pagos
│   │   ├── enrollments.ts        # Lógica inscripciones
│   │   ├── adminOperations.ts    # Operaciones admin
│   │   ├── courseResolver.ts     # Resolver de cursos
│   │   ├── cacheManager.ts       # Gestión de cache
│   │   ├── logger.ts             # Logging
│   │   ├── seoConfig.ts          # Configuración SEO
│   │   └── data.ts               # Datos estáticos
│   ├── pages/             # Páginas/vistas
│   ├── styles/            # Estilos adicionales
│   └── utils/             # Funciones utilitarias
├── index.html             # HTML base
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 🎯 Scripts de Build

```json
{
  "dev": "vite",                    // Dev server en :3000
  "build": "vite build"             // Build para producción
}
```

---

## Backend

### 🔧 Arquitectura Serverless

```
BACKEND (Serverless Edge Functions)
├── Runtime: Deno
├── Language: TypeScript
├── Framework: Supabase Edge Functions
└── Entorno: Supabase
```

### 📦 Edge Functions Disponibles

#### 1. **mercadopago-webhook**
- **Propósito:** Recibir confirmaciones de pagos desde Mercado Pago
- **Método:** POST
- **JWT Requerido:** No (no-verify-jwt)
- **Funciones:**
  - Recibe notificaciones de cambios de estado de pagos
  - Actualiza registros en PostgreSQL
  - Maneja CORS para integración externa

#### 2. **mercadopago-preference**
- **Propósito:** Crear preferencia de pago para Mercado Pago
- **Método:** POST
- **JWT Requerido:** Sí
- **Funciones:**
  - Genera URL de pago segura
  - Configura montos, descripción y auto-return
  - Integra con Checkout Pro

#### 3. **check-payment-status**
- **Propósito:** Verificar estado de un pago
- **Método:** GET/POST
- **JWT Requerido:** Sí
- **Funciones:**
  - Consulta estado en Mercado Pago
  - Actualiza base de datos
  - Retorna estado actual

#### 4. **admin-operations**
- **Propósito:** Operaciones administrativas
- **Método:** POST
- **JWT Requerido:** Sí
- **Funciones:**
  - Toggle de estado admin
  - Operaciones privilegiadas
  - Validación de permisos

#### 5. **send-reset-email**
- **Propósito:** Enviar email de recuperación de contraseña
- **Método:** POST
- **JWT Requerido:** No
- **Funciones:**
  - Genera token de reset
  - Envía email con link
  - Integración con Supabase Auth

#### 6. **send_contact_email**
- **Propósito:** Procesar formulario de contacto
- **Método:** POST
- **JWT Requerido:** No
- **Funciones:**
  - Recibe datos del formulario
  - Envía email a administrador
  - Validación de datos

#### 7. **bright-action**
- **Propósito:** Webhooks para integraciones Bright
- **Método:** POST
- **JWT Requerido:** Según configuración
- **Funciones:**
  - Recibe eventos de Bright
  - Procesa acciones automáticas

#### 8. **server**
- **Propósito:** Funciones generales del servidor
- **Método:** Múltiples
- **JWT Requerido:** Según endpoint

### 🛠️ Tecnologías Backend

#### Deno Runtime

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

**Características:**
- Runtime TypeScript nativo (sin compilación manual)
- Seguridad por defecto
- Módulos ES6
- Sin node_modules

#### Cliente Supabase en Edge Functions

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
```

**Funcionalidades:**
- Service role para operaciones privilegiadas
- Acceso sin restricciones RLS
- Operaciones CRUD
- Manejo de transacciones

#### Importaciones Necesarias

```typescript
// Server HTTP
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Helpers compartidos
import { handleAdminToggleRequest } from "../_shared/adminToggleHandler.ts";
```

### 📂 Estructura Backend

```
backend/
├── functions/
│   ├── _shared/                 # Código compartido
│   │   └── adminToggleHandler.ts
│   ├── admin-operations/
│   │   └── index.ts
│   ├── bright-action/
│   │   └── index.ts
│   ├── check-payment-status/
│   │   └── index.ts
│   ├── mercadopago-preference/
│   │   └── index.ts
│   ├── mercadopago-webhook/
│   │   └── index.ts
│   ├── send-reset-email/
│   │   └── index.ts
│   ├── send_contact_email/
│   │   └── index.ts
│   └── server/
│       └── index.ts
├── shared/
│   └── types.ts                 # Tipos TypeScript compartidos
├── supabase/
│   ├── config.toml             # Configuración Supabase
│   ├── functions/              # Funciones (referencias a backend)
│   └── migrations/             # Migraciones SQL
└── README.md
```

### 📋 Configuración Supabase (config.toml)

```toml
[api]
enabled = true
port = 54321                    # REST API
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322                    # PostgreSQL
shadow_port = 54320
major_version = 15

[realtime]
enabled = true                  # WebSocket realtime

[studio]
enabled = true
port = 54323                    # Admin UI

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600              # 1 hora
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[storage]
enabled = true
file_size_limit = "50MiB"
```

---

## Base de Datos

### 🗄️ PostgreSQL (Supabase)

**Configuración:**
- Versión: PostgreSQL 15
- Alojamiento: Supabase
- Puertos Locales:
  - API REST: 54321
  - Database: 54322
  - Shadow DB: 54320

### 📊 Migraciones SQL

Las migraciones se encuentran en `backend/supabase/migrations/`:

#### 1. **20241107_initial_schema.sql**
- Esquema inicial del proyecto
- Tablas base

#### 2. **20241108_enhance_schema.sql**
- Mejoras al esquema inicial
- Campos adicionales

#### 3. **20241118_create_certificates.sql**
- Tabla `certificates`
- Almacenar certificados digitales

#### 4. **20250114_create_enrollments.sql**
- Tabla `enrollments`
- Registro de inscripciones a cursos

#### 5. **20260225_ensure_youtube_id.sql**
- Validación de YouTube IDs
- Integridad de datos de video

#### 6. **20260226_fix_profiles_and_courses_rls.sql**
- Row Level Security para `profiles`
- Row Level Security para `courses`

#### 7. **20260226_fix_profiles_rls_recursion.sql**
- Corrección de problemas de recursión en RLS

#### 8. **20260226_fix_rls_and_grants.sql**
- Permisos y grants de RLS

#### 9. **20260302_fix_profiles_rls_final.sql**
- Ajustes finales de RLS

#### 10. **20260305_create_payments.sql**
- Tabla `payments`
- Registro de transacciones
- Campos: monto, estado, ID Mercado Pago

#### 11. **20260305_fix_payments_enrollments_profiles_fk.sql**
- Foreign keys entre tablas
- Integridad referencial

#### 12. **20260313_add_is_active_to_courses_and_profiles.sql**
- Campo `is_active` para soft deletes
- Gestión de estado

#### 13. **20260411_add_payment_fields_to_enrollments.sql**
- Campos de pago en inscripciones
- Integración pagos-inscripciones

#### 14. **20260411_fix_enrollments_rls.sql**
- RLS final para inscripciones
- Seguridad de datos

### 🔐 Seguridad: Row Level Security (RLS)

**Tablas protegidas:**
- `profiles` - Perfil de usuarios
- `courses` - Información de cursos
- `enrollments` - Inscripciones a cursos
- `payments` - Datos de pagos

**Reglas:**
- Los usuarios solo ven sus propios datos
- Los instructores ven sus cursos
- Los administradores tienen acceso completo
- Validación por JWT

### 📑 Estructura de Tablas Principales

```sql
-- Usuarios (Supabase Auth)
auth.users
├── id (UUID)
├── email
├── encrypted_password
├── email_confirmed_at
└── ...

-- Perfiles
public.profiles
├── id (UUID, FK auth.users)
├── full_name
├── email
├── role (student/instructor/admin)
├── is_active
└── ...

-- Cursos
public.courses
├── id (UUID)
├── title
├── description
├── instructor_id (FK profiles)
├── price
├── is_active
├── youtube_id
└── ...

-- Inscripciones
public.enrollments
├── id (UUID)
├── user_id (FK profiles)
├── course_id (FK courses)
├── enrollment_date
├── payment_status
├── payment_id (FK payments)
└── ...

-- Pagos
public.payments
├── id (UUID)
├── user_id (FK profiles)
├── course_id (FK courses)
├── amount
├── currency
├── status
├── mercadopago_id
├── mercadopago_status
└── created_at

-- Certificados
public.certificates
├── id (UUID)
├── user_id (FK profiles)
├── course_id (FK courses)
├── issued_date
├── verification_code
└── ...
```

### 🔄 Relaciones

```
auth.users (1) ──── (N) profiles
             ├──── (N) enrollments
             ├──── (N) payments
             └──── (N) certificates

profiles (1) ──── (N) courses (como instructor)
        ├──── (N) enrollments
        ├──── (N) payments
        └──── (N) certificates

courses (1) ──── (N) enrollments
       ├──── (N) payments
       └──── (N) certificates

enrollments (1) ──── (1) payments

payments (1) ──── (1) enrollments
```

---

## Servicios Externos

### 💳 Mercado Pago

**Integración:**
- API de preferencias de pago
- Checkout Pro
- Webhooks para confirmación
- Gestión de transacciones

**Edge Functions Asociadas:**
- `mercadopago-preference` - Crear preferencia
- `mercadopago-webhook` - Recibir confirmación
- `check-payment-status` - Verificar estado

**Flujo:**
```
1. Usuario selecciona curso y paga
2. Frontend llama mercadopago-preference
3. Edge Function crea preferencia
4. Usuario es redirigido a Checkout Pro
5. Usuario completa pago
6. MP envía webhook a mercadopago-webhook
7. Se actualiza enrollment y payments
8. Usuario recibe confirmación
```

### 🔑 Google OAuth 2.0

**Integración:**
- Autenticación con cuenta Google
- Importación automática de nombre y apellido
- Social login en Supabase Auth

**Configuración:**
- Supabase Auth con Google OAuth
- Redirect URLs configuradas
- Tokens JWT para sesiones

**Flujo:**
```
1. Usuario hace clic "Continuar con Google"
2. Redirección a Google OAuth
3. Usuario autoriza acceso
4. Google retorna token
5. Supabase crea/autentica usuario
6. Frontend recibe sesión JWT
7. Usuario logueado en FUDENSA
```

---

## Infraestructura & Deployment

### 🚀 Hosting Frontend

**Plataforma:** Cloudflare Pages

**Configuración:**
- URL: `fudensa.pages.dev`
- Build command: `npm run build`
- Build output: `dist/`
- Auto-deploy desde `main`

**Características:**
- CDN global
- HTTPS automático
- Cache inteligente
- Redirecciones automáticas (`_redirects`)
- Robots.txt para SEO
- Service Worker para PWA

**Archivo `_redirects`:**
```
/* /index.html 200
```
(Permite React Router SPA)

### 🔧 Backend (Supabase)

**Plataforma:** Supabase

**Servicios:**
- PostgreSQL 15
- Edge Functions (Deno)
- Supabase Auth
- Supabase Storage
- PostgREST API
- Realtime WebSocket

**Deploy:**
```bash
npx supabase functions deploy admin-operations
npx supabase functions deploy mercadopago-webhook
# ... etc para cada función
```

### 📦 Versionamiento

**Plataforma:** GitHub

**Flujo:**
```
Local Development
    ↓
Git Commit & Push
    ↓
GitHub (Repository)
    ↓
CI/CD Trigger
    ├→ Cloudflare Pages (Frontend)
    └→ Supabase (Backend)
```

**Repositorio:** `https://github.com/lobohhernan/Lmsfudensa`

### 🔗 Dominios

- **URL Producción:** `fudensa.pages.dev`
- **Supabase URL:** `[project-id].supabase.co`

---

## Herramientas de Desarrollo

### 📋 Requisitos Mínimos

```
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.30.0
```

### 🛠️ Supabase CLI

```bash
# Instalación
npm install -g supabase

# Iniciar Supabase localmente
supabase start

# Empujar migraciones
supabase db push

# Servir Edge Functions localmente
supabase functions serve

# Deploy
supabase functions deploy [nombre-función]
```

### 📁 TypeScript en el Proyecto

**Configuración Frontend:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Alias de Rutas:**
```typescript
// tsconfig.json
"compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}

// Uso en código
import { Button } from '@/components/ui/button';
```

### 📦 Scripts Disponibles

**Frontend:**
```bash
npm run dev      # Desarrollo en :3000
npm run build    # Build para producción
```

**Backend:**
```bash
npm run deploy:functions  # Deploy todas las functions
```

**Root:**
```bash
# Script personalizado
npm run deploy:functions  # Deploy backend functions
```

---

## Flujo de Datos

### 🔄 Flujo Completo de una Inscripción

```
┌─────────────────────────────────────────────────────┐
│ 1. USUARIO INTERACTÚA EN FRONTEND (React)           │
│    └─ Click en "Pagar" → CourseCard.tsx             │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. VALIDACIÓN EN FRONTEND                            │
│    ├─ Zod schemas para validación                   │
│    ├─ React Hook Form para estado                   │
│    └─ TypeScript type-checking                      │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. AUTENTICACIÓN                                     │
│    ├─ JWT desde localStorage                        │
│    ├─ Supabase JS SDK                              │
│    └─ Headers con Authorization Bearer              │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. LLAMADA A EDGE FUNCTION (Backend)                │
│    ├─ POST /functions/v1/mercadopago-preference     │
│    ├─ Body: { courseId, userId, amount }           │
│    └─ Headers: { Authorization: Bearer JWT }        │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 5. DENO RUNTIME EJECUTA FUNCIÓN                     │
│    ├─ Valida JWT                                    │
│    ├─ Valida datos con RLS                         │
│    └─ Accede a PostgreSQL con Service Role          │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 6. QUERY A POSTGRESQL (PostgREST)                   │
│    ├─ SELECT courses WHERE id = $1                  │
│    ├─ Row Level Security valida permiso             │
│    └─ Retorna precio y datos                        │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 7. INTEGRACIÓN MERCADO PAGO                         │
│    ├─ API POST /checkout/preferences                │
│    ├─ Body: { payer, items, notification_url }     │
│    └─ Respuesta: { id, init_point (URL) }          │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 8. RESPUESTA A FRONTEND (JSON)                      │
│    └─ { preferenceId, checkoutUrl }                │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 9. REDIRECCIONAMIENTO A MERCADO PAGO                │
│    └─ window.location = checkoutUrl                │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 10. USUARIO PAGA EN MERCADO PAGO                    │
│     ├─ Ingresa tarjeta/billetera                   │
│     ├─ Confirma pago                               │
│     └─ Auto-retorna a FUDENSA                      │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 11. WEBHOOK DE MERCADO PAGO (Async)                 │
│     ├─ POST /functions/v1/mercadopago-webhook       │
│     ├─ Body: { id, topic, resource }               │
│     └─ Sin JWT (no-verify-jwt)                     │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 12. DENO PROCESA WEBHOOK                            │
│     ├─ Valida firma de Mercado Pago                │
│     ├─ Consulta estado de pago                     │
│     └─ Actualiza tabla payments                    │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 13. ACTUALIZACIÓN PostgreSQL                        │
│     ├─ INSERT/UPDATE payments                       │
│     ├─ UPDATE enrollments                           │
│     └─ Dispara trigger para certificados            │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 14. REALTIME WEBSOCKET (Supabase)                   │
│     ├─ Notifica subscribers cambios                │
│     └─ Frontend se actualiza sin refresh            │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 15. ACTUALIZACIÓN UI (React)                        │
│     ├─ useEnrollmentProgress recibe update          │
│     ├─ Re-render automático                         │
│     ├─ Muestra "Acceso al curso"                   │
│     └─ Sonner toast: "Pago procesado"              │
└─────────────────────────────────────────────────────┘
```

### 🔐 Autenticación con Google OAuth

```
┌─────────────────────────────────────────────────────┐
│ 1. Usuario hace clic "Continuar con Google"         │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. Supabase Auth redirige a Google                  │
│    └─ client_id, redirect_uri, scopes               │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. Usuario autentica en Google                      │
│    └─ Ingresa email y contraseña                   │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. Google redirige a Supabase                       │
│    └─ code parameter + estado                       │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 5. Supabase canjea código por token                 │
│    ├─ Si es nuevo usuario → crea en auth.users      │
│    ├─ Si existe → actualiza último login            │
│    └─ Genera JWT                                    │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 6. Trigger crea entry en profiles                   │
│    ├─ Copia datos de auth.users                    │
│    ├─ Full name desde Google                        │
│    └─ Role = 'student' por defecto                  │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 7. Supabase redirige a callback_url                 │
│    └─ URL contiene hash con sesión                 │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 8. Frontend procesa sesión                          │
│    ├─ Parse JWT desde URL                          │
│    ├─ Almacena en localStorage                     │
│    └─ Redux/Context con datos usuario               │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 9. Usuario logueado en FUDENSA                      │
│    ├─ Navbar muestra nombre                        │
│    ├─ Acceso a panel de usuario                    │
│    └─ Puede ver cursos inscritos                   │
└─────────────────────────────────────────────────────┘
```

---

## Arquitectura General

### 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Navegador)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  React 18.3.1 + TypeScript 5.9.3                                     │
│  ├─ React Router v7 (SPA)                                           │
│  ├─ State: Context + Hooks                                          │
│  ├─ Forms: React Hook Form + Zod                                    │
│  ├─ UI: Shadcn + Radix + Tailwind                                   │
│  ├─ Data: Supabase JS SDK 2.80.0                                    │
│  └─ Exports: XLSX, ExcelJS, jsPDF                                   │
│                                                                       │
│  Build Tool: Vite 6.3.5 → Cloudflare Pages                          │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ├──────────────────┼──────────────────┤
        ↓                  ↓                  ↓
    ┌────────┐         ┌──────────┐       ┌──────────┐
    │ Supabase Auth   │ Supabase │  MP API  │
    │                 │  REST    │          │
    │ ├─ Email        │  (54321) │ ├─ Create│
    │ ├─ Google OAuth │          │ │  Pref  │
    │ └─ JWT          │          │ ├─ Check │
    │                 │          │ │  Status│
    │                 │          │ └─ Webhook
    │                 │          │
    └────────┬────────┴──────────┴──────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTIONS (Deno)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  8 Edge Functions en TypeScript                                      │
│  ├─ mercadopago-preference                                          │
│  ├─ mercadopago-webhook                                             │
│  ├─ check-payment-status                                            │
│  ├─ admin-operations                                                │
│  ├─ send-reset-email                                                │
│  ├─ send_contact_email                                              │
│  ├─ bright-action                                                   │
│  └─ server                                                           │
│                                                                       │
│  Runtime: Deno std@0.168.0                                          │
│  SDK: @supabase/supabase-js@2.39.3                                  │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (PostgreSQL 15)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Hosted en Supabase                                                  │
│                                                                       │
│  Tablas Principales:                                                │
│  ├─ auth.users (Supabase Auth)                                      │
│  ├─ profiles                                                         │
│  ├─ courses                                                          │
│  ├─ enrollments                                                      │
│  ├─ payments                                                         │
│  ├─ certificates                                                     │
│  └─ ...                                                              │
│                                                                       │
│  Seguridad:                                                          │
│  ├─ Row Level Security (RLS)                                        │
│  ├─ Foreign Keys                                                     │
│  ├─ Índices para performance                                        │
│  └─ Triggers para automatización                                    │
│                                                                       │
│  PostgREST API: http://localhost:54321                              │
│  Realtime: WebSocket                                                │
│  Storage: 50MB límite                                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔄 Capas de la Aplicación

```
┌──────────────────────────────────────┐
│      PRESENTATION LAYER              │
│  (React Components + Hooks)          │
│  - Pages                             │
│  - Components                        │
│  - Forms                             │
│  - UI (Shadcn/Radix)                │
└─────────────┬────────────────────────┘
              │
┌─────────────▼────────────────────────┐
│      BUSINESS LOGIC LAYER            │
│  (Custom Hooks + Services)           │
│  - useCourses()                      │
│  - usePayments()                     │
│  - enrollments.ts                    │
│  - mercadopago.ts                    │
│  - cacheManager.ts                   │
└─────────────┬────────────────────────┘
              │
┌─────────────▼────────────────────────┐
│      DATA ACCESS LAYER               │
│  (Supabase SDK + Edge Functions)     │
│  - supabase.ts (client)              │
│  - supabaseAdmin.ts (admin)          │
│  - Edge Functions (Deno)             │
└─────────────┬────────────────────────┘
              │
┌─────────────▼────────────────────────┐
│      DATABASE LAYER                  │
│  (PostgreSQL)                        │
│  - Tables                            │
│  - RLS                               │
│  - Triggers                          │
│  - Functions                         │
└──────────────────────────────────────┘
```

### 🏗️ Flujo de Datos en Capas

```
USER INTERACTION
    ↓
REACT COMPONENT (App.tsx, CourseCard.tsx)
    ├─ State: useState, useContext
    ├─ Form: React Hook Form
    └─ Validation: Zod
    ↓
CUSTOM HOOK (useCourses, usePayments)
    ├─ Data fetching logic
    ├─ Caching
    └─ Error handling
    ↓
SERVICE LAYER (lib/mercadopago.ts)
    ├─ Business logic
    ├─ API calls composition
    └─ Data transformation
    ↓
SUPABASE SDK (lib/supabase.ts)
    ├─ Client authentication
    ├─ REST API calls
    └─ Realtime subscriptions
    ↓
EDGE FUNCTION (Backend)
    ├─ Authorization (JWT)
    ├─ Business logic
    └─ External API calls (Mercado Pago)
    ↓
DATABASE QUERY (PostgreSQL)
    ├─ RLS validation
    ├─ Data retrieval/mutation
    └─ Trigger execution
    ↓
RESPONSE CHAIN (Reverse)
    ├─ JSON response
    ├─ State update (React)
    └─ UI re-render (Shadcn components)
```

---

## Resumen Ejecutivo

| Aspecto | Tecnología | Versión |
|--------|-----------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Frontend Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 6.3.5 |
| **UI Components** | Shadcn + Radix | Latest |
| **Styling** | Tailwind CSS | Latest |
| **Forms** | React Hook Form + Zod | 7.55.0 + 4.3.6 |
| **Routing** | React Router | 7.9.6 |
| **HTTP Client** | Supabase JS | 2.80.0 |
| **Backend Runtime** | Deno | Latest |
| **Backend Functions** | Edge Functions | Supabase |
| **Database** | PostgreSQL | 15 |
| **Backend as a Service** | Supabase | Latest |
| **Authentication** | Supabase Auth | Latest |
| **Payments** | Mercado Pago | API |
| **Frontend Hosting** | Cloudflare Pages | CDN Global |
| **Backend Hosting** | Supabase | Managed |
| **Version Control** | GitHub | Latest |
| **Package Manager** | npm | 8+ |
| **Node.js** | Node.js | 18+ |

---

## Comandos Útiles

```bash
# FRONTEND
cd frontend
npm install
npm run dev         # :3000
npm run build       # dist/

# BACKEND
cd backend
npm install
npx supabase start
npx supabase db push
npx supabase functions serve
npm run deploy:functions

# GLOBAL
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
npm install
```

---

**Documento generado:** 4 de mayo de 2026  
**Proyecto:** FUDENSA - Plataforma de Educación en Línea  
**Desarrolladores:** Hernán Lobo, Santiago Martinez, Maximiliano Massey
