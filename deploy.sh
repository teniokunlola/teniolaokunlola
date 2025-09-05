#!/bin/bash

# Production deployment script for Teniola Site
# This script builds and deploys the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Teniola Site Production Deployment${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "backend/.env.production" ]; then
    echo -e "${RED}❌ backend/.env.production file not found. Please create it with production environment variables.${NC}"
    exit 1
fi

# Check if Firebase service account key exists
if [ ! -f "backend/core/firebase_service_account.json" ]; then
    echo -e "${RED}❌ Firebase service account key not found at backend/core/firebase_service_account.json${NC}"
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}Loading production environment variables...${NC}"
export $(cat backend/.env.production | grep -v '^#' | xargs)

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm ci --only=production
npm run build
cd ..

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Build and start containers
echo -e "${YELLOW}Building and starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec backend-prod python manage.py migrate

# Collect static files
echo -e "${YELLOW}Collecting static files...${NC}"
docker-compose -f docker-compose.prod.yml exec backend-prod python manage.py collectstatic --noinput

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"
if curl -f http://localhost/api/health/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs backend-prod
    exit 1
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# Show running containers
echo -e "${YELLOW}Running containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Application is now running at:${NC}"
echo -e "  Frontend: https://teniolaokunlola.com"
echo -e "  API: https://api.teniolaokunlola.com"
echo -e "  Admin: https://admin.teniolaokunlola.com"

echo -e "\n${YELLOW}To view logs:${NC}"
echo -e "  docker-compose -f docker-compose.prod.yml logs -f"

echo -e "\n${YELLOW}To stop the application:${NC}"
echo -e "  docker-compose -f docker-compose.prod.yml down"
