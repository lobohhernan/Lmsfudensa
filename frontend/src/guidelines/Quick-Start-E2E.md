# Guía Rápida - Flujo E2E de Compra

## 🚀 Inicio Rápido

Para probar el flujo completo de compra en FUDENSA LMS:

### 1. Iniciar como Usuario No Autenticado
- Asegúrate de estar en estado "visitante" (botón flotante en esquina inferior derecha)
- La app debe mostrar "Ver como Usuario Autenticado" en el menú flotante

### 2. Navegar a un Curso
```
Home → Click en cualquier curso
  O
Catálogo → Click en cualquier curso
```

### 3. Intentar Inscribirse
- Scroll hacia abajo en la página del curso
- Click en **"Inscribirme Ahora"** (botón azul en sidebar o mobile)

### 4. Autenticarse
**Se abre el modal automáticamente**

#### Opción A: Registrarse
1. Click en "Regístrate aquí" (abajo del formulario)
2. Llenar:
   - Nombre: `Juan Pérez`
   - Email: `juan@test.com`
   - Contraseña: `123456`
   - Confirmar: `123456`
3. Click "Crear Cuenta"

#### Opción B: Iniciar Sesión
1. Llenar:
   - Email: `test@fudensa.com`
   - Contraseña: `password`
2. Click "Iniciar Sesión"

### 5. Checkout Automático
**Te redirige automáticamente a Checkout**

**Paso 1: Resumen**
- Verifica el curso y precio
- Click "Continuar al Pago"

**Paso 2: Pago**
- Método: Mercado Pago (preseleccionado)
- Click "Confirmar Pago"

### 6. Procesamiento
- Spinner de carga (2 segundos)
- Toast: "¡Pago procesado exitosamente!"

### 7. ¡A Estudiar! 🎓
**Redirige automáticamente al reproductor de lecciones**
- Video de YouTube embebido
- Listado de lecciones en sidebar
- Botones de navegación

---

## 🎯 Atajos para Testing

### Cambiar Estado de Autenticación
1. Click en botón flotante (esquina inferior derecha)
2. Click en "Ver como Usuario Autenticado" / "Ver como Visitante"

### Ir Directamente a Páginas
Desde el menú flotante:
- **Design System** - Ver todos los componentes
- **Panel Admin** - Gestión de cursos
- **Evaluación** - Quiz del curso
- **Verificar Certificado** - Sistema de verificación

---

## 🔍 Debugging

### Verificar Estado Actual
Abre React DevTools y busca el componente `App`:

```javascript
{
  isLoggedIn: true/false,
  userData: { email: "...", name: "..." },
  pendingNavigation: { page: "...", courseId: "..." } | null,
  showAuthModal: true/false,
  currentPage: "home" | "course" | "checkout" | "lesson"
}
```

### Toasts de Feedback
- ✅ Verde = Success
- ❌ Rojo = Error
- ℹ️ Azul = Info

### Estados del Modal
- Modal cerrado → `showAuthModal: false`
- Modal abierto → `showAuthModal: true`
- Después de login → Modal se cierra + `isLoggedIn: true`

---

## 🐛 Solución de Problemas

### Modal no se abre
- Verificar que `isLoggedIn` sea `false`
- Verificar que `onAuthRequired` se esté llamando en CourseDetail

### No redirige después de login
- Verificar que `pendingNavigation` tenga valor
- Verificar que `handleLogin` esté limpiando `pendingNavigation`

### Pago no procesa
- Verificar que `handlePayment` en Checkout esté definido
- Verificar console para errores

---

## 📱 Responsive Testing

### Desktop
- Navbar horizontal con botones de login/registro
- Sidebar fijo en CourseDetail
- Layout amplio en Checkout

### Mobile
- Menú hamburguesa
- Botones en mobile en CourseDetail
- Sidebar colapsable en LessonPlayer

---

## ⚡ Flujo en 30 Segundos

```
1. Ir a Curso (5 seg)
2. Click "Inscribirme" (1 seg)
3. Login/Registro (10 seg)
4. Checkout → Continuar (5 seg)
5. Confirmar Pago (2 seg procesamiento)
6. Reproductor → ¡Listo! (5 seg)

Total: ~30 segundos
```

---

## 🎨 Personalización

### Cambiar Precio del Curso
Editar en `/pages/Checkout.tsx`:
```typescript
const prices: Record<string, number> = {
  AR: 29900,  // ← Cambiar aquí
  // ...
};
```

### Cambiar Tiempo de Procesamiento
Editar en `/pages/Checkout.tsx`:
```typescript
setTimeout(() => {
  // ...
}, 2000);  // ← Cambiar duración (milisegundos)
```

### Cambiar Mensajes de Toast
Editar en `/components/AppNavbar.tsx`:
```typescript
toast.success("Sesión iniciada correctamente");  // ← Personalizar
```

---

## 📋 Checklist de Testing

Antes de considerar completo, verificar:

- [ ] Modal se abre al intentar inscribirse sin login
- [ ] Formulario de login funciona
- [ ] Formulario de registro funciona
- [ ] Validaciones muestran errores
- [ ] Modal se cierra después de autenticarse
- [ ] Redirige a Checkout automáticamente
- [ ] Checkout muestra información correcta
- [ ] Pago muestra loading state
- [ ] Toast de éxito aparece
- [ ] Redirige a LessonPlayer
- [ ] Video se reproduce
- [ ] Lecciones se muestran en sidebar
- [ ] Funciona en mobile
- [ ] Funciona en desktop

---

## 💡 Tips

1. **Usa emails diferentes** para testing de registro
2. **Revisa la consola** para errores
3. **Prueba en incógnito** para resetear estado
4. **Usa React DevTools** para ver estado en tiempo real
5. **Prueba en diferentes tamaños** de pantalla

---

## 📞 Soporte

Si algo no funciona:

1. Revisa `/guidelines/E2E-Implementation-Summary.md` para detalles técnicos
2. Revisa `/guidelines/E2E-Purchase-Flow.md` para el flujo completo
3. Busca en consola mensajes de error
4. Verifica que todos los archivos estén guardados

---

**¡Listo para probar!** 🎉
