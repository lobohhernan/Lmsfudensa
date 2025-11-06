# Guía de Uso - Panel Admin con Videos de YouTube

## 📋 Introducción

Esta guía explica cómo usar el Panel de Administración de FUDENSA LMS para crear y editar cursos con videos de YouTube.

---

## 🎥 Preparación de Videos en YouTube

### Paso 1: Subir Videos a YouTube

1. Ve a [YouTube Studio](https://studio.youtube.com)
2. Click en **"Crear"** → **"Subir videos"**
3. Selecciona tu archivo de video
4. **Configura la privacidad como "No listado"** (Recomendado)
   - ✅ Los videos no aparecen en búsquedas
   - ✅ Cualquiera con el enlace puede verlos
   - ✅ Ideal para cursos de pago

### Paso 2: Obtener el ID del Video

Una vez subido el video, YouTube te dará una URL como:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

El **ID del video** es la parte después de `v=`:

```
dQw4w9WgXcQ  ← Este es el ID que necesitas
```

### Paso 3: Organizar tus Videos

**Recomendación**: Crea una playlist en YouTube por cada curso

- Facilita la gestión
- Mantiene los videos organizados
- Permite navegación rápida

---

## 🎓 Crear un Curso en el Panel Admin

### 1. Acceder al Panel Admin

Desde el menú flotante (esquina inferior derecha):
- Click en el botón flotante
- Selecciona **"Panel Admin"**

O desde la URL:
- Navega directamente al AdminPanel

### 2. Crear Nuevo Curso

1. Click en **"Crear Nuevo Curso"** (botón verde con icono +)
2. Verás un formulario con 4 pestañas:
   - **Información Básica**
   - **Detalles**
   - **Lecciones** ← Aquí se configura YouTube
   - **Evaluación**

---

## 📝 Completar el Formulario del Curso

### Pestaña 1: Información Básica

#### Campos Obligatorios (*)
- **Título del Curso**: `RCP Adultos AHA 2020`
- **Categoría**: `RCP`
- **Descripción Corta**: Breve descripción para el catálogo

#### Campos Opcionales
- **Slug (URL)**: `rcp-adultos-aha-2020` (se genera automáticamente)
- **Nivel**: Básico / Intermedio / Avanzado
- **Duración**: `8 horas`
- **Precio (ARS)**: `29900`
- **Instructor**: `Dr. Carlos Mendoza`
- **URL de Imagen**: URL de Unsplash o imagen del curso

**Ejemplo de URL de imagen**:
```
https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200
```

---

### Pestaña 2: Detalles

#### Descripción Completa
Texto detallado que aparecerá en la página del curso:

```
Curso completo de Reanimación Cardiopulmonar para adultos 
basado en las últimas guías de la American Heart Association 2020. 
Aprenderás técnicas esenciales para salvar vidas en situaciones 
de emergencia cardíaca.
```

#### Requisitos
Agrega uno por uno:
- `No se requiere experiencia previa`
- `Conexión a internet estable`
- `Dispositivo para ver videos`

Click en **"Agregar Requisito"** para cada uno.

#### Objetivos de Aprendizaje
Lo que el estudiante aprenderá:
- `Dominar las técnicas de RCP para adultos`
- `Reconocer signos de paro cardíaco`
- `Utilizar un DEA correctamente`
- `Aplicar compresiones torácicas efectivas`

Click en **"Agregar Objetivo"** para cada uno.

---

### Pestaña 3: Lecciones ⭐ (Configuración de YouTube)

Esta es la pestaña más importante para videos de YouTube.

#### Agregar una Lección

1. Click en **"Agregar Lección"**
2. Completa los campos:

##### Campos de la Lección

**Título de la Lección**:
```
Introducción a RCP
```

**Duración**:
```
15 min
```

**Tipo**:
- Selecciona **"Video"** del dropdown
- ✅ Esto muestra el campo de YouTube ID

**Descripción (opcional)**:
```
Conceptos básicos y overview del curso
```

**ID de YouTube** (solo para tipo "Video"):
```
dQw4w9WgXcQ
```

#### ⚠️ Importante: Formato del YouTube ID

✅ **Correcto**:
```
dQw4w9WgXcQ
```

❌ **Incorrecto**:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ  ← No incluir URL completa
watch?v=dQw4w9WgXcQ                          ← No incluir parámetros
youtube.com/watch?v=dQw4w9WgXcQ              ← Solo el ID
```

#### Ayuda Visual en el Formulario

El formulario muestra un texto de ayuda:

> Ingresa solo el ID del video de YouTube. Por ejemplo, si la URL es 
> `youtube.com/watch?v=dQw4w9WgXcQ` el ID es `dQw4w9WgXcQ`

#### Ejemplo: Crear 5 Lecciones

```
Lección 1:
- Título: Introducción a RCP
- Duración: 15 min
- Tipo: Video
- YouTube ID: abc123xyz

Lección 2:
- Título: Anatomía del sistema cardiovascular
- Duración: 20 min
- Tipo: Video
- YouTube ID: def456uvw

Lección 3:
- Título: Reconocimiento de paro cardíaco
- Duración: 18 min
- Tipo: Video
- YouTube ID: ghi789rst

Lección 4:
- Título: Compresiones torácicas efectivas
- Duración: 25 min
- Tipo: Video
- YouTube ID: jkl012opq

Lección 5:
- Título: Evaluación de conocimientos
- Duración: 30 min
- Tipo: Quiz  ← No requiere YouTube ID
```

#### Reordenar Lecciones

- Usa el icono **de arrastre** (⠿) para reordenar
- Las lecciones se mostrarán en el orden que las configures

#### Eliminar una Lección

- Click en el icono de **basura** (🗑️) a la derecha de la lección

---

### Pestaña 4: Evaluación

Crea las preguntas del examen final.

#### Agregar una Pregunta

1. Click en **"Agregar Pregunta"**
2. Completa:

**Pregunta**:
```
¿Cuál es la profundidad correcta de las compresiones 
torácicas en un adulto durante la RCP?
```

**Opciones** (4 opciones obligatorias):
- Opción A: `Al menos 3 cm`
- Opción B: `Al menos 5 cm` ← Marca como correcta
- Opción C: `Al menos 7 cm`
- Opción D: `Al menos 10 cm`

**Marcar respuesta correcta**:
- Click en **"Marcar"** al lado de la opción correcta
- Se pondrá en color azul

**Explicación (opcional)**:
```
Las compresiones torácicas en adultos deben tener una 
profundidad de al menos 5 cm según las guías AHA 2020.
```

---

## 💾 Guardar el Curso

Una vez completadas todas las pestañas:

1. Click en **"Crear Curso"** (esquina superior derecha)
2. Verás un toast de confirmación: ✅ "Curso creado exitosamente"
3. El curso aparecerá en la lista de cursos

---

## ✏️ Editar un Curso Existente

1. En el Panel Admin, ve a la sección **"Cursos"**
2. Busca el curso en la tabla
3. Click en el menú **⋯** (tres puntos) a la derecha
4. Selecciona **"Editar"**
5. Modifica los campos necesarios
6. Click en **"Guardar Cambios"**

---

## 🎬 Verificar Videos de YouTube

### Probar el Video en el Reproductor

1. Guarda el curso
2. Ve al **Reproductor de Lecciones** desde:
   - Menú flotante → "Panel Admin" → Vista previa
   - O navega al curso desde el catálogo
3. Verifica que:
   - El video se reproduzca correctamente
   - Los controles de YouTube funcionen
   - No haya errores de "Video no disponible"

### Problemas Comunes

#### ❌ "Video no disponible"

**Causa**: El video es Privado en lugar de No listado

**Solución**:
1. Ve a YouTube Studio
2. Edita el video
3. Cambia privacidad a **"No listado"**
4. Guarda cambios

#### ❌ "ID de video inválido"

**Causa**: El ID está mal copiado

**Solución**:
1. Verifica que solo sea el ID, sin URL
2. No debe incluir espacios ni caracteres especiales
3. Formato correcto: `abc123XYZ-_` (11 caracteres aprox)

#### ❌ Video se reproduce pero no es el correcto

**Causa**: Se copió el ID equivocado

**Solución**:
1. Ve a YouTube
2. Asegúrate de copiar el ID del video correcto
3. Edita la lección en Admin
4. Reemplaza con el ID correcto

---

## 📊 Estructura Recomendada de un Curso

### Curso Completo de RCP (Ejemplo)

```
📘 RCP Adultos AHA 2020

📹 Módulo 1: Introducción
  - Lección 1: Bienvenida e introducción (10 min)
  - Lección 2: Conceptos básicos de RCP (15 min)

📹 Módulo 2: Anatomía
  - Lección 3: Sistema cardiovascular (20 min)
  - Lección 4: Sistema respiratorio (18 min)

📹 Módulo 3: Técnicas
  - Lección 5: Compresiones torácicas (25 min)
  - Lección 6: Ventilaciones de rescate (22 min)
  - Lección 7: Uso del DEA (30 min)

📹 Módulo 4: Casos especiales
  - Lección 8: RCP en embarazadas (20 min)
  - Lección 9: RCP en ahogamiento (18 min)

📝 Evaluación Final
  - Quiz de 10 preguntas (30 min)
```

---

## ✅ Checklist de Creación de Curso

Antes de publicar, verifica:

### Información Básica
- [ ] Título claro y descriptivo
- [ ] Categoría apropiada
- [ ] Descripción atractiva
- [ ] Precio configurado
- [ ] Imagen representativa

### Lecciones
- [ ] Todas las lecciones tienen título
- [ ] Duraciones estimadas correctas
- [ ] YouTube IDs correctos (solo el ID, no la URL)
- [ ] Videos en modo "No listado" en YouTube
- [ ] Orden lógico de lecciones
- [ ] Mix equilibrado de videos y evaluaciones

### Evaluación
- [ ] Al menos 5 preguntas
- [ ] Respuestas correctas marcadas
- [ ] Explicaciones claras
- [ ] Opciones sin errores gramaticales

### Testing
- [ ] Probar reproducción de videos
- [ ] Verificar que todos los videos carguen
- [ ] Completar el quiz de prueba
- [ ] Revisar en mobile y desktop

---

## 🎯 Buenas Prácticas

### Videos
1. **Duración ideal**: 10-25 minutos por lección
2. **Calidad**: Mínimo 720p (HD)
3. **Audio**: Claro y sin ruido de fondo
4. **Subtítulos**: Agregar en YouTube para accesibilidad
5. **Miniaturas**: Usar miniaturas personalizadas en YouTube

### Organización
1. **Playlist**: Crea una playlist por curso en YouTube
2. **Nombres**: Usa nombres consistentes (YouTube ↔ FUDENSA)
3. **Backup**: Guarda una copia local de todos los videos
4. **Versiones**: Mantén versión anterior si actualizas un video

### Seguridad
1. **No listado**: Nunca uses videos públicos de YouTube
2. **Privado**: Solo para videos en desarrollo
3. **Enlaces**: No compartas los enlaces de YouTube fuera del LMS
4. **Monitoreo**: Revisa analytics de YouTube regularmente

---

## 📈 Analytics y Seguimiento

### Datos Disponibles en YouTube

1. Ve a YouTube Studio
2. Selecciona la playlist del curso
3. Analytics disponibles:
   - Vistas totales
   - Tiempo de visualización
   - Retención de audiencia
   - Momento de abandono

### Uso de Esta Información

- **Alta retención**: El contenido es bueno
- **Abandonos tempranos**: Considera regrabar el inicio
- **Picos de rewind**: Los estudiantes repiten esas partes
- **Bajas vistas**: Posible problema con el acceso

---

## 🚀 Workflow Recomendado

### Para Crear un Curso Nuevo

```
1. Planificar contenido
   ↓
2. Grabar todos los videos
   ↓
3. Subir a YouTube (No listado)
   ↓
4. Crear playlist
   ↓
5. Copiar todos los IDs de YouTube
   ↓
6. Crear curso en Panel Admin
   ↓
7. Agregar lecciones con IDs
   ↓
8. Crear evaluación
   ↓
9. Guardar curso
   ↓
10. Testing completo
   ↓
11. Publicar ✅
```

---

## 🔧 Mantenimiento de Cursos

### Actualizar un Video

1. Sube el nuevo video a YouTube (No listado)
2. Copia el nuevo YouTube ID
3. Edita el curso en Admin
4. Reemplaza el YouTube ID antiguo
5. Guarda cambios
6. (Opcional) Elimina el video antiguo de YouTube

### Agregar Lecciones Extras

1. Sube los nuevos videos a YouTube
2. Edita el curso en Admin
3. Ve a la pestaña "Lecciones"
4. Click en "Agregar Lección"
5. Completa la información con el nuevo YouTube ID
6. Guarda cambios

### Reorganizar Lecciones

1. Edita el curso
2. Usa los iconos de arrastre (⠿)
3. Arrastra las lecciones al orden deseado
4. Guarda cambios

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Puedo usar videos de otros canales de YouTube?

⚠️ **No recomendado**. Solo usa videos que tengas derecho a usar:
- Videos que tú subiste
- Videos con licencia comercial
- Videos con permiso explícito del creador

### ¿Cuántos videos puede tener un curso?

📊 No hay límite técnico, pero recomendamos:
- **Mínimo**: 5 lecciones
- **Óptimo**: 8-12 lecciones
- **Máximo recomendado**: 20 lecciones

### ¿Qué pasa si elimino un video de YouTube?

❌ El curso mostrará "Video no disponible". 
**Solución**: Reemplaza el YouTube ID con un video nuevo.

### ¿Puedo mezclar videos de YouTube con PDFs?

✅ Sí, puedes usar diferentes tipos:
- **Video**: Para clases con YouTube ID
- **Document**: Para PDFs y lecturas
- **Quiz**: Para evaluaciones intercaladas

### ¿Los estudiantes pueden descargar los videos?

⚠️ Depende de la configuración de YouTube:
- **No listado**: Los estudiantes pueden usar extensiones de descarga
- **Privado**: Más control, pero requiere gestión manual

Para máxima seguridad, considera plataformas como Vimeo Pro con DRM.

---

## 📞 Soporte Técnico

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Video no disponible" | Video privado | Cambiar a "No listado" |
| ID inválido | ID mal copiado | Copiar solo el ID, sin URL |
| Video no carga | Conexión lenta | Verificar internet |
| Pantalla negra | Video eliminado | Reemplazar con nuevo video |

---

## 🎓 Recursos Adicionales

- [Documentación de YouTube Integration](/guidelines/YouTube-Integration.md)
- [Guía de E2E Purchase Flow](/guidelines/E2E-Purchase-Flow.md)
- [YouTube Studio](https://studio.youtube.com)
- [Soporte de YouTube](https://support.google.com/youtube)

---

**Última actualización**: 5 de Noviembre, 2025

**Versión**: 1.0

**Para**: FUDENSA LMS - Panel de Administración
