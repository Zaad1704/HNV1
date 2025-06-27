#!/bin/bash

echo "🔧 Creating ZIP with all FIXED files..."

# Create collection directory
mkdir -p FIXED-FRONTEND-FILES

# Copy entire frontend directory
cp -r frontend/* FIXED-FRONTEND-FILES/

# Create ZIP with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_NAME="HNV-FRONTEND-FIXED-${TIMESTAMP}.zip"

zip -r "$ZIP_NAME" FIXED-FRONTEND-FILES/

echo "✅ DONE! Download: $ZIP_NAME"
echo "📦 Size: $(du -h "$ZIP_NAME" | cut -f1)"
echo "📁 Contains: $(find FIXED-FRONTEND-FILES -type f | wc -l) files"

# List key fixed files
echo ""
echo "🔧 Key Fixed Files Included:"
echo "- package.json (with all dependencies)"
echo "- src/api/client.ts (fixed env issue)"
echo "- src/store/authStore.ts (fixed missing properties)"
echo "- src/types/siteSettings.ts (new types file)"
echo "- src/components/admin/PlanFormModal.tsx (fixed)"
echo "- src/components/common/EditPropertyModal.tsx (fixed)"
echo "- src/forms/RegisterForm.tsx (fixed)"
echo "- src/pages/SuperAdmin/SiteEditorPage.tsx (fixed)"
echo "- src/pages/SuperAdmin/AdminModeratorsPage.tsx (new)"
echo "- src/pages/SuperAdmin/AdminProfilePage.tsx (new)"
echo "- All other redesigned components and pages"

# Cleanup
rm -rf FIXED-FRONTEND-FILES/

echo ""
echo "🎯 Ready to download from file explorer!"