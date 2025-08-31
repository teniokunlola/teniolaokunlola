# Subdomain Setup Guide

This guide explains how to set up subdomains for your Teniola site:
- **Frontend**: `teniolaokunlola.com` (main site)
- **API**: `api.teniolaokunlola.com` (backend API)
- **Admin**: `admin.teniolaokunlola.com` (Django admin)

## What Changed

### 1. Nginx Configuration
- **Main domain** (`teniolaokunlola.com`): Serves the frontend React app
- **API subdomain** (`api.teniolaokunlola.com`): Proxies all requests to the Django backend
- **Admin subdomain** (`admin.teniolaokunlola.com`): Serves the Django admin interface

### 2. Django Configuration
- Updated `ALLOWED_HOSTS` to include the new subdomains
- Updated `CSRF_TRUSTED_ORIGINS` for the subdomains
- Removed `/api/` prefix from URLs since API is now served from subdomain root

### 3. Frontend Configuration
- Updated API base URL from `https://teniolaokunlola.com/api` to `https://api.teniolaokunlola.com`
- Simplified API URL building logic

## DNS Configuration Required

You need to add these DNS records to your domain provider:

```
Type: A
Name: api
Value: YOUR_DROPLET_IP
TTL: 300

Type: A
Name: admin
Value: YOUR_DROPLET_IP
TTL: 300
```

## SSL Certificate

The current SSL certificate should work for subdomains if it's a wildcard certificate or includes the subdomains. If you encounter SSL issues, you may need to:

1. **Option 1**: Get a wildcard certificate for `*.teniolaokunlola.com`
2. **Option 2**: Get separate certificates for each subdomain
3. **Option 3**: Use Let's Encrypt with subdomain validation

## Deployment Steps

### 1. Update DNS Records
Add the A records for `api` and `admin` subdomains pointing to your droplet IP.

### 2. Deploy Updated Configuration
```bash
# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Test the Setup
- Frontend: `https://teniolaokunlola.com`
- API: `https://api.teniolaokunlola.com/health/`
- Admin: `https://admin.teniolaokunlola.com/djangoadmin/`

### 4. Verify SSL
Ensure all subdomains have valid SSL certificates.

## URL Structure

### Before (Old Structure)
- Frontend: `https://teniolaokunlola.com`
- API: `https://teniolaokunlola.com/api/*`
- Admin: `https://teniolaokunlola.com/djangoadmin/*`

### After (New Structure)
- Frontend: `https://teniolaokunlola.com`
- API: `https://api.teniolaokunlola.com/*`
- Admin: `https://admin.teniolaokunlola.com/*`

## Benefits of This Setup

1. **Cleaner URLs**: No more `/api/` prefix needed
2. **Better Organization**: Clear separation of concerns
3. **Scalability**: Easier to scale different services independently
4. **Security**: Better isolation between frontend, API, and admin
5. **Professional**: More professional appearance with dedicated subdomains

## Troubleshooting

### Common Issues

1. **DNS Not Propagated**: Wait for DNS propagation (can take up to 48 hours)
2. **SSL Certificate Issues**: Ensure certificate covers subdomains
3. **Nginx Configuration**: Check nginx logs for configuration errors
4. **Django Settings**: Verify `ALLOWED_HOSTS` includes subdomains

### Debug Commands

```bash
# Check nginx configuration
docker exec teniola-nginx nginx -t

# View nginx logs
docker logs teniola-nginx

# Test DNS resolution
nslookup api.teniolaokunlola.com
nslookup admin.teniolaokunlola.com

# Test connectivity
curl -I https://api.teniolaokunlola.com/health/
curl -I https://admin.teniolaokunlola.com/
```

## Security Considerations

1. **Rate Limiting**: API subdomain has stricter rate limiting
2. **CORS**: Frontend can only connect to API subdomain
3. **SSL**: All subdomains use HTTPS with HSTS
4. **Headers**: Security headers applied to all subdomains

## Next Steps

After successful deployment:

1. Update any hardcoded API URLs in your frontend code
2. Update documentation and API client configurations
3. Monitor logs for any issues
4. Consider setting up monitoring for the new subdomains
