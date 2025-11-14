verify-certificate — Supabase Edge Function

Descripción
-----------
Función ligera que permite verificar un certificado por su `hash`. Usa la `SERVICE_ROLE_KEY` (secret) para consultar la tabla `certificates` y devolver SOLO campos públicos:
- hash
- student_name
- course_title
- issue_date
- status
- completion_date

Estructura de archivos
----------------------
backend/functions/verify-certificate/
  - index.ts        # Código de la función (Deno)
  - README.md       # Este archivo

Variables de entorno (necesarias)
--------------------------------
- SUPABASE_URL: la URL pública de tu proyecto Supabase (ej: https://xyzcompany.supabase.co)
- SUPABASE_SERVICE_ROLE_KEY: la service_role key (guardar como secret en Supabase Functions)

Despliegue (Supabase CLI)
-------------------------
1. Instala y configura la CLI si no la tienes: https://supabase.com/docs/guides/cli
2. Desde la raíz del repo, linkea el proyecto si no está linkeado:

```powershell
supabase login
supabase link --project-ref <your-project-ref>
```

3. Desde la carpeta de la función o la raíz donde esté `functions/verify-certificate` despliega:

```powershell
supabase functions deploy verify-certificate
```

4. En la UI de Supabase Functions, añade el secret `SUPABASE_SERVICE_ROLE_KEY` con tu `service_role`.

Pruebas rápidas
---------------
Suponiendo que la función está desplegada en:
https://<project>.functions.supabase.co/verify-certificate

Ejemplo curl:

```bash
curl -s "https://<project>.functions.supabase.co/verify-certificate?hash=<el_hash_a_verificar>" | jq
```

Respuesta esperada (200):

```json
{
  "certificate": {
    "hash": "...",
    "student_name": "Juan Pérez",
    "course_title": "RCP Básico",
    "issue_date": "2025-11-14T...Z",
    "status": "active",
    "completion_date": "2025-10-01"
  }
}
```

Errores:
- 400: falta `hash` o input inválido
- 404: no encontrado
- 500: error interno

Notas de seguridad
------------------
- NO publiques la `SERVICE_ROLE_KEY` en el frontend.
- Puedes añadir rate-limiting y caching en la función si esperas mucho tráfico.
- Si prefieres no usar funciones, como alternativa segura puedes crear una MATERIALIZED VIEW pública con sólo campos seguros y controlar su `REFRESH` desde un proceso seguro.

¿Quieres que también genere un pequeño wrapper frontend (`frontend/src/hooks/useVerifyCertificate.ts`) para llamar a la función? (Lo agrego localmente sin commitear si querés.)
