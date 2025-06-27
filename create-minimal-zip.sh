#!/bin/bash

echo "🔧 Creating MINIMAL working frontend..."

mkdir -p MINIMAL-FRONTEND/{src/{components/{layout,landing,charts,dashboard,common,admin/charts},pages,hooks,contexts,store,api,types},public}

# Core files only
cp frontend/package.json MINIMAL-FRONTEND/
cp frontend/vite.config.ts MINIMAL-FRONTEND/
cp frontend/tailwind.config.js MINIMAL-FRONTEND/
cp frontend/tsconfig.json MINIMAL-FRONTEND/
cp frontend/src/index.css MINIMAL-FRONTEND/src/
cp frontend/src/main.tsx MINIMAL-FRONTEND/src/
cp frontend/src/App.tsx MINIMAL-FRONTEND/src/
cp frontend/src/i18n.js MINIMAL-FRONTEND/src/

# Essential components
cp frontend/src/store/authStore.ts MINIMAL-FRONTEND/src/store/
cp frontend/src/api/client.ts MINIMAL-FRONTEND/src/api/
cp frontend/src/types/siteSettings.ts MINIMAL-FRONTEND/src/types/
cp frontend/src/contexts/LanguageContext.tsx MINIMAL-FRONTEND/src/contexts/
cp frontend/src/contexts/ThemeContext.tsx MINIMAL-FRONTEND/src/contexts/
cp frontend/src/hooks/useSiteSettings.ts MINIMAL-FRONTEND/src/hooks/

# Key pages
cp frontend/src/pages/LoginPage.tsx MINIMAL-FRONTEND/src/pages/
cp frontend/src/pages/RegisterPage.tsx MINIMAL-FRONTEND/src/pages/
cp frontend/src/pages/OverviewPage.tsx MINIMAL-FRONTEND/src/pages/

# Essential components
cp frontend/src/components/ProtectedRoute.tsx MINIMAL-FRONTEND/src/components/
cp frontend/src/components/RoleGuard.tsx MINIMAL-FRONTEND/src/components/
cp frontend/src/components/layout/Navbar.tsx MINIMAL-FRONTEND/src/components/layout/
cp frontend/src/components/layout/DashboardLayout.tsx MINIMAL-FRONTEND/src/components/layout/
cp frontend/src/components/layout/PublicLayout.tsx MINIMAL-FRONTEND/src/components/layout/
cp frontend/src/components/charts/FinancialChart.tsx MINIMAL-FRONTEND/src/components/charts/
cp frontend/src/components/dashboard/ActionItemWidget.tsx MINIMAL-FRONTEND/src/components/dashboard/

# Public assets
cp -r frontend/public/* MINIMAL-FRONTEND/public/ 2>/dev/null || true

ZIP_NAME="HNV-MINIMAL-WORKING-$(date +%H%M%S).zip"
zip -r "$ZIP_NAME" MINIMAL-FRONTEND/

echo "✅ MINIMAL ZIP: $ZIP_NAME"
echo "📦 This should build without errors!"

rm -rf MINIMAL-FRONTEND/