# Backend - LMS FUDENSA

Este directorio contiene el backend del proyecto LMS FUDENSA, basado en **Supabase** para la gestión de bases de datos, autenticación y funciones Edge (serverless).

## Estructura del Backend

```
backend/
├── supabase/
│   ├── config.toml          # Configuración de Supabase
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx    # Función principal del servidor
│   │       └── kv_store.tsx # Almacenamiento en KV store
│   └── migrations/
│       └── 20241107_initial_schema.sql  # Migraciones de base de datos
├── .env.example             # Variables de entorno de ejemplo
└── README.md                # Este archivo
```

## Requisitos Previos

- **Node.js** (versión 18 o superior): [Descargar aquí](https://nodejs.org/).
- **Supabase CLI**: Instala el CLI de Supabase para gestionar el proyecto localmente.

  - **Windows (PowerShell)**: Ejecuta `winget install supabase.cli` (o descarga el binario desde [GitHub](https://github.com/supabase/cli/releases) y agrégalo al PATH).
  - Verifica la instalación: `supabase --version`.

## Instalación y Configuración

1. **Clona o navega al directorio del backend**:

   ```bash
   cd backend
   ```

2. **Inicia sesión en Supabase** (si tienes una cuenta):

   ```bash
   supabase login
   ```

3. **Configura el proyecto local** (si no tienes un proyecto remoto):
   - Si es un proyecto nuevo: `supabase init`
   - Si ya tienes un proyecto remoto: Vincúlalo con `supabase link --project-ref TU_PROJECT_REF`

4. **Instala dependencias** (si las hay en `supabase/functions/`):
   - Navega a `supabase/functions/server/` y ejecuta `npm install` si hay un `package.json`.

## Desarrollo Local

1. **Inicia el servidor local de Supabase**:

   ```bash
   supabase start
   ```

   - Esto iniciará la base de datos local, autenticación y las Edge Functions.
   - Accede al dashboard local en `http://localhost:54321`.

2. **Desarrolla las funciones**:
   - Edita los archivos en `supabase/functions/server/`.
   - Las funciones se recargan automáticamente al guardar.

3. **Prueba las funciones**:
   - Usa herramientas como Postman o curl para probar endpoints.
   - Ejemplo: `curl http://localhost:54321/functions/v1/server`

4. **Detén el servidor**:

   ```bash
   supabase stop
   ```

## Despliegue

1. **Despliega las funciones a producción**:

   ```bash
   supabase functions deploy server
   ```

   - Asegúrate de estar vinculado a un proyecto remoto.

2. **Migra la base de datos** (si hay cambios en el esquema):

   ```bash
   supabase db push
   ```

3. **Monitorea y gestiona** desde el dashboard de Supabase: [supabase.com](https://supabase.com).

## Conexión con la Base de Datos

Las Edge Functions se conectan automáticamente a la base de datos de Supabase usando el cliente integrado. Para configuraciones personalizadas:

- Usa `createClient` de `@supabase/supabase-js` en las funciones.
- Las credenciales se obtienen de las variables de entorno o configuración de Supabase.

## Conexión con el Frontend

El frontend se conecta al backend a través de la API de Supabase:

- **Cliente Supabase**: Configurado en `frontend/src/utils/supabase/info.tsx` con `projectId` y `publicAnonKey`.
- Las funciones Edge se llaman desde el frontend usando `supabase.functions.invoke('server', { body: data })`.
- Asegúrate de que las políticas RLS (Row Level Security) permitan el acceso desde el frontend.

## Funciones y Archivos Pendientes de Implementación

Esta sección lista las funciones y archivos identificados en los guidelines del proyecto que aún no están completamente implementados. Úsalas como roadmap para desarrollo futuro. Cada función incluye ubicación sugerida y descripción.

### Sección: Panel Admin

- **manageCourses()**: Ubicación: `frontend/src/pages/AdminPanel.tsx` y `backend/supabase/functions/server/index.tsx`. Gestionar cursos (crear, editar, eliminar) según Admin-YouTube-Guide.md.
- **manageUsers()**: Ubicación: `frontend/src/pages/AdminPanel.tsx` y `backend/supabase/functions/server/kv_store.tsx`. Administrar usuarios y permisos.
- **generateReports()**: Ubicación: `backend/supabase/functions/server/index.tsx`. Generar reportes de uso y ventas según E2E-Implementation-Summary.md.

### Sección: Crear Curso

- **createCourse()**: Ubicación: `frontend/src/components/CourseForm.tsx` y `backend/supabase/functions/server/index.tsx`. Crear un nuevo curso con lecciones y metadatos según Guidelines.md.
- **assignInstructor()**: Ubicación: `frontend/src/components/InstructorForm.tsx` y `backend/supabase/functions/server/index.tsx`. Asignar instructor a un curso.
- **uploadCourseAssets()**: Ubicación: `backend/supabase/functions/server/index.tsx`. Subir assets (videos, imágenes) para cursos.

### Sección: Gestión de Lecciones

- **addLesson()**: Ubicación: `frontend/src/components/LessonList.tsx` y `backend/supabase/functions/server/index.tsx`. Agregar lecciones a un curso según YouTube-Integration.md.
- **integrateYouTubeVideo()**: Ubicación: `backend/supabase/functions/server/index.tsx`. Integrar videos de YouTube en lecciones.
- **trackProgress()**: Ubicación: `frontend/src/pages/LessonPlayer.tsx` y `backend/supabase/functions/server/kv_store.tsx`. Rastrear progreso del estudiante en lecciones.

### Sección: Flujo de Compra y Pagos

- **processPayment()**: Ubicación: `frontend/src/pages/Checkout.tsx` y `backend/supabase/functions/server/index.tsx`. Procesar pagos para cursos según E2E-Purchase-Flow.md.
- **validatePurchase()**: Ubicación: `backend/supabase/functions/server/index.tsx`. Validar compra y acceso al curso.
- **issueCertificate()**: Ubicación: `frontend/src/pages/CertificateVerify.tsx` y `backend/supabase/functions/server/index.tsx`. Emitir certificado tras completar curso.

### Sección: Integración y Utilidades

- **verifyCertificate()**: Ubicación: `frontend/src/utils/certificate.ts` y `backend/supabase/functions/server/index.tsx`. Verificar autenticidad de certificados según Quick-Start-E2E.md.
- **storeSessionData()**: Ubicación: `backend/supabase/functions/server/kv_store.tsx`. Almacenar datos de sesión en KV store.

**Nota**: Implementa estas funciones gradualmente. Si necesitas archivos adicionales (e.g., hooks en frontend o functions separadas en backend), agrégalos y actualiza este README.

## Soporte

Si encuentras problemas:

- Revisa la documentación oficial de Supabase: [docs.supabase.com](https://docs.supabase.com).
- Reporta issues en el repositorio del proyecto.

---

**Nota**: Este backend es parte del proyecto LMS FUDENSA. Para el frontend, consulta `frontend/README.md`.
