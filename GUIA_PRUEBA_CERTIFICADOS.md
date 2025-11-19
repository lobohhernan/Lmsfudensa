## GUÍA DE PRUEBA: Emitir Certificado

### PASO 1: Abrir DevTools
1. Presiona `F12` en tu navegador
2. Ve a la pestaña `Console`
3. Mantén esta ventana abierta

### PASO 2: Completar Evaluación
1. Ve a un curso (cualquiera de tus 3 cursos)
2. Haz clic en "Evaluación"
3. Responde las preguntas
4. Obtén al menos 70% de puntaje
5. Haz clic en "Enviar Evaluación"

### PASO 3: Observar Logs en Console
Deberías ver:
```
🎓 [issueCertificate] Iniciando emisión con params
🔑 [issueCertificate] Usando client: ADMIN o NORMAL
🔐 [issueCertificate] Hash generado
📝 [issueCertificate] Insertando certificado...
💾 [issueCertificate] Resultado INSERT
✅ Certificado emitido
```

### PASO 4: Ir a Mis Certificados
1. Haz clic en "Ver Mis Certificados"
2. Deberías ver los logs:
```
🔍 [UserProfile] Cargando certificados para userId: XXXX
📊 [UserProfile] Respuesta de certificados
✅ [UserProfile] Certificados cargados: X
```

### PASO 5: Verificar Resultado
- ✅ Si ves tu certificado → **TODO FUNCIONA**
- ❌ Si no ves nada → Copia TODOS los logs de la consola y envíamelos

### Qué Buscar en los Logs:
- Errores en rojo
- El `userId` que aparece en los logs
- Si el INSERT fue exitoso o falló
