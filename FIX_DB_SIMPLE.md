# SOLUCIÓN FINAL - Base de Datos en Navegador Normal

## 🎯 El Problema en 3 líneas
- Modo incógnito: ✅ Funciona (sin cache corrupto)
- Modo normal: ❌ No carga cursos (localStorage bloqueado)
- Causa: Storage persistente corrupto (306 MB acumulado)

---

## ✅ SOLUCIÓN - 3 PASOS

### PASO 1: SQL en Supabase (1 minuto)

1. Abre: https://supabase.com/dashboard
2. Selecciona proyecto: `Lmsfudensa`
3. Menú izq: `SQL Editor` → `New Query`
4. Copia y pega **TODO ESTO**:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_auth" ON public.courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "courses_update_auth" ON public.courses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "courses_delete_auth" ON public.courses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "evaluations_select_all" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "enrollments_select_all" ON public.enrollments FOR SELECT USING (true);
```

5. Click `Run` (o Ctrl+Enter)
6. Espera ✅ verde

---

### PASO 2: Limpiar Navegador (2 minutos)

**OPCIÓN A (Recomendada):**
1. Abre: http://localhost:3000/clear-storage.html
2. Click: `🧨 Limpiar TODO el Almacenamiento`
3. Confirma
4. Recarga automáticamente

**OPCIÓN B (Manual):**
1. Presiona: `F12`
2. Pestaña: `Application`
3. Izquierda: `Storage` → `Clear site data`
4. Marca: TODO
5. Click: `Clear`

---

### PASO 3: Recargar Página (30 segundos)

1. Abre: http://localhost:3000
2. Presiona: `Ctrl + Shift + R` (hard refresh)
3. Espera 3 segundos
4. ✅ Debería cargar con cursos

---

## ✅ VERIFICACIÓN

**Deberías ver:**
- Catálogo con cursos
- Admin panel con usuarios/cursos
- SIN errores "Cargando..."

**Si NO funciona:**
1. Abre: http://localhost:3000/diagnostico.html
2. Click: `▶️ Ejecutar Diagnóstico Completo`
3. Compara datos normal vs incógnito
4. Envía screenshot

---

## ¿POR QUÉ PASO A PASO?

1. **SQL**: Limpia las políticas RLS conflictivas
2. **Storage**: Borra cache corrupto de 306 MB
3. **Reload**: Fuerza que el navegador cargue fresco sin cache

Ahora cada pestaña normal se comporta como incógnito = ✅ Funciona
