#!/bin/bash

echo "🔧 Creating ZIP with the LAST import fix..."

mkdir -p LAST-IMPORT-FIX/src/pages

# Copy the fixed file
cp frontend/src/pages/AdminProfilePage.tsx LAST-IMPORT-FIX/src/pages/

ZIP_NAME="HNV-LAST-IMPORT-FIX-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" LAST-IMPORT-FIX/

echo "✅ LAST IMPORT FIX: $ZIP_NAME"
echo "📁 Fixed AdminProfilePage.tsx import paths"

rm -rf LAST-IMPORT-FIX/

echo ""
echo "🎉 THIS SHOULD BE THE FINAL FIX!"
echo "📥 Download: $ZIP_NAME"