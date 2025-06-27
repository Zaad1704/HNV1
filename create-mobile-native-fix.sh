#!/bin/bash

echo "📱 Creating MOBILE NATIVE APP EXPERIENCE FIX..."

mkdir -p MOBILE-NATIVE-FIX/{src/{components/{layout,landing},api},public}

# Core mobile optimizations
echo "🔧 Copying CSP and mobile-optimized files..."
cp frontend/public/index.html MOBILE-NATIVE-FIX/public/
cp frontend/src/index.css MOBILE-NATIVE-FIX/src/

echo "📱 Copying mobile-optimized components..."
cp frontend/src/components/layout/Navbar.tsx MOBILE-NATIVE-FIX/src/components/layout/
cp frontend/src/components/landing/HeroSection.tsx MOBILE-NATIVE-FIX/src/components/landing/

echo "🔌 Copying enhanced API client..."
cp frontend/src/api/client.ts MOBILE-NATIVE-FIX/src/api/

ZIP_NAME="HNV-MOBILE-NATIVE-FIX-$(date +%Y%m%d_%H%M%S).zip"
zip -r "$ZIP_NAME" MOBILE-NATIVE-FIX/

echo "✅ MOBILE NATIVE FIX: $ZIP_NAME"
echo ""
echo "🎯 MOBILE OPTIMIZATIONS:"
echo "  ✅ Fixed CSP to allow all API connections"
echo "  ✅ Native iPhone app-like experience"
echo "  ✅ Company name properly visible on mobile"
echo "  ✅ Touch-optimized interactions"
echo "  ✅ Smooth animations and transitions"
echo "  ✅ Mobile-first responsive design"
echo "  ✅ Safe area handling for iPhone"
echo "  ✅ Prevent zoom on input focus"
echo "  ✅ Native app-style navigation"
echo "  ✅ Enhanced API client with better error handling"
echo ""
echo "🔧 CSP FIXES:"
echo "  ✅ Allows localhost:5001 for development"
echo "  ✅ Allows production backend URL"
echo "  ✅ Supports Google OAuth"
echo "  ✅ Allows image loading from any source"
echo ""
echo "📱 NATIVE APP FEATURES:"
echo "  ✅ Full-screen mobile menu"
echo "  ✅ Touch-friendly button sizes"
echo "  ✅ iOS-style interactions"
echo "  ✅ Proper viewport handling"
echo "  ✅ Native scrolling behavior"

rm -rf MOBILE-NATIVE-FIX/

echo ""
echo "📥 Download: $ZIP_NAME"