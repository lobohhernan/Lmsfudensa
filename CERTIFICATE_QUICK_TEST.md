# 🚀 GUÍA RÁPIDA - Cómo Probar los Certificados

## ⏱️ 5 minutos para ver tu certificado funcionando

### Paso 1: Inicia el servidor de desarrollo

```bash
cd frontend
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

---

### Paso 2: Accede como Estudiante

1. Si no tienes cuenta, regístrate primero
2. Inicia sesión con tus credenciales
3. Serás redirigido a tu dashboard

---

### Paso 3: Selecciona un Curso

1. Ve a la sección "Mis Cursos" o "Catálogo"
2. Selecciona cualquier curso disponible
3. Haz clic en "Comenzar" o "Iniciar Evaluación"

---

### Paso 4: Completa el Examen

📝 **Para Pasar (≥60%)**:

El sistema generará automáticamente un certificado si:
- Respondes correctamente al menos el 60% de las preguntas
- **Tip**: Lee las preguntas correctas de la consola del navegador

**Ejemplo de respuestas**:
```
Pregunta 1: Opción A
Pregunta 2: Opción C
Pregunta 3: Opción B
... (mantener 60%+)
```

---

### Paso 5: ¡Ve tu Certificado!

Después de completar el examen, verás:

```
┌─────────────────────────────────────┐
│ ✅ Examen Completado                │
│                                     │
│ Puntuación: 85%                     │
│ Certificado emitido exitosamente    │
│                                     │
│ [👁️ Ver]  [📥 Descargar]           │
└─────────────────────────────────────┘
```

---

### Paso 6: Previsualiza tu Certificado

Haz clic en **👁️ Ver**:

1. Se abrirá un diálogo
2. Verás una vista previa en alta resolución
3. Valida que aparezca:
   - ✅ Tu nombre completo
   - ✅ Nombre del curso
   - ✅ Fecha de emisión (formato: "19 de marzo de 2026")
   - ✅ Logo y diseño de FUDENSA
   - ✅ Firmas de autoridades
   - ✅ Caduceo médico

---

### Paso 7: Descarga tu Certificado

Haz clic en **📥 Descargar PDF**:

1. El navegador descargará automáticamente
2. Nombre del archivo: `{TuNombre} - {NombreCurso}.pdf`
3. Ejemplo: `Juan_Pérez_García - Enfermería_Pediátrica.pdf`

---

## 🖼️ Lo que Deberías Ver en tu Certificado

```
┌────────────────────────────────────────┐
│                                        │
│              FUDENSA                   │
│  Fundación para el desarrollo de       │
│  la enfermería y la salud              │
│                                        │
│         Se certifica que               │
│                                        │
│     JUAN PÉREZ GARCÍA                  │
│     ─────────────────────────          │
│                                        │
│ Ha concluido satisfactoriamente el     │
│ cursado de                             │
│                                        │
│  ENFERMERÍA PEDIÁTRICA                 │
│                                        │
│         Finalizado el día              │
│      19 de marzo de 2026               │
│                                        │
│    [Firma]      [Caduceo]   [Firma]    │
│    [Director]   [Centro]    [Comité]   │
│                                        │
└────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

Después de descargar, verifica:

- [ ] El PDF se abre sin problemas
- [ ] La imagen está clara (no pixelada)
- [ ] Tu nombre aparece correctamente
- [ ] El nombre del curso es el correcto
- [ ] La fecha está en formato: "DD de mes de YYYY"
- [ ] El logo FUDENSA es visible
- [ ] Los marcos dobles están presentes
- [ ] Las firmas de autoridades son legibles
- [ ] El caduceo médico se ve bien
- [ ] El número P.J. aparece al pie

---

## 🎯 Casos de Prueba

### ✅ Caso 1: Aprobado (Genera Certificado)
```
Puntuación: 85%  →  ✅ Certificado generado
Mostrar: Vista previa y descarga
```

### ❌ Caso 2: Desaprobado (Sin Certificado)
```
Puntuación: 45%  →  ❌ Sin certificado
Mensaje: "Necesitas al menos 60%"
```

### 📊 Caso 3: Exacto al Límite
```
Puntuación: 60%  →  ✅ Certificado generado (límite mínimo)
```

