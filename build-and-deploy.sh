#!/bin/bash

# HNV Property Management - Build and Deploy Script
# This script builds the frontend with all the latest updates

echo "🚀 Starting HNV Property Management Build Process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file with correct backend URL
echo "🔧 Setting up environment..."
cat > .env << EOF
VITE_API_URL=https://hnv.onrender.com/api
VITE_APP_NAME=HNV Property Management
VITE_APP_VERSION=2.0.0
EOF

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo "🌐 Backend URL configured: https://hnv.onrender.com/api"
    echo ""
    echo "🎨 New Features Added:"
    echo "  ✓ Darker orange-blue gradient theme"
    echo "  ✓ Live data integration with backend"
    echo "  ✓ Real-time currency conversion"
    echo "  ✓ Multi-language support with proper i18n"
    echo "  ✓ Logo integration (/logo-min.png)"
    echo "  ✓ Enhanced dashboard with live stats"
    echo "  ✓ Fixed CSP headers for API connections"
    echo "  ✓ Responsive design improvements"
    echo ""
    echo "🔧 Configuration Updates:"
    echo "  ✓ API client pointing to https://hnv.onrender.com"
    echo "  ✓ CSP headers updated for backend connections"
    echo "  ✓ Currency exchange API integrated"
    echo "  ✓ Site settings hook for live CMS data"
    echo ""
    echo "🎯 Ready for deployment!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Return to root directory
cd ..

echo "🎉 HNV Property Management build process completed!"