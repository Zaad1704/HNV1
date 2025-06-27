#!/bin/bash

echo "🔧 Creating FINAL ZIP with JSX fix..."

# Create collection directory
mkdir -p FINAL-FRONTEND-FIXED

# Copy entire frontend directory
cp -r frontend/* FINAL-FRONTEND-FIXED/

# Create ZIP with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_NAME="HNV-FRONTEND-FINAL-${TIMESTAMP}.zip"

zip -r "$ZIP_NAME" FINAL-FRONTEND-FIXED/

echo "✅ DONE! Download: $ZIP_NAME"
echo "🔧 Fixed JSX syntax error in Navbar.tsx"
echo "📦 Size: $(du -h "$ZIP_NAME" | cut -f1)"

# Cleanup
rm -rf FINAL-FRONTEND-FIXED/

echo ""
echo "🎯 Ready to download - Build should work now!"