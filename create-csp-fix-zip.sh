#!/bin/bash

echo "🔧 Creating ZIP with CSP and API connection fixes..."

mkdir -p CSP-API-FIX/public

# Copy the fixed files
cp frontend/public/index.html CSP-API-FIX/public/
cp frontend/public/manifest.webmanifest CSP-API-FIX/public/

ZIP_NAME="HNV-CSP-API-FIX-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" CSP-API-FIX/

echo "✅ CSP & API CONNECTION FIX: $ZIP_NAME"
echo "📁 Fixed files:"
echo "  - index.html (Updated CSP to allow backend API calls)"
echo "  - manifest.webmanifest (Created missing PWA manifest)"

rm -rf CSP-API-FIX/

echo ""
echo "🔧 FIXES APPLIED:"
echo "  ✅ CSP now allows connections to backend"
echo "  ✅ Added localhost:5001 for development"
echo "  ✅ Added deployed backend URL"
echo "  ✅ Fixed image and font loading"
echo ""
echo "📥 Download: $ZIP_NAME"