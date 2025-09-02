@echo off
REM sync-figma.bat - Script para sincronizar design tokens desde Figma (Windows)

echo 🎨 MEP Design System Sync
echo ==========================

REM Navegar al directorio del servidor
cd server

echo 📥 Descargando datos de Figma...
node download-figma.js

if %errorlevel% equ 0 (
    echo ✅ Descarga completada
    
    echo 🔄 Procesando tokens...
    node process-figma-data.js
    
    if %errorlevel% equ 0 (
        echo ✅ Tokens generados exitosamente
        echo 📊 Design System actualizado:
        echo    - Colores, espaciados y tipografías actualizados
        echo    - Componentes extraídos
        echo    - CSS generado
        echo.
        echo 🌐 Verifica los cambios en http://localhost:5173/design-system
    ) else (
        echo ❌ Error procesando tokens
    )
) else (
    echo ❌ Error descargando de Figma
)

pause
