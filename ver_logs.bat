@echo off
REM Script para ver logs de Edge Functions en Supabase

echo.
echo ===================================
echo  LOGS DE EDGE FUNCTIONS SUPABASE
echo ===================================
echo.

REM Mostrar opciones
echo Selecciona la funcion a monitorear:
echo.
echo [1] mercadopago-preference (crear preferencias)
echo [2] mercadopago-webhook (recibir webhooks)
echo [3] Ambas (en la misma ventana - requiere actualizar manualmente)
echo.

set /p choice="Opcion (1-3): "

if "%choice%"=="1" (
    echo.
    echo Mostrando logs de mercadopago-preference...
    echo Presiona CTRL+C para detener.
    echo.
    npx supabase functions logs mercadopago-preference --project-ref hztkspqunxeauawqcikw --tail
) else if "%choice%"=="2" (
    echo.
    echo Mostrando logs de mercadopago-webhook...
    echo Presiona CTRL+C para detener.
    echo.
    npx supabase functions logs mercadopago-webhook --project-ref hztkspqunxeauawqcikw --tail
) else if "%choice%"=="3" (
    echo.
    echo Mostrando logs alternados entre ambas funciones.
    echo.
    :loop
    echo.
    echo === MERCADOPAGO-PREFERENCE ===
    npx supabase functions logs mercadopago-preference --project-ref hztkspqunxeauawqcikw --limit 5
    echo.
    echo === MERCADOPAGO-WEBHOOK ===
    npx supabase functions logs mercadopago-webhook --project-ref hztkspqunxeauawqcikw --limit 5
    echo.
    timeout /t 10 /nobreak
    goto loop
) else (
    echo Opcion invalida.
    exit /b 1
)
