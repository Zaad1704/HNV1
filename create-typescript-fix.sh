#!/bin/bash

echo "🔧 Creating TypeScript build fix..."

mkdir -p TYPESCRIPT-FIX/src/api

# Copy the fixed files
cp frontend/src/api/client.ts TYPESCRIPT-FIX/src/api/
cp frontend/vite.config.ts TYPESCRIPT-FIX/

ZIP_NAME="HNV-TYPESCRIPT-FIX-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" TYPESCRIPT-FIX/

echo "✅ TYPESCRIPT FIX: $ZIP_NAME"
echo "📁 Fixed import.meta.env TypeScript error"
echo "📁 Enhanced Vite config for environment variables"

rm -rf TYPESCRIPT-FIX/

echo ""
echo "🎉 BUILD SHOULD NOW SUCCEED!"
echo "📥 Download: $ZIP_NAME"