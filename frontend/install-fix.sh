#!/bin/bash
echo "Applying 503 error fix..."

cp server.ts backend/

echo "503 fix applied. Redeploy backend."
