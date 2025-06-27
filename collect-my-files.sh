#!/bin/bash

echo "🔍 Collecting all files I created for you..."

# Create collection directory
mkdir -p my-frontend-files/src/{pages,components/{layout,landing,charts,admin/charts,dashboard,common},hooks,contexts,store,api}

# Copy the files I created
echo "📄 Copying pages..."
cp frontend/src/pages/LoginPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/RegisterPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/ForgotPasswordPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/ResetPasswordPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/VerifyEmailPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/OverviewPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/TenantDashboardPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/AdminDashboardPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/PropertiesPage.tsx my-frontend-files/src/pages/ 2>/dev/null
cp frontend/src/pages/TenantsPage.tsx my-frontend-files/src/pages/ 2>/dev/null

echo "🎨 Copying styles..."
cp frontend/src/index.css my-frontend-files/src/ 2>/dev/null
cp frontend/tailwind.config.js my-frontend-files/ 2>/dev/null
cp frontend/package.json my-frontend-files/ 2>/dev/null

echo "🔧 Copying components..."
cp frontend/src/components/layout/Navbar.tsx my-frontend-files/src/components/layout/ 2>/dev/null
cp frontend/src/components/layout/PublicBottomNavBar.tsx my-frontend-files/src/components/layout/ 2>/dev/null
cp frontend/src/components/layout/BottomNavBar.tsx my-frontend-files/src/components/layout/ 2>/dev/null
cp frontend/src/components/layout/DashboardLayout.tsx my-frontend-files/src/components/layout/ 2>/dev/null
cp frontend/src/components/layout/PublicLayout.tsx my-frontend-files/src/components/layout/ 2>/dev/null
cp frontend/src/components/layout/Footer.tsx my-frontend-files/src/components/layout/ 2>/dev/null

cp frontend/src/components/landing/HeroSection.tsx my-frontend-files/src/components/landing/ 2>/dev/null
cp frontend/src/components/landing/AboutSection.tsx my-frontend-files/src/components/landing/ 2>/dev/null

cp frontend/src/components/charts/FinancialChart.tsx my-frontend-files/src/components/charts/ 2>/dev/null
cp frontend/src/components/charts/RentStatusChart.tsx my-frontend-files/src/components/charts/ 2>/dev/null

cp frontend/src/components/admin/charts/PlatformGrowthChart.tsx my-frontend-files/src/components/admin/charts/ 2>/dev/null
cp frontend/src/components/admin/charts/PlanDistributionChart.tsx my-frontend-files/src/components/admin/charts/ 2>/dev/null

cp frontend/src/components/dashboard/ActionItemWidget.tsx my-frontend-files/src/components/dashboard/ 2>/dev/null
cp frontend/src/components/dashboard/NotificationsPanel.tsx my-frontend-files/src/components/dashboard/ 2>/dev/null

cp frontend/src/components/common/AddPropertyModal.tsx my-frontend-files/src/components/common/ 2>/dev/null
cp frontend/src/components/RoleGuard.tsx my-frontend-files/src/components/ 2>/dev/null
cp frontend/src/components/ProtectedRoute.tsx my-frontend-files/src/components/ 2>/dev/null
cp frontend/src/components/AdminRoute.tsx my-frontend-files/src/components/ 2>/dev/null

echo "⚙️ Copying core files..."
cp frontend/src/store/authStore.ts my-frontend-files/src/store/ 2>/dev/null
cp frontend/src/api/client.ts my-frontend-files/src/api/ 2>/dev/null
cp frontend/src/main.tsx my-frontend-files/src/ 2>/dev/null
cp frontend/src/i18n.js my-frontend-files/src/ 2>/dev/null

cp frontend/src/hooks/useSiteSettings.ts my-frontend-files/src/hooks/ 2>/dev/null
cp frontend/src/hooks/useExpiringLeases.ts my-frontend-files/src/hooks/ 2>/dev/null

cp frontend/src/contexts/LanguageContext.tsx my-frontend-files/src/contexts/ 2>/dev/null
cp frontend/src/contexts/ThemeContext.tsx my-frontend-files/src/contexts/ 2>/dev/null

cp frontend/vite.config.ts my-frontend-files/ 2>/dev/null
cp frontend/.env.example my-frontend-files/ 2>/dev/null

# Create ZIP
echo "📦 Creating ZIP file..."
zip -r MY-CREATED-FRONTEND-FILES.zip my-frontend-files/

echo "✅ DONE! Download: MY-CREATED-FRONTEND-FILES.zip"
echo "📁 Files collected in: my-frontend-files/"

# Cleanup
rm -rf my-frontend-files/