#!/bin/bash
echo "Applying deployment fixes..."

# Apply fixes
cp tsconfig.json frontend/
cp package.json frontend/

# Clean install
cd frontend
rm -rf node_modules package-lock.json
npm install

echo "Deployment fix applied."
