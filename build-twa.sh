#!/bin/bash

# HNV Property Management - TWA Build Script
echo "🚀 Building HNV Property Management TWA..."

# Check if bubblewrap is installed
if ! command -v bubblewrap &> /dev/null; then
    echo "📦 Installing Bubblewrap CLI..."
    npm install -g @bubblewrap/cli
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Please install Android SDK and set ANDROID_HOME environment variable."
    echo "   Download from: https://developer.android.com/studio"
    exit 1
fi

# Create keystore if it doesn't exist
if [ ! -f "android.keystore" ]; then
    echo "🔐 Creating Android keystore..."
    keytool -genkey -v -keystore android.keystore -alias hnv-key -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=HNV Property Management, OU=Development, O=HNV Solutions, L=City, ST=State, C=US" \
        -storepass hnvpassword -keypass hnvpassword
    
    echo "📋 Getting SHA256 fingerprint for asset links..."
    keytool -list -v -keystore android.keystore -alias hnv-key -storepass hnvpassword | grep SHA256
    echo "⚠️  Copy the SHA256 fingerprint above and update your assetlinks.json file"
fi

# Update domain in twa-manifest.json
echo "🌐 Please update the 'host' field in twa-manifest.json with your actual domain"
echo "   Current: your-domain.com"
read -p "Enter your domain (e.g., hnv.onrender.com): " DOMAIN

if [ ! -z "$DOMAIN" ]; then
    sed -i.bak "s/your-domain.com/$DOMAIN/g" twa-manifest.json
    echo "✅ Updated domain to: $DOMAIN"
fi

# Initialize TWA project
echo "🏗️  Initializing TWA project..."
bubblewrap init --manifest https://$DOMAIN/manifest.webmanifest

# Build the APK
echo "📱 Building APK..."
bubblewrap build

# Build AAB for Play Store
echo "📦 Building AAB for Play Store..."
bubblewrap build --target=aab

echo "✅ TWA build complete!"
echo ""
echo "📁 Generated files:"
echo "   - app-release-unsigned.apk (for testing)"
echo "   - app-release.aab (for Play Store)"
echo ""
echo "🚀 Next steps:"
echo "1. Test the APK on an Android device"
echo "2. Upload the AAB to Google Play Console"
echo "3. Complete the Play Store listing"
echo ""
echo "📋 Don't forget to:"
echo "- Update assetlinks.json with the SHA256 fingerprint"
echo "- Deploy your web app with the updated asset links"
echo "- Verify domain ownership in Play Console"