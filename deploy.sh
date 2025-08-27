#!/bin/bash

# Production Deployment Script for DigitalOcean
set -e

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found. Run this script from the project root."
    exit 1
fi

# Load production environment variables
if [ ! -f "backend/.env.production" ]; then
    echo "❌ Error: backend/.env.production not found. Please create it with your production values."
    exit 1
fi

echo "📋 Environment file found"

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start production containers
echo "🔨 Building production containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 45

# Check service health
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost/api/health/ > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/api/"
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 To view logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "🔄 To restart: docker-compose -f docker-compose.prod.yml restart"
