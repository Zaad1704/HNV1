#!/bin/bash
echo "Creating frontend archive..."

# Create archive directory
mkdir -p frontend-download

# Copy all frontend files
cp -r frontend/* frontend-download/

# Create ZIP
zip -r hnv-frontend-complete.zip frontend-download/

echo "✅ Archive created: hnv-frontend-complete.zip"
echo "📁 Download from file explorer or run:"
echo "   code hnv-frontend-complete.zip"

# Cleanup
rm -rf frontend-download