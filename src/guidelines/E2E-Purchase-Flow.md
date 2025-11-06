# Flujo E2E de Compra de Curso - FUDENSA LMS

## Descripción General

Este documento describe el flujo completo End-to-End (E2E) para que un usuario sin registrar pueda comprar un curso y comenzar a estudiarlo inmediatamente después del pago exitoso.

## Flujo Completo del Usuario

### 1. Usuario Visitante Navega al Detalle del Curso

**Página**: `CourseDetail.tsx`

- Usuario sin autenticar navega desde Home o Catálogo
- Ve información completa del curso:
  - Descripción
  - Instructor
  - Reseñas
  - Precio: **ARS $29.900**
  - Botón principal: **"Inscribirme Ahora"**

**Estado del usuario**: ❌ No autenticado

---

### 2. Usuario Hace Click en "Inscribirme Ahora"

**Componente**: `CourseDetail.tsx` → `handleEnrollClick()`

**Validación de autenticación**:
```typescript
const handleEnrollClick = () => {
  if (!isLoggedIn) {
    // Usuario NO autenticado → Abrir modal de login
    onAuthRequired?.("checkout", "rcp-adultos-aha");
  } else {
    // Usuario autenticado → Ir directamente a checkout
    onNavigate?.("checkout", "rcp-adultos-aha");
  }
};
```

**Resultado**: Se abre el **AuthModal** (modal de autenticación)

---

### 3. Modal de Autenticación

**Componente**: `AppNavbar.tsx` (Modal de Login/Registro integrado)

El usuario ve el modal de **"Iniciar Sesión"** con:

#### Formulario de Inicio de Sesión
- Correo electrónico
- Contraseña
- Link: "¿Olvidaste tu contraseña?"
- Botón: "Iniciar Sesión"
- Botón alternativo: "Continuar con Google"
- Link para cambiar a registro: "¿No tienes cuenta? Regístrate aquí"

#### Formulario de Registro (si el usuario cambia)
- Nombre Completo
- Correo electrónico
- Contraseña
- Confirmar Contraseña
- Botón: "Crear Cuenta"
- Link para volver a login: "¿Ya tienes cuenta? Inicia sesión aquí"

**Validaciones**:
- Email válido (validación HTML5)
- Contraseña mínimo 6 caracteres
- En registro: contraseñas deben coincidir
- Todos los campos son obligatorios

**Diseño**:
- Modal con efecto de vidrio (glassmorphism)
- Fondo azul degradado de FUDENSA
- Campos con backdrop-blur
- Animaciones suaves

**Estado del usuario**: 🔄 Autenticándose

---

### 4. Autenticación Exitosa

Después de login/registro exitoso:

1. **Modal se cierra automáticamente**
2. **Estado global se actualiza**:
   ```typescript
   setIsLoggedIn(true);
   setUserData({ email, name });
   ```
3. **Navegación pendiente se ejecuta**:
   - El sistema recuerda que el usuario quería ir a checkout
   - Automáticamente navega a `Checkout` con el curso seleccionado

**Estado del usuario**: ✅ Autenticado

---

### 5. Página de Checkout - Paso 1: Resumen del Pedido

**Página**: `Checkout.tsx`

El usuario ve:

**Contenido Principal**:
- Título: "Resumen del Pedido"
- Información del curso:
  - RCP Adultos AHA 2020
  - Duración: 8 horas
  - Nivel: Básico
  - Certificado incluido
- Campo para código de descuento

**Sidebar - Resumen**:
- Certificado: $29.900
- Descuento: $0
- **Total (ARS): $29.900**
- Iconos de seguridad:
  - 🛡️ Pago seguro y encriptado
  - 🏆 Certificado verificable con blockchain

**Botón**: "Continuar al Pago"

---

### 6. Página de Checkout - Paso 2: Método de Pago

**Página**: `Checkout.tsx`

**Método de pago seleccionado**: Mercado Pago (único disponible)

