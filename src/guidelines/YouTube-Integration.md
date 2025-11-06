# Integración de Videos de YouTube en FUDENSA LMS

## Descripción General

FUDENSA LMS está configurado para reproducir videos de YouTube en modo privado o no listado. Los videos se integran directamente en el reproductor de lecciones usando iframes de YouTube.

## Configuración de Videos en YouTube

### 1. Subir Videos a YouTube

1. **Accede a YouTube Studio**: https://studio.youtube.com
2. **Sube tu video**: Click en "Crear" → "Subir videos"
3. **Configura la privacidad**:
   - **No listado**: El video no aparecerá en búsquedas, pero cualquiera con el enlace puede verlo (Recomendado para FUDENSA)
   - **Privado**: Solo tú y las personas que especifiques pueden ver el video

### 2. Obtener el ID del Video

Una vez subido el video, YouTube te dará una URL como:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

El **ID del video** es la parte después de `v=`, en este caso: `dQw4w9WgXcQ`

### 3. Agregar el ID al Sistema

#### Opción A: Desde el Panel Admin

1. Ve al **Panel Admin** en FUDENSA
2. Selecciona **"Editar Curso"** o **"Crear Nuevo Curso"**
3. En la pestaña **"Lecciones"**:
   - Asegúrate que el tipo de lección sea **"Video"**
   - En el campo **"ID de YouTube"**, pega solo el ID (ej: `dQw4w9WgXcQ`)
4. Guarda el curso

#### Opción B: Directamente en el código

En `/lib/data.ts` o `/pages/LessonPlayer.tsx`:

```typescript
const lessons: LessonWithYoutube[] = [
  { 
    id: "1", 
    title: "Introducción a RCP", 
    duration: "15 min", 
    type: "video", 
    completed: false, 
    locked: false, 
    youtubeId: "TU_ID_AQUI"  // ← Reemplaza con tu ID
  },
];
```

## Características del Reproductor

El reproductor de YouTube integrado incluye:

- ✅ **Controles nativos de YouTube** (play, pause, volumen, pantalla completa)
- ✅ **Soporte para subtítulos** (si están configurados en YouTube)
- ✅ **Reproducción en calidad adaptativa** (ajuste automático según conexión)
- ✅ **Enlace directo a YouTube** (icono en la esquina superior derecha)
- ✅ **Sin videos relacionados** al finalizar (parámetro `rel=0`)
- ✅ **Interfaz minimalista** de YouTube (parámetro `modestbranding=1`)

## Parámetros de YouTube Utilizados

El iframe utiliza estos parámetros en la URL:

```
https://www.youtube.com/embed/{VIDEO_ID}?rel=0&modestbranding=1&fs=1&cc_load_policy=1
```

- `rel=0`: No muestra videos relacionados al finalizar
- `modestbranding=1`: Minimiza el logo de YouTube
- `fs=1`: Permite pantalla completa
- `cc_load_policy=1`: Carga subtítulos si están disponibles

## Recomendaciones de Privacidad

### Videos "No Listados" (Recomendado)
✅ Cualquier estudiante inscrito puede ver el video
✅ No aparecen en búsquedas de YouTube
✅ Fácil de compartir y gestionar
✅ Ideal para cursos de pago

### Videos "Privados"
⚠️ Solo usuarios específicos pueden verlos
⚠️ Requiere compartir manualmente con cada email
❌ No funciona bien para múltiples estudiantes

## Buenas Prácticas

1. **Organización**: Crea una playlist privada en YouTube por cada curso
2. **Nombres claros**: Usa el mismo título en YouTube que en FUDENSA
3. **Miniaturas**: Configura miniaturas personalizadas para mejor presentación
4. **Subtítulos**: Agrega subtítulos automáticos o manuales para accesibilidad
5. **Backup**: Guarda una copia de los videos en un almacenamiento local

## Solución de Problemas

### El video no se reproduce

1. Verifica que el ID del video sea correcto
2. Confirma que el video esté en modo "No listado" (no "Privado")
3. Revisa que el video haya terminado de procesarse en YouTube
4. Asegúrate que el video no tenga restricciones de edad

### El video muestra "Video no disponible"

- El video fue eliminado de YouTube
- El video es "Privado" y no "No listado"
- YouTube está experimentando problemas técnicos

### No aparecen los subtítulos

- Ve a YouTube Studio → Editar video → Subtítulos
- Genera subtítulos automáticos o sube un archivo SRT

## Estructura de Datos

```typescript
// Tipo CourseLesson en /lib/data.ts
export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "quiz" | "document";
  completed?: boolean;
  locked?: boolean;
  description?: string;
  youtubeId?: string;  // ID del video de YouTube
}
```

## Ejemplo Completo

```typescript
const cursoRCP: FullCourse = {
  id: "rcp-adultos",
  title: "RCP Adultos AHA 2020",
  lessons: [
    {
      id: "1",
      title: "Introducción a RCP",
      duration: "15 min",
      type: "video",
      youtubeId: "abc123def45",  // Tu ID real
      locked: false
    },
    {
      id: "2",
      title: "Compresiones torácicas",
      duration: "20 min",
      type: "video",
      youtubeId: "xyz789ghi12",  // Tu ID real
      locked: false
    }
  ]
}
```

## Próximos Pasos

Para implementar videos privados con autenticación avanzada, considera:

1. **Vimeo Pro/Business**: Mejor control de privacidad
2. **Cloudflare Stream**: Videos con autenticación por token
3. **AWS S3 + CloudFront**: URLs firmadas con expiración
4. **Supabase Storage**: Almacenamiento y streaming directo

---

**Nota**: Esta integración actual es ideal para prototipos y MVP. Para producción con miles de estudiantes, considera servicios especializados de video hosting con DRM y protección avanzada.
