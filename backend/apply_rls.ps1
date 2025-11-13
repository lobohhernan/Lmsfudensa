#!/usr/bin/env pwsh
# Script para aplicar las políticas RLS de Supabase
# Ejecutar desde: backend/

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR POLÍTICAS RLS - SUPABASE     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sqlFile = "supabase/fix_rls_policies.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ ERROR: No se encontró el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Archivo SQL encontrado: $sqlFile" -ForegroundColor Green
Write-Host ""
Write-Host "Este script aplicará las siguientes políticas:" -ForegroundColor Yellow
Write-Host "  1. Permitir registro de usuarios (INSERT en profiles)" -ForegroundColor White
Write-Host "  2. Permitir ver el propio perfil" -ForegroundColor White
Write-Host "  3. Permitir actualizar el propio perfil" -ForegroundColor White
Write-Host "  4. Admin puede ver todos los perfiles" -ForegroundColor White
Write-Host "  5. ✨ Lectura PÚBLICA de cursos (catálogo)" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  IMPORTANTE: Necesitas ejecutar esto manualmente en Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "PASOS:" -ForegroundColor Cyan
Write-Host "1. Ve a: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Selecciona tu proyecto: Lmsfudensa" -ForegroundColor White
Write-Host "3. Ir a: SQL Editor (menú lateral)" -ForegroundColor White
Write-Host "4. Crear New Query" -ForegroundColor White
Write-Host "5. Copiar y pegar el contenido de: backend/supabase/fix_rls_policies.sql" -ForegroundColor White
Write-Host "6. Presionar 'Run' o Ctrl+Enter" -ForegroundColor White
Write-Host ""

Write-Host "📋 Copiando SQL al portapapeles..." -ForegroundColor Cyan
Get-Content $sqlFile | Set-Clipboard
Write-Host "✅ SQL copiado! Ahora puedes pegarlo (Ctrl+V) en Supabase SQL Editor" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Verificación después de ejecutar:" -ForegroundColor Yellow
Write-Host "  - El catálogo de cursos debe cargar sin autenticación" -ForegroundColor White
Write-Host "  - El registro de usuarios debe funcionar" -ForegroundColor White
Write-Host "  - El admin panel debe mostrar cursos" -ForegroundColor White
Write-Host ""

Write-Host "Presiona cualquier tecla para abrir Supabase Dashboard..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://supabase.com/dashboard"
