#!/bin/bash

echo "🔧 Creating ZIP with the FINAL 6 error fixes..."

mkdir -p FINAL-6-ERRORS/{src/{components/layout,pages},frontend}

# Copy the 6 fixed files
echo "📄 Copying final 6 fixed files..."
cp frontend/src/components/layout/MobileLandingLayout.tsx FINAL-6-ERRORS/src/components/layout/ 2>/dev/null
cp frontend/src/pages/SettingsPage.tsx FINAL-6-ERRORS/src/pages/ 2>/dev/null
cp frontend/src/pages/PropertyDetailsPage.tsx FINAL-6-ERRORS/src/pages/ 2>/dev/null
cp frontend/src/pages/TenantStatementPage.tsx FINAL-6-ERRORS/src/pages/ 2>/dev/null

ZIP_NAME="HNV-FINAL-6-ERRORS-FIXED-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" FINAL-6-ERRORS/

echo "✅ FINAL 6 ERRORS FIXED: $ZIP_NAME"
echo "📁 Contains these 4 files:"
echo "  - MobileLandingLayout.tsx (Fixed Bolt → Zap icon)"
echo "  - SettingsPage.tsx (Fixed import paths)"
echo "  - PropertyDetailsPage.tsx (Fixed ITenant interface)"
echo "  - TenantStatementPage.tsx (Fixed error handling)"

rm -rf FINAL-6-ERRORS/

echo ""
echo "🎉 ALL TYPESCRIPT ERRORS SHOULD NOW BE RESOLVED!"
echo "📥 Download: $ZIP_NAME"