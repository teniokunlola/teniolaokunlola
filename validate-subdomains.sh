#!/bin/bash

# Subdomain Validation Script
# This script helps validate that your subdomains are working correctly

echo "🔍 Validating Subdomain Configuration..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check DNS resolution
check_dns() {
    local domain=$1
    local ip=$(nslookup $domain 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ -n "$ip" ] && [ "$ip" != "NXDOMAIN" ]; then
        echo -e "${GREEN}✅ $domain resolves to $ip${NC}"
        return 0
    else
        echo -e "${RED}❌ $domain DNS resolution failed${NC}"
        return 1
    fi
}

# Function to check HTTPS connectivity
check_https() {
    local domain=$1
    local endpoint=$2
    local url="https://$domain$endpoint"
    
    if curl -s -I "$url" | grep -q "HTTP/"; then
        echo -e "${GREEN}✅ $url is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $url is not accessible${NC}"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    
    if echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        echo -e "${GREEN}✅ SSL certificate is valid for $domain${NC}"
        return 0
    else
        echo -e "${RED}❌ SSL certificate check failed for $domain${NC}"
        return 1
    fi
}

echo ""
echo "1. Checking DNS Resolution..."
echo "----------------------------"
check_dns "teniolaokunlola.com"
check_dns "api.teniolaokunlola.com"
check_dns "admin.teniolaokunlola.com"

echo ""
echo "2. Checking HTTPS Connectivity..."
echo "--------------------------------"
check_https "teniolaokunlola.com" ""
check_https "api.teniolaokunlola.com" "/health/"
check_https "admin.teniolaokunlola.com" "/"

echo ""
echo "3. Checking SSL Certificates..."
echo "-------------------------------"
check_ssl "teniolaokunlola.com"
check_ssl "api.teniolaokunlola.com"
check_ssl "admin.teniolaokunlola.com"

echo ""
echo "4. Testing API Endpoints..."
echo "---------------------------"
echo "Testing API health endpoint..."
if curl -s "https://api.teniolaokunlola.com/health/" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API health endpoint is working${NC}"
else
    echo -e "${RED}❌ API health endpoint is not working${NC}"
fi

echo ""
echo "5. Testing Admin Interface..."
echo "-----------------------------"
echo "Testing Django admin accessibility..."
if curl -s -I "https://admin.teniolaokunlola.com/" | grep -q "HTTP/"; then
    echo -e "${GREEN}✅ Django admin is accessible${NC}"
else
    echo -e "${RED}❌ Django admin is not accessible${NC}"
fi

echo ""
echo "6. Testing Frontend..."
echo "----------------------"
echo "Testing main site accessibility..."
if curl -s -I "https://teniolaokunlola.com" | grep -q "HTTP/"; then
    echo -e "${GREEN}✅ Main site is accessible${NC}"
else
    echo -e "${RED}❌ Main site is not accessible${NC}"
fi

echo ""
echo "======================================"
echo "🎯 Validation Complete!"
echo ""
echo "If you see any ❌ errors:"
echo "1. Check DNS propagation (can take up to 48 hours)"
echo "2. Verify SSL certificates cover subdomains"
echo "3. Check nginx configuration and logs"
echo "4. Ensure Docker services are running"
echo ""
echo "For detailed troubleshooting, see SUBDOMAIN_SETUP.md"
