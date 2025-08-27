#!/bin/bash

# Production Build Script for Teniola Site Frontend
# Run this script to build the production version

echo "🚀 Building Teniola Site Frontend for Production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Production files are in the 'dist' directory"
    echo "📊 Build size:"
    du -sh dist/
    
    # List build contents
    echo "📋 Build contents:"
    ls -la dist/
    
    echo "🎉 Frontend is ready for production deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi
