#!/bin/bash

# Production Readiness Test Script
# Run this before deploying to production

set -e

echo "🧪 Testing Production Readiness for Teniola Site..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test counter
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# Function to count results
count_result() {
    case $1 in
        "PASS") ((PASS_COUNT++));;
        "WARN") ((WARN_COUNT++));;
        "FAIL") ((FAIL_COUNT++));;
    esac
}

echo "=========================================="
echo "🔍 Checking Backend Production Readiness"
echo "=========================================="

# Check backend production files
if [ -f "backend/.env.production" ]; then
    print_status "Production environment file exists"
    count_result "PASS"
else
    print_error "Production environment file missing"
    count_result "FAIL"
fi

if [ -f "backend/settings_production.py" ]; then
    print_status "Production settings file exists"
    count_result "PASS"
else
    print_error "Production settings file missing"
    count_result "FAIL"
fi

if [ -f "backend/requirements.production.txt" ]; then
    print_status "Production requirements file exists"
    count_result "PASS"
else
    print_error "Production requirements file missing"
    count_result "FAIL"
fi

if [ -f "backend/gunicorn.conf.py" ]; then
    print_status "Gunicorn configuration exists"
    count_result "PASS"
else
    print_error "Gunicorn configuration missing"
    count_result "FAIL"
fi

# Check backend production settings
cd backend
if [ -f ".env.production" ]; then
    # Check if critical values are set
    if grep -q "your-super-secret-production-key-change-this-immediately" .env.production; then
        print_warning "SECRET_KEY still has default value"
        count_result "WARN"
    else
        print_status "SECRET_KEY is customized"
        count_result "PASS"
    fi
    
    if grep -q "yourdomain.com" .env.production; then
        print_warning "ALLOWED_HOSTS still has placeholder domain"
        count_result "WARN"
    else
        print_status "ALLOWED_HOSTS is configured"
        count_result "PASS"
    fi
fi

# Test production settings
if python manage.py check --settings=teniola_site.settings_production --deploy > /dev/null 2>&1; then
    print_status "Production settings pass Django checks"
    count_result "PASS"
else
    print_error "Production settings have issues"
    count_result "FAIL"
fi

cd ..

echo -e "\n=========================================="
echo "🔍 Checking Frontend Production Readiness"
echo "=========================================="

# Check frontend production files
if [ -f "frontend/.env.production" ]; then
    print_status "Frontend production environment exists"
    count_result "PASS"
else
    print_error "Frontend production environment missing"
    count_result "FAIL"
fi

if [ -f "frontend/build-production.sh" ]; then
    print_status "Frontend build script exists"
    count_result "PASS"
else
    print_error "Frontend build script missing"
    count_result "FAIL"
fi

# Check frontend production settings
cd frontend
if [ -f ".env.production" ]; then
    if grep -q "localhost:8000" .env.production; then
        print_warning "API_BASE_URL still points to localhost"
        count_result "WARN"
    else
        print_status "API_BASE_URL is configured for production"
        count_result "PASS"
    fi
fi

# Test frontend build
echo "🔨 Testing frontend production build..."
if npm run build > /dev/null 2>&1; then
    print_status "Frontend builds successfully"
    count_result "PASS"
    
    if [ -d "dist" ]; then
        print_status "Production build directory created"
        count_result "PASS"
        
        # Check build size
        BUILD_SIZE=$(du -sh dist/ | cut -f1)
        echo "📊 Build size: $BUILD_SIZE"
    else
        print_error "Production build directory missing"
        count_result "FAIL"
    fi
else
    print_error "Frontend build failed"
    count_result "FAIL"
fi

cd ..

echo -e "\n=========================================="
echo "🔍 Checking Security and Git Configuration"
echo "=========================================="

# Check gitignore
if grep -q ".env.production" .gitignore; then
    print_status "Production environment files are gitignored"
    count_result "PASS"
else
    print_error "Production environment files not in gitignore"
    count_result "FAIL"
fi

if grep -q "*.sqlite3" .gitignore; then
    print_status "Database files are gitignored"
    count_result "PASS"
else
    print_error "Database files not in gitignore"
    count_result "FAIL"
fi

# Check for sensitive files in git
if git ls-files | grep -q ".env.production"; then
    print_error "Production environment file is tracked in git"
    count_result "FAIL"
else
    print_status "Production environment file not tracked in git"
    count_result "PASS"
fi

echo -e "\n=========================================="
echo "📊 Production Readiness Summary"
echo "=========================================="

echo "✅ Passed: $PASS_COUNT"
echo "⚠️  Warnings: $WARN_COUNT"
echo "❌ Failed: $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    if [ $WARN_COUNT -eq 0 ]; then
        echo -e "\n🎉 All tests passed! Your application is ready for production deployment."
    else
        echo -e "\n⚠️  All critical tests passed, but there are warnings to address before deployment."
    fi
else
    echo -e "\n❌ Critical issues found. Please fix these before deploying to production."
    exit 1
fi

echo -e "\n📋 Next Steps:"
echo "1. Update production environment variables with real values"
echo "2. Configure your production server"
echo "3. Run: ./deploy-production.sh"
echo "4. Follow the deployment checklist in PRODUCTION_CHECKLIST.md"

echo -e "\n🔗 Useful Files:"
echo "- PRODUCTION_CHECKLIST.md - Complete deployment guide"
echo "- deploy-production.sh - Automated deployment script"
echo "- backend/.env.production - Backend production config"
echo "- frontend/.env.production - Frontend production config"
