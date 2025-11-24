// Script de diagnóstico para verificar conexión a Supabase
// Copia y pega esto en la consola del navegador (F12)

(async () => {
  console.log('🔍 Iniciando diagnóstico de Supabase...\n');

  // 1. Verificar variables de entorno
  console.log('1️⃣ Variables de Entorno:');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('   URL:', url ? '✅ Configurada' : '❌ Faltante');
  console.log('   Key:', key ? '✅ Configurada' : '❌ Faltante');

  // 2. Verificar cliente Supabase
  console.log('\n2️⃣ Cliente Supabase:');
  const { supabase } = await import('./lib/supabase.ts');
  console.log('   Conectado:', supabase ? '✅ Sí' : '❌ No');

  // 3. Verificar sesión
  console.log('\n3️⃣ Sesión:');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('   Usuario logueado:', session ? '✅ Sí' : '❌ No');
  if (session) {
    console.log('   ID Usuario:', session.user.id);
    console.log('   Email:', session.user.email);
  }

  // 4. Verificar tabla profiles
  console.log('\n4️⃣ Tabla Profiles:');
  if (session) {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.log('   ❌ Error:', error.message);
        console.log('   Status:', status);
      } else {
        console.log('   ✅ Perfil encontrado:');
        console.log('      ', data);
      }
    } catch (err) {
      console.log('   ❌ Error al conectar:', err.message);
    }
  } else {
    console.log('   ⚠️ No hay sesión activa, no se puede verificar');
  }

  // 5. Verificar tabla courses
  console.log('\n5️⃣ Tabla Courses:');
  try {
    const { data, error, count } = await supabase
      .from('courses')
      .select('id, title', { count: 'exact' })
      .limit(3);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log(`   ✅ Cursos encontrados: ${count || 0}`);
      if (data && data.length > 0) {
        console.log('   Ejemplo:', data[0]);
      }
    }
  } catch (err) {
    console.log('   ❌ Error al conectar:', err.message);
  }

  console.log('\n✅ Diagnóstico completado');
})();
