# Backend - LMS FUDENSA

Este directorio contiene el backend del proyecto LMS FUDENSA, basado en **Supabase** para la gestión de bases de datos, autenticación y funciones Edge (serverless).

## Estructura del Backend

```
backend/
├── supabase/
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx    # Función principal del servidor
│   │       └── kv_store.tsx # Almacenamiento en KV store
│   └── config.toml          # Configuración de Supabase (si existe)
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

## Funciones Principales

- **`index.tsx`**: Maneja las operaciones principales del servidor (e.g., gestión de cursos, usuarios).
- **`kv_store.tsx`**: Utilidades para almacenamiento en KV store (e.g., sesiones, caché).

## Recomendaciones

- **Seguridad**: Usa variables de entorno para claves sensibles (configura en `supabase/config.toml` o dashboard).
- **Testing**: Prueba las funciones localmente antes de desplegar.
- **Colaboración**: Usa branches para desarrollo y mergea a main para despliegue.
- **Documentación**: Mantén este README actualizado con cambios en las funciones.

## Soporte

Si encuentras problemas:

- Revisa la documentación oficial de Supabase: [docs.supabase.com](https://docs.supabase.com).
- Reporta issues en el repositorio del proyecto.

---

**Nota**: Este backend es parte del proyecto LMS FUDENSA. Para el frontend, consulta `frontend/README.md`.
