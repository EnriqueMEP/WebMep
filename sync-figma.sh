#!/bin/bash
# sync-figma.sh - Script para sincronizar design tokens desde Figma

echo "🎨 MEP Design System Sync"
echo "=========================="

# Navegar al directorio del servidor
cd server

echo "📥 Descargando datos de Figma..."
node download-figma.js

if [ $? -eq 0 ]; then
    echo "✅ Descarga completada"
    
    echo "🔄 Procesando tokens..."
    node process-figma-data.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Tokens generados exitosamente"
        echo "📊 Design System actualizado:"
        echo "   - Colores, espaciados y tipografías actualizados"
        echo "   - Componentes extraídos"
        echo "   - CSS generado"
        echo ""
        echo "🌐 Verifica los cambios en http://localhost:5173/design-system"
    else
        echo "❌ Error procesando tokens"
    fi
else
    echo "❌ Error descargando de Figma"
fi
