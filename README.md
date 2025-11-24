# 🎓 FUDENSA - Plataforma de Educación en Línea

[![Deploy Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square&logo=netlify)](https://fudensa.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-lobohhernan-181717?style=flat-square&logo=github)](https://github.com/lobohhernan/Lmsfudensa)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

FUDENSA es una plataforma de educación en línea moderna, escalable y segura construida con las últimas tecnologías web. Ofrece un ecosistema completo para gestionar cursos, estudiantes, pagos y certificados digitales.

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
- **Deployment Frontend**: Netlify
- **Deployment Backend**: Supabase Edge Functions
- **CI/CD**: Git push automático
- **Versionamiento**: GitHub

### Servicios Externos
- **Mercado Pago API** - Procesamiento de pagos
- **Supabase** - Backend as a Service
- **Netlify** - Hosting frontend

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

### 3. Instalar Dependencias

```bash
# Frontend
cd frontend
npm install

# Backend (si es necesario)
cd ../backend
npm install
```

### 4. Inicializar Base de Datos

```bash
cd backend
npx supabase start
npx supabase db push
```

### 5. Ejecutar en Desarrollo

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

## 📋 Estructura del Proyecto

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

### Frontend (Netlify)
```bash
# El deploy es automático al hacer push a la rama Deploy
git push origin Deploy
```

### Backend (Edge Functions)
```bash
# Deploy de funciones
cd backend
npx supabase functions deploy mercadopago-preference --no-verify-jwt
npx supabase functions deploy mercadopago-webhook --no-verify-jwt
```

---

## 📞 Soporte y Contacto

- **GitHub Issues**: [Reportar un problema](https://github.com/lobohhernan/Lmsfudensa/issues)
- **Documentación**: Ver `SETUP_REMOTE_SUPABASE.md` para guías detalladas
- **Email**: [contacto@fudensa.edu]

---

## 📄 Documentación Adicional

- [Guía de Configuración Remota](./SETUP_REMOTE_SUPABASE.md) - Configuración de Supabase remoto
- [README Frontend](./frontend/README.md) - Instrucciones específicas del frontend
- [README Backend](./backend/README.md) - Instrucciones del backend


---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autores

**Hernán Lobo**
- GitHub: [@lobohhernan](https://github.com/lobohhernan)
**Santiago Martinez**
- GitHub: [@SantiCampero](https://github.com/SantiCampero)
**Maximiliano Massey**
- GitHub: [@MaximilianoMassey](https://github.com/MaximilianoMassey)

- Proyecto Final: UTN - Trabajo Final Profesional

---

## Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Netlify](https://netlify.com) - Hosting y CI/CD
- [Tailwind CSS](https://tailwindcss.com) - Utilidades CSS
- [Shadcn UI](https://ui.shadcn.com) - Componentes React
- [Mercado Pago](https://mercadopago.com) - Procesamiento de pagos

---

