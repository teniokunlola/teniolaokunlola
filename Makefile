# Makefile for Teniola Site Development

.PHONY: help install-backend install-frontend install dev dev-backend dev-frontend build clean setup test lint docker-dev docker-prod docker-clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies (backend + frontend)"
	@echo "  make install-backend - Install backend dependencies only"
	@echo "  make install-frontend - Install frontend dependencies only"
	@echo "  make dev           - Start both development servers"
	@echo "  make dev-backend   - Start backend development server"
	@echo "  make dev-frontend  - Start frontend development server"
	@echo "  make build         - Build frontend for production"
	@echo "  make setup         - First-time project setup"
	@echo "  make clean         - Clean build artifacts and cache"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linters"
	@echo "  make check-ports   - Check if ports 3000 and 8000 are available"
	@echo "  make docker-dev    - Start development services with Docker"
	@echo "  make docker-prod   - Deploy production services with Docker"
	@echo "  make docker-clean  - Clean up Docker containers and images"

# Installation commands
install: install-backend install-frontend

install-backend:
	cd backend && python3 -m venv venv
	cd backend && source venv/bin/activate && pip install --upgrade pip
	cd backend && source venv/bin/activate && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

# Development commands
dev:
	@echo "Starting development servers..."
	@echo "Backend will be available at: http://localhost:8000"
	@echo "Frontend will be available at: http://localhost:3000"
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && source venv/bin/activate && python manage.py runserver

dev-frontend:
	cd frontend && npm run dev

# Build commands
build:
	cd frontend && npm run build

# Setup commands
setup:
	@echo "Setting up project for first time..."
	$(MAKE) install
	@echo "Creating environment files..."
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env; fi
	@echo "Running initial migrations..."
	cd backend && source venv/bin/activate && python manage.py migrate
	@echo "Setup complete! Run 'make dev' to start development servers."

# Utility commands
clean:
	@echo "Cleaning build artifacts and cache..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	find backend -name "__pycache__" -type d -exec rm -rf {} +
	find backend -name "*.pyc" -delete
	find . -name ".DS_Store" -delete

test:
	@echo "Running backend tests..."
	cd backend && source venv/bin/activate && python manage.py test
	@echo "Running frontend tests..."
	cd frontend && npm test

lint:
	@echo "Linting backend..."
	cd backend && source venv/bin/activate && python -m flake8 . --exclude=venv,migrations
	@echo "Linting frontend..."
	cd frontend && npm run lint

check-ports:
	@echo "Checking if development ports are available..."
	@lsof -ti:3000 || echo "Port 3000 is available ✓"
	@lsof -ti:8000 || echo "Port 8000 is available ✓"

# Docker commands
docker-dev:
	@echo "Starting development services with Docker..."
	./scripts/docker-dev.sh start

docker-prod:
	@echo "Deploying production services with Docker..."
	./scripts/docker-deploy.sh deploy

docker-clean:
	@echo "Cleaning up Docker containers and images..."
	docker-compose -f docker-compose.dev.yml down --remove-orphans
	docker-compose -f docker-compose.prod.yml down --remove-orphans
	docker system prune -f
