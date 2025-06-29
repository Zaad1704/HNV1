#!/bin/bash
echo "Applying Tailwind CSS fix..."

cp package.json frontend/

cd frontend
rm -rf node_modules package-lock.json
npm install

echo "Tailwind CSS fix applied."
