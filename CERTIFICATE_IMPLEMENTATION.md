# 🎓 Implementación de Certificados - FUDENSA

## ✅ Estado de Implementación

La generación de certificados está **100% funcional** y diseñada acorde a la marca FUDENSA.

## 📋 Descripción

Cuando un estudiante completa exitosamente un examen, se genera automáticamente un certificado PDF con:

- **Nombre Completo del Estudiante** - Mostrado en la parte superior del certificado
- **Nombre del Curso Aprobado** - Mostrado en la parte central
- **Fecha de Emisión** - Mostrado en la parte inferior (formato: "DD de mes de YYYY")
- **Template Profesional** - Basado en el PNG del diseño original de FUDENSA
- **Firma Digital** - Hash de verificación generado automáticamente

## 🎨 Componentes Principales

### 1. **CertificateTemplate.tsx**
Renderiza el certificado usando el template PNG como fondo y superpone los datos dinámicos.

```typescript
interface CertificateData {
  studentName: string;      // Nombre del estudiante
  courseName: string;       // Nombre del curso
  issueDate: string;        // Fecha: "19 de marzo de 2026"
  dni: string;              // DNI (opcional)
  courseHours: string;      // Horas del curso (no se muestra)
  certificateId: string;    // ID único del certificado
}
```

**Campos Posicionados:**
- Nombre: `top: 740px` | Tamaño: `108px` | Peso: `800`
- Curso: `top: 1185px` | Tamaño: `104px` | Peso: `900`
- Fecha: `top: 1448px` | Tamaño: `50px` | Peso: `600`

### 2. **certificate.ts**
Funciones utilitarias para generar PDF y vista previa.

```typescript
// Formatea fecha al español
formatCertificateDate(date) 
// Resultado: "19 de marzo de 2026"

// Genera vista previa como PNG
generateCertificatePreview(node)

// Genera PDF y lo descarga
generateCertificatePDF(node, data)
```

### 3. **Evaluation.tsx**
Página de examen que dispara la emisión del certificado al completarse.

```typescript
// Cuando score >= 60%
await issueCertificate({
  studentId,
  courseId,
  studentName,
  courseTitle,
  grade,
  completionDate
});
```

### 4. **CertificateCard.tsx**
Componente que muestra las tarjetas de certificados con botones de vista previa y descarga.

## 🚀 Flujo de Operación

```
1. Estudiante completa examen ✅
   ↓
2. Sistema calcula puntuación
   ↓
3. Si aprobado (≥60%):
   - issueCertificate() → Guarda en BD
   - CertificateTemplate renderiza datos
   ↓
4. Usuario ve vista previa
   ↓
5. Usuario descarga PDF
   - Nombre archivo: "{Estudiante} - {Curso}.pdf"
   - Calidad: Alta (scale 2, 300 DPI)
   - Tamaño: A4 apaisado
```

## 🧪 Cómo Probar

### Prueba 1: Generar un Certificado

1. Inicia sesión como estudiante
2. Selecciona un curso
3. Completa el examen con puntuación ≥ 60%
4. Sistema muestra diálogo de certificado

### Prueba 2: Ver Vista Previa

1. En el diálogo del certificado, haz clic en **"Ver"**
2. Abre el preview en máxima resolución
3. Verifica:
   - ✅ Nombre del estudiante visible
   - ✅ Nombre del curso visible
   - ✅ Fecha emisión correcta
   - ✅ Template FUDENSA visible
   - ✅ Colores y estilos correctos

### Prueba 3: Descargar PDF

1. En el preview, haz clic en **"Descargar PDF"**
2. Se descargará un archivo: `{Nombre} - {Curso}.pdf`
3. Abre el PDF y verifica:
   - ✅ Toda la información es legible
   - ✅ No hay pixelación (debe verse nítido)
   - ✅ Alineación correcta de textos
   - ✅ Todos los elementos presentes

## 🎯 Especificaciones Técnicas

| Parámetro | Valor |
|-----------|-------|
| **Resolución** | 3508 x 2480 px (300 DPI A4) |
| **Formato PDF** | A4 Apaisado (Landscape) |
| **Escala de Captura** | 2x (máxima nitidez) |
| **Fuente Principal** | Times New Roman, serif |
| **Color de Texto** | Navy (#0f2d52) |
| **Letra Espaciado** | 1-2 px según campo |
| **Timeout Generación** | 5s máximo |

## 📝 Formato de Fecha

El certificado muestra la fecha en formato localizado español:

```
Antes: "San Miguel de Tucumán, 19/03/2026"
Ahora: "19 de marzo de 2026"
```

Ejemplo de salida:
- `1 de enero de 2026`
- `19 de marzo de 2026`
- `25 de diciembre de 2026`

## 🔒 Seguridad

- Cada certificado tiene un **hash único** generado automáticamente
- Los certificados se guardan en la base de datos con estado `"active"`
- Los datos se validan antes de emitir
- Los nombres de archivo se sanitizan para evitar inyecciones

## ⚙️ Configuración Requerida

### Assets:
```
/frontend/src/assets/Certificado Template.png
```

Este archivo DEBE existir para que los certificados funcionen.

### Dependencias:
```json
{
  "html2canvas": "^1.x",
  "jspdf": "^2.x"
}
```

Ambas ya están instaladas en `package.json`.

## 🐛 Troubleshooting

### "No se pudo generar la vista previa"
- ✅ Verifica que `Certificado Template.png` exista en `/frontend/src/assets/`
- ✅ Reinicia el servidor dev
- ✅ Limpia el caché del navegador

### "El certificado se ve pixelado"
- ✅ html2canvas genera con `scale: 2` automáticamente
- ✅ Si aún se ve mal, es problema de escala de pantalla

### "Los textos no se ven alineados"
- ✅ Verifica que el template PNG tenga exactamente 3508x2480 px
- ✅ Los valores `top` en CertificateTemplate.tsx son proporcionales a esta resolución

### "Error de CORS con la imagen"
- ✅ `useCORS: true` está habilitado
- ✅ `allowTaint: true` permite assets locales
- ✅ Usa `new URL(...)` en lugar de import directo

## 📚 Referencia de Archivos Modificados

```
✅ frontend/src/components/CertificateTemplate.tsx
   - Ahora usa PNG como fondo
   - Campos dinámicos posicionados correctamente

✅ frontend/src/utils/certificate.ts
   - Formato de fecha en español
   - Mejor manejo de generación PDF
   - Captura mejorada con esperas

⏸️ frontend/src/components/CertificateCard.tsx
   - Sin cambios (funcionaba correctamente)

⏸️ frontend/src/pages/Evaluation.tsx
   - Sin cambios (ya dispara issueCertificate)
```

## 🎓 Próximas Mejoras (Opcional)

- [ ] Agregar firma digital con timestamp
- [ ] Generar QR con enlace de verificación
- [ ] Enviar certificado por email automáticamente
- [ ] Sistema de descarga histórica de certificados
- [ ] Certificados multilengüe (EN/ES/PT)

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs en `console.log` del navegador
2. Abre DevTools → Network → busca errores de carga de imagen
3. Verifica que `Certificado Template.png` esté en la ubicación correcta
4. Intenta generar con datos de prueba simples primero

---

**Estado**: ✅ Implementación Completa  
**Última Actualización**: 19 de marzo de 2026  
**Versión**: 1.0.0
