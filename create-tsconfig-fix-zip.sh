#!/bin/bash

echo "🔧 Creating ZIP with tsconfig fix..."

mkdir -p TSCONFIG-FIX

# Copy the fixed tsconfig files
cp frontend/tsconfig.json TSCONFIG-FIX/
cp frontend/tsconfig.node.json TSCONFIG-FIX/

ZIP_NAME="HNV-TSCONFIG-FIX-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" TSCONFIG-FIX/

echo "✅ TSCONFIG FIX: $ZIP_NAME"
echo "📁 Contains:"
echo "  - tsconfig.json (removed references)"
echo "  - tsconfig.node.json (created missing file)"

rm -rf TSCONFIG-FIX/

echo "📥 Download: $ZIP_NAME"