**Información mostrada**:
- Logo y descripción de Mercado Pago
- Métodos aceptados:
  - ✅ Visa, Mastercard, American Express
  - ✅ Tarjetas de débito
  - ✅ Efectivo (Rapipago, Pago Fácil)
  - ✅ Saldo en Mercado Pago
  - ✅ Cuotas sin interés disponibles

**Botones**:
- "Confirmar Pago" (principal)
- "Volver" (secundario)

---

### 7. Procesamiento del Pago

**Acción**: Usuario hace click en "Confirmar Pago"

**Componente**: `Checkout.tsx` → `handlePayment()`

```typescript
const handlePayment = () => {
  setIsProcessing(true);
  
  // Llamada al backend para procesar el pago
  // En producción: integración con Mercado Pago API
  
  setTimeout(() => {
    toast.success("¡Pago procesado exitosamente!");
    setIsProcessing(false);
    // Redirigir al reproductor del curso
    onNavigate?.("lesson");
  }, 2000);
};
```

**Estado visual**:
- Botón muestra: "Procesando pago..." con spinner
- Botones deshabilitados durante procesamiento

**Estado del usuario**: 🔄 Procesando pago

---

### 8. Pago Exitoso - Redirección Automática

**Acción**: Pago confirmado por Mercado Pago

**Resultado**:
1. **Toast notification**: "¡Pago procesado exitosamente!"
2. **Redirección automática** a `LessonPlayer.tsx`
3. **Curso desbloqueado** para el usuario
4. **Primera lección** lista para comenzar

**Estado del usuario**: ✅ Curso activo

---

### 9. Reproductor de Lecciones

**Página**: `LessonPlayer.tsx`

El usuario llega directamente al reproductor y ve:

**Header**:
- Botón "Volver al curso"
- Título del curso: "RCP Adultos AHA 2020"
- Progreso: "2 de 8 lecciones completadas"
- Barra de progreso: 25%

**Contenido Principal**:
- **Video de YouTube** embebido (primera lección)
- Título de la lección actual
- Descripción de la lección
- Botones:
  - "Marcar como completada"
  - "Siguiente lección"

**Sidebar**:
- Lista completa de lecciones
- Indicador de lecciones:
  - ✅ Completadas (verde)
  - ▶️ Actual (destacada)
  - 🔒 Bloqueadas (gris)
- Botón: "Iniciar Evaluación" (cuando complete todas las lecciones)

**Estado del usuario**: 🎓 Estudiando

---

## Flujo de Estados del Usuario

```
Usuario Visitante (❌ No autenticado)
        ↓
    [Click "Inscribirme Ahora"]
        ↓
    Modal de Autenticación
        ↓
    [Login/Registro exitoso]
        ↓
Usuario Autenticado (✅ Autenticado)
        ↓
    Checkout - Paso 1 (Resumen)
        ↓
    [Continuar al Pago]
        ↓
    Checkout - Paso 2 (Pago)
        ↓
    [Confirmar Pago]
        ↓
    Procesando... (🔄)
        ↓
    ¡Pago Exitoso!
        ↓
Usuario Inscrito (🎓 Curso activo)
        ↓
    Reproductor de Lecciones
        ↓
    [Estudiar y completar]
```

---

## Componentes Involucrados

### 1. **App.tsx** (Orquestador principal)
- Maneja estado global de autenticación
- Controla navegación entre páginas
- Gestiona navegación pendiente post-login
- Controla apertura del modal de login del AppNavbar

### 2. **AppNavbar.tsx** (Navbar con autenticación integrada)
- Navbar principal con logo y navegación
- Contiene modales de Login y Registro
- Formularios con validación
- Callback `onLogin` cuando se autentica
- Puede ser controlado externamente vía props

### 3. **CourseDetail.tsx**
- Muestra información del curso
- Valida autenticación antes de checkout
- Trigger para abrir modal de login del Navbar

### 4. **Checkout.tsx**
- Formulario de compra en 2 pasos
- Integración con Mercado Pago
- Procesamiento de pago
- Redirección a curso

### 5. **LessonPlayer.tsx**
- Reproductor de videos
- Seguimiento de progreso
- Navegación entre lecciones

---

## Datos Persistidos

