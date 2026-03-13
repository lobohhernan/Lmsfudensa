# 🎓 FUDENSA - Plataforma de Educación en Línea

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=flat-square&logo=cloudflare)](https://fudensa.pages.dev)
[![GitHub](https://img.shields.io/badge/GitHub-lobohhernan-181717?style=flat-square&logo=github)](https://github.com/lobohhernan/Lmsfudensa)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/badge/Contributors-3-blue?style=flat-square)](https://github.com/lobohhernan/Lmsfudensa/graphs/contributors)

FUDENSA es una plataforma de educación en línea moderna, escalable y segura construida con las últimas tecnologías web. Ofrece un ecosistema completo para gestionar cursos, estudiantes, pagos y certificados digitales.

**Desarrollado por:** [Hernán Lobo](https://github.com/lobohhernan) · [Santiago Martinez](https://github.com/SantiCampero) · [Maximiliano Massey](https://github.com/MaximilianoMassey)

---

## 🌟 Características Principales

### 📚 Gestión de Cursos
- Catálogo dinámico de cursos con búsqueda y filtrado
- Lecciones organizadas en módulos
- Reproductor de video integrado con controles avanzados
- Materiales descargables y recursos

### 💳 Integración de Pagos
- **Mercado Pago** como procesador de pagos
- Checkout Pro con auto-return
- Webhook para confirmación automática de pagos
- Manejo seguro de transacciones con Row Level Security (RLS)

### 👥 Sistema de Usuarios
- Autenticación con **Supabase Auth**
- **Login con Google OAuth 2.0** (nombre y apellido importados automáticamente)
- Perfiles de usuario personalizables
- Sistema de roles (Estudiante, Instructor, Admin)
- Dashboard de usuario con progreso de cursos

### 📜 Certificados Digitales
- Generación automática de certificados al completar cursos
- Descarga en formato PDF
- Verificación de certificados con código único
- Diseño personalizable

### 📊 Sistema de Evaluación
- Cuestionarios interactivos
- Seguimiento de progreso en tiempo real
- Calificaciones automáticas
- Reportes de desempeño

### 🎨 Diseño Responsivo
- Interfaz moderna y limpia con Tailwind CSS
- Componentes reutilizables con **Shadcn UI**
- Totalmente responsiva (móvil, tablet, desktop)
- Tema claro/oscuro (dark mode)

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18+ con TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Shadcn UI
- **Estado**: React Context + Hooks
- **HTTP Client**: Supabase JS SDK

### Backend
- **Base de Datos**: PostgreSQL (via Supabase)
- **Autenticación**: Supabase Auth
- **Serverless**: Edge Functions (Deno)
- **Almacenamiento**: Supabase Storage
- **ORM**: PostgREST API

### DevOps
- **Deployment Frontend**: Cloudflare Pages
- **Deployment Backend**: Supabase Edge Functions
- **CI/CD**: Git push automático desde main
- **Versionamiento**: GitHub

### Servicios Externos
- **Mercado Pago API** - Procesamiento de pagos
- **Supabase** - Backend as a Service
- **Cloudflare Pages** - Hosting frontend
- **Google OAuth 2.0** - Autenticación con cuenta Google

---

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Git
- Cuenta en Supabase
- Cuenta en Mercado Pago

### 1. Clonar el Repositorio
```bash
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
```

### 2. Configurar Variables de Entorno

#### Frontend (`frontend/.env.local`)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica
VITE_MERCADO_PAGO_PUBLIC_KEY=tu_clave_publica_mp
```

#### Backend (`backend/.env`)
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service
MERCADOPAGO_ACCESS_TOKEN=tu_token_mp
```

### 3. Configurar Google OAuth (para login con Google)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **Create OAuth 2.0 Client ID**
2. Tipo de aplicación: **Aplicación web**
3. En **Orígenes autorizados de JavaScript** agregar:
   ```
   http://localhost:5173
   https://lmsfudensa.pages.dev
   ```
4. En **URIs de redireccionamiento autorizados** agregar:
   ```
   https://hztkspqunxeauawqcikw.supabase.co/auth/v1/callback
   ```
5. Click en **Crear** — copiar el **Client ID** y **Client Secret**
6. En [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers → Google → habilitar y pegar las credenciales → **Save**

### 4. Instalar Dependencias

```bash
# Frontend
cd frontend
npm install

# Backend (si es necesario)
cd ../backend
npm install
```

### 5. Inicializar Base de Datos

```bash
cd backend
npx supabase start
npx supabase db push
```

### 6. Ejecutar en Desarrollo

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend (si usas Edge Functions)
cd backend
npx supabase functions serve
```

La aplicación estará disponible en `http://localhost:5173`

---

## � Deployment & CI/CD

### Deployment

El proyecto se despliega automáticamente en Cloudflare Pages al hacer push a la rama main.

```bash
# Deploy automático
git push origin main
```

### Configuration

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones completas de configuración.

### Deployment URLs

- **Production**: https://lmsfudensa.pages.dev

---

## �📋 Estructura del Proyecto

```
Lmsfudensa/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── lib/             # Utilidades y APIs
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # Estilos globales
│   │   └── App.tsx
│   └── package.json
│
├── backend/                  # Backend con Edge Functions
│   ├── supabase/
│   │   ├── migrations/      # Migraciones SQL
│   │   ├── functions/       # Edge Functions Deno
│   │   │   ├── mercadopago-preference/
│   │   │   └── mercadopago-webhook/
│   │   └── config.toml
│   └── README.md
│
├── README.md                 # Este archivo
├── SETUP_REMOTE_SUPABASE.md  # Guía de configuración
└── .gitignore
```

---

## 🔐 Variables de Entorno Necesarias

### Supabase
- `VITE_SUPABASE_URL` - URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave pública de Supabase

### Google OAuth
- Configurado directamente en el Dashboard de Supabase (no requiere variables de entorno adicionales)

### Mercado Pago
- `VITE_MERCADO_PAGO_PUBLIC_KEY` - Clave pública (solo lectura)
- `MERCADOPAGO_ACCESS_TOKEN` - Token de acceso (servidor, secreto)

### Base de Datos
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de administrador (servidor, secreto)

---

## 🔄 Flujo de Pago

```
1. Estudiante en Checkout
   ↓
2. Frontend crea preferencia con userId
   ↓
3. Mercado Pago Checkout Pro
   ↓
4. Pago aprobado
   ↓
5. Redirect a CheckoutSuccess
   ↓
6. Webhook crea inscripción con userId correcto
   ↓
7. Estudiante puede acceder al curso
```

---

## 📱 Características de Seguridad

### Row Level Security (RLS)
- Políticas específicas para cada tabla
- Usuarios solo pueden ver sus datos
- Datos públicos (cursos) accesibles a todos

### Autenticación JWT
- Tokens seguros de Supabase
- Refresh tokens automáticos
- Manejo seguro de sesiones

### CORS y Headers
- Headers de seguridad en Edge Functions
- Validación de CORS
- Protección contra ataques comunes

---

## 🚢 Deploy

### Frontend (Cloudflare Pages)
```bash
# El deploy es automático al hacer push a la rama main
git push origin main
```

**URL en Producción**: [https://fudensa.pages.dev](https://fudensa.pages.dev)

### Backend (Edge Functions)
```bash
# Deploy de funciones
cd backend
npx supabase functions deploy admin-operations
npx supabase functions deploy bright-action
npx supabase functions deploy mercadopago-preference --no-verify-jwt
npx supabase functions deploy mercadopago-webhook --no-verify-jwt
```

---

## 📞 Soporte y Contacto

- **GitHub Issues**: [Reportar un problema](https://github.com/lobohhernan/Lmsfudensa/issues)
- **Email**: [contacto@fudensa.edu]

---

## 📄 Documentación Adicional

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [README Frontend](./frontend/README.md) - Instrucciones específicas del frontend
- [README Backend](./backend/README.md) - Instrucciones del backend

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Contribuidores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/lobohhernan">
        <img src="https://github.com/lobohhernan.png" width="100px;" alt="Hernán Lobo"/><br />
        <sub><b>Hernán Ignacio Lobo Campero</b></sub>
      </a><br />
      <a href="https://github.com/lobohhernan/Lmsfudensa/commits?author=lobohhernan" title="Code">💻</a>
    </td>
    <td align="center">
      <a href="https://github.com/SantiCampero">
        <img src="https://github.com/SantiCampero.png" width="100px;" alt="Santiago Martinez"/><br />
        <sub><b>Santiago Martinez Campero</b></sub>
      </a><br />
      <a href="https://github.com/lobohhernan/Lmsfudensa/commits?author=SantiCampero" title="Code">💻</a>
    </td>
    <td align="center">
      <a href="https://github.com/MaximilianoMassey">
        <img src="https://github.com/MaximilianoMassey.png" width="100px;" alt="Maximiliano Massey"/><br />
        <sub><b>Massey Maximiliano</b></sub>
      </a><br />
      <a href="https://github.com/lobohhernan/Lmsfudensa/commits?author=MaximilianoMassey" title="Code">💻</a>
    </td>
  </tr>
</table>

**Proyecto Final:** UTN - Trabajo Final Profesional

---

## Agradecimientos

- [Cloudflare Pages](https://pages.cloudflare.com) - Hosting y CI/CD
- [Mercado Pago](https://mercadopago.com) - Procesamiento de pagos
- [Shadcn UI](https://ui.shadcn.com) - Componentes React
- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utilidades CSS

---

