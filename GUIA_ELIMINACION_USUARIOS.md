# Guía para Eliminar Usuarios de Prueba

## 📋 Usuarios a Eliminar

Debes eliminar los siguientes usuarios de prueba:
- Luis Miguel Rodriguez (lapulga7@gmail.com)
- luisMiguelRodriguz (lapulga@gmail.com)
- henry Wolf (wolfgang@gmail.com)
- testing (prueba2024@gmail.com)
- testo (testing1@gmail.com)
- orca (testing2@gmail.com)

## ✅ Usuarios a Mantener

- **Dr. Test Instructor** (instructor@test.com)
- **thesantiblocks** (thesantiblocks@gmail.com)

## 🚀 Cómo Eliminar los Usuarios

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Users**
4. Busca cada usuario por email
5. Haz clic en los tres puntos (...) al lado del usuario
6. Selecciona **Delete user**
7. Confirma la eliminación

### Opción 2: Usando SQL (Recomendado para múltiples usuarios)

**⚠️ IMPORTANTE:** Debes eliminar PRIMERO los perfiles, LUEGO los usuarios de auth (por la foreign key).

1. Abre el **SQL Editor** en Supabase Dashboard
2. Copia y pega TODO el contenido del archivo `backend/supabase/cleanup_users.sql`
3. Haz clic en **Run** (o presiona Ctrl+Enter)

O ejecuta manualmente estos pasos:

```sql
-- PASO 1: Eliminar PRIMERO los perfiles
DELETE FROM public.profiles
WHERE email IN (
  'lapulga7@gmail.com',
  'lapulga@gmail.com',
  'wolfgang@gmail.com',
  'prueba2024@gmail.com',
  'testing1@gmail.com',
  'testing2@gmail.com'
);

-- PASO 2: Eliminar los usuarios de auth
DELETE FROM auth.users
WHERE email IN (
  'lapulga7@gmail.com',
  'lapulga@gmail.com',
  'wolfgang@gmail.com',
  'prueba2024@gmail.com',
  'testing1@gmail.com',
  'testing2@gmail.com'
);

-- PASO 3: Verificar usuarios restantes
SELECT 
  u.email, 
  u.raw_user_meta_data->>'full_name' as full_name,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

## ⚠️ IMPORTANTE

- **Debes eliminar PRIMERO los perfiles (`public.profiles`) y LUEGO los usuarios de auth (`auth.users`)**
- Esto es necesario por la foreign key constraint que conecta ambas tablas
- Si intentas eliminar primero de `auth.users`, obtendrás el error: `violates foreign key constraint "profiles_id_fkey"`
- **NO elimines** a instructor@test.com ni thesantiblocks@gmail.com
- El archivo `backend/supabase/cleanup_users.sql` ya tiene el orden correcto

## 🔍 Verificar la Eliminación

Después de eliminar, verifica en el Panel de Admin:
1. Ve al Panel de Admin
2. Selecciona la pestaña "Usuarios"
3. Deberías ver solo 2 usuarios registrados

---

**Última actualización:** 12 de Noviembre, 2025