Durante el flujo, se persiste:

### En el Estado Global (App.tsx)
```typescript
{
  isLoggedIn: boolean,
  userData: {
    email: string,
    name: string
  },
  currentCourseId: string,
  pendingNavigation: {
    page: string,
    courseId: string
  }
}
```

### En el Backend (Supabase)
Después del pago exitoso:
- Inscripción del usuario al curso
- Registro de transacción de pago
- Estado inicial de progreso (0%)
- Fecha de inscripción

---

## Consideraciones Técnicas

### Autenticación
- **Simulada en prototipo**: Login/registro funcionan localmente
- **Producción**: Integración con Supabase Auth
- **Sesión**: Persistida en localStorage/cookies

### Pagos
- **Prototipo**: Simulación de pago con timeout
- **Producción**: 
  - Integración con Mercado Pago SDK
  - Webhooks para confirmación de pago
  - Manejo de estados: pendiente, aprobado, rechazado

### Redirección
- **Inmediata**: Después de pago exitoso
- **Sin pantalla intermedia**: UX fluida
- **Curso desbloqueado**: Acceso instantáneo

---

## Mejoras Futuras

### 1. **Feedback Visual Mejorado**
- Animaciones de transición entre pasos
- Confetti al completar pago
- Progress bar durante procesamiento

### 2. **Información del Usuario**
- Pre-llenar formularios con datos de registro
- Guardar datos de facturación
- Historial de compras

### 3. **Métodos de Pago Adicionales**
- PayPal
- Transferencia bancaria
- Criptomonedas

### 4. **Email Notifications**
- Confirmación de compra
- Acceso al curso
- Recordatorios de progreso

---

## Testing del Flujo E2E

### Caso de Prueba 1: Usuario Nuevo
1. ✅ Navegar a CourseDetail
2. ✅ Click en "Inscribirme Ahora"
3. ✅ Ver modal de auth
4. ✅ Registrarse (pestaña Registrarse)
5. ✅ Modal se cierra
6. ✅ Redirige a Checkout automáticamente
7. ✅ Completar paso 1 (resumen)
8. ✅ Completar paso 2 (pago)
9. ✅ Ver toast de éxito
10. ✅ Redirigir a LessonPlayer
11. ✅ Iniciar primera lección

### Caso de Prueba 2: Usuario Existente
1. ✅ Navegar a CourseDetail
2. ✅ Click en "Inscribirme Ahora"
3. ✅ Ver modal de auth
4. ✅ Iniciar sesión (pestaña Login)
5. ✅ Modal se cierra
6. ✅ Redirige a Checkout automáticamente
7-11. ✅ (Igual que Caso 1)

### Caso de Prueba 3: Usuario Ya Autenticado
1. ✅ Usuario ya logueado
2. ✅ Navegar a CourseDetail
3. ✅ Click en "Inscribirme Ahora"
4. ✅ **NO** se abre modal (ya está autenticado)
5. ✅ Redirige a Checkout directamente
6-11. ✅ (Igual que Caso 1)

---

## Errores Manejados

### Durante Autenticación
- ❌ Email inválido → Toast de error
- ❌ Contraseña corta → Toast de error
- ❌ Contraseñas no coinciden → Toast de error
- ❌ Campos vacíos → Validación HTML5

### Durante Pago
- ❌ Pago rechazado → Toast de error + volver a paso 2
- ❌ Timeout → Toast de error + reintentar
- ❌ Red caída → Toast de error + guardar estado

### Durante Acceso al Curso
- ❌ Curso no encontrado → Redirigir a catálogo
- ❌ Video no disponible → Mensaje de respaldo
- ❌ Sesión expirada → Volver a login

---

## Resumen del Flujo

**Tiempo estimado**: 3-5 minutos desde landing hasta primera lección

**Pasos del usuario**: 
1. Ver curso
2. Click "Inscribirme"
3. Login/Registro (30 seg)
4. Revisar resumen
5. Confirmar pago (2 min procesamiento)
6. ¡Estudiar!

**Conversión optimizada**: Mínima fricción entre descubrimiento y uso del producto.
