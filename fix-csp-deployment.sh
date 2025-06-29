#!/bin/bash

echo "🔧 Applying CSP fixes for HNV deployment..."

# Ensure production environment file exists
if [ ! -f "frontend/.env.production" ]; then
    echo "VITE_API_URL=https://hnv.onrender.com/api" > frontend/.env.production
    echo "✅ Created production environment file"
fi

# Build frontend with CSP configuration
cd frontend
echo "📦 Building frontend with CSP configuration..."
npm run build

# Verify CSP headers in built files
if grep -q "Content-Security-Policy" dist/index.html; then
    echo "✅ CSP configuration found in built HTML"
else
    echo "⚠️  CSP configuration not found in built HTML"
fi

# Check if _headers file is included in build
if [ -f "dist/_headers" ]; then
    echo "✅ _headers file included in build"
else
    cp public/_headers dist/_headers
    echo "✅ Copied _headers file to build directory"
fi

cd ..

echo "🚀 CSP fixes applied successfully!"
echo ""
echo "The following domains are now allowed in CSP:"
echo "- https://hnv.onrender.com (Backend API)"
echo "- https://api.exchangerate-api.com (Currency API)"
echo "- https://fonts.googleapis.com (Google Fonts)"
echo "- https://fonts.gstatic.com (Google Fonts)"
echo ""
echo "Deploy the updated frontend and backend to resolve CSP errors."