---

## 📱 Pruebas en Diferentes Dispositivos

### Laptop/Desktop ✅
- Best experience
- Resolución: 1920x1080 o mayor
- Descarga sin problemas

### Tablet 📱
- Vista previa funcional
- Descarga → redirige a gestor de descargas
- Abre en app de PDF

### Mobile 📞
- Vista previa comprimida (scroll)
- Descarga → almacenamiento del teléfono
- Abre en app PDF

---

## 🔍 Solución de Problemas

### ❌ "No se pudo generar la vista previa"
```
Solución:
1. Recarga la página (F5)
2. Limpia caché: Ctrl+Shift+Del
3. Cierra y reabre el navegador
4. Intenta desde un incógnito
```

### ❌ "El certificado se ve pixelado"
```
Verificar:
1. Zoom del navegador al 100% (Ctrl+0)
2. Espera a que cargue completamente
3. Intenta desde otro navegador
```

### ❌ "No descarga el PDF"
```
Revisar:
1. Permitir popups/descargas en navegador
2. Revisar carpeta de Descargas
3. Revisar bloqueador de anuncios
4. Intentar desde otro navegador
```

### ❌ "El nombre/curso no aparece"
```
Verificar:
1. Que el nombre esté completo en el perfil
2. Que el curso esté con nombre válido
3. Revisar consola: F12 → Console tab
4. Buscar errores en rojo
```

---

## 📊 Dónde Verificar los Datos

### En la Base de Datos (Supabase)

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Tabla: `certificates`
4. Verifica que aparezca tu certificado con:
   - ✅ `student_id` correcto
   - ✅ `student_name` con tu nombre
   - ✅ `course_title` con el curso
   - ✅ `status` = "active"
   - ✅ `hash` generado

---

## 🎬 Video de Prueba (Acciones)

```
00:00 - Inicia sesión
00:05 - Selecciona curso
00:10 - Comienza examen
00:30 - Responde preguntas
01:00 - Click "Enviar Examen"
01:05 - ✅ Certificado aparece
01:10 - Click "Ver"
01:15 - Preview abierto
01:30 - Click "Descargar PDF"
01:35 - PDF descargado
01:40 - Abre PDF
01:45 - ✅ Verifica contenido
```

---

## 💡 Tips Importantes

**Tip 1**: Si el certificado no aparece:
- Espera 10 segundos
- Recarga la página (F5)
- Verifica que la puntuación sea ≥ 60%

**Tip 2**: Para múltiples certificados:
- Prueba con diferentes cursos
- Algunos cursos pueden tener exámenes diferentes
- Cada certificado tiene hash único

**Tip 3**: Para compartir:
- El PDF puede imprimirse directamente
- Compatible con sistemas de gestión documental
- Hash permite verificar autenticidad

**Tip 4**: Para debugging:
- Abre DevTools: F12
- Pestaña Console
- Busca logs con 🎓 emoji
- Busca errores en rojo

---

## ✨ Resultado Esperado

Si todo funciona correctamente verás:

```
✅ Sistema genera certificado automáticamente
✅ Vista previa muestra diseño FUDENSA completo
✅ PDF descarga con nombre personalizado
✅ Archivo se abre sin problemas
✅ Contenido es legible y profesional
✅ Datos coinciden exactamente
✅ Fecha en formato español
```

---

## 🎉 ¡Listo!

Si completaste todos estos pasos exitosamente:

### 🏆 Tu Sistema de Certificados está 100% FUNCIONAL

**Lo que ahora funciona**:
- ✅ Generación automática
- ✅ Diseño profesional
- ✅ Datos precisos
- ✅ Descarga confiable
- ✅ Almacenamiento verificabile

**Próximos pasos sugeridos**:
1. Prueba con diferentes usuarios
2. Genera certificados para todos los cursos
3. Comparte con tutores para feedback
4. Implementa en base prueba antes de producción

---

**¿Necesitas ayuda?** Revisa el archivo `CERTIFICATE_IMPLEMENTATION.md` para detalles técnicos.

**¡Felicidades! 🎓 Tu sistema de certificados está listo para producción.**
