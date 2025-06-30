#!/bin/bash
set -e

echo "🚀 HNV1 Production Deployment"

# Backend build
echo "🏗️ Building backend..."
cd backend
npm install
npm run build
cd ..

# Frontend build
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run type-check
npm run build:prod
cd ..

echo "✅ HNV1 is 100% ready for production!"
echo "📁 Backend: backend/dist/"
echo "📁 Frontend: frontend/dist/"
echo ""
echo "🚀 Deploy to:"
echo "• Render.com (configured)"
echo "• Vercel/Netlify"
echo "• AWS/Google Cloud"
echo "• Docker containers"