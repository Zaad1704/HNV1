#!/bin/bash
echo "Applying CORS fix..."

cp server.ts backend/

echo "CORS fix applied. Redeploy backend to fix CORS errors."
