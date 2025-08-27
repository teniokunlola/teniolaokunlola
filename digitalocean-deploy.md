# DigitalOcean Droplet Deployment Guide

## Prerequisites
- DigitalOcean account
- Domain name (teniolaokunlola.com)
- SSH key pair
- Docker and Docker Compose installed on your local machine

## Step 1: Create DigitalOcean Droplet

### 1.1 Create Droplet
1. Log into DigitalOcean
2. Click "Create" → "Droplets"
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic → Regular → 2GB RAM / 1 vCPU (minimum)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (upload your public key)
   - **Hostname**: teniola-server

### 1.2 Configure Firewall
Create a firewall with these rules:
- **Inbound Rules**:
  - HTTP (80) - Allow
  - HTTPS (443) - Allow
  - SSH (22) - Allow
  - Custom (8000) - Allow (for Django backend)

## Step 2: Server Setup

### 2.1 Connect to Server
```bash
ssh root@YOUR_DROPLET_IP
```

### 2.2 Update System
```bash
apt update && apt upgrade -y
```

### 2.3 Install Dependencies
```bash
# Install essential packages
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL termination and reverse proxy)
apt install -y nginx certbot python3-certbot-nginx

# Start and enable services
systemctl start docker
systemctl enable docker
systemctl start nginx
systemctl enable nginx
```

### 2.4 Create Non-Root User
```bash
# Create user
adduser teniola
usermod -aG docker teniola
usermod -aG sudo teniola

# Switch to user
su - teniola
```

## Step 3: Deploy Application

### 3.1 Clone Repository
```bash
cd /home/teniola
git clone https://github.com/YOUR_USERNAME/teniola-site.git
cd teniola-site
```

### 3.2 Create Production Environment File
```bash
# Create .env.production file
cat > .env.production << 'EOF'
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-droplet-ip,teniolaokunlola.com,www.teniolaokunlola.com
TIME_ZONE=UTC

# Database (Supabase)
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password
SUPABASE_DB_HOST=your-supabase-host
SUPABASE_DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://teniolaokunlola.com,https://www.teniolaokunlola.com

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
CSRF_TRUSTED_ORIGINS=https://teniolaokunlola.com,https://www.teniolaokunlola.com

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/app/core/firebase_service_account.json

# Email (configure if needed)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/django.log

# Static and Media
STATIC_ROOT=/app/staticfiles
MEDIA_ROOT=/app/media
EOF
```

### 3.3 Create Backend Environment File
```bash
# Create backend .env.production
cat > backend/.env.production << 'EOF'
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-droplet-ip,teniolaokunlola.com,www.teniolaokunlola.com
TIME_ZONE=UTC

# Database (Supabase)
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password
SUPABASE_DB_HOST=your-supabase-host
SUPABASE_DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://teniolaokunlola.com,https://www.teniolaokunlola.com

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
CSRF_TRUSTED_ORIGINS=https://teniolaokunlola.com,https://www.teniolaokunlola.com

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/app/core/firebase_service_account.json

# Email (configure if needed)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/django.log

# Static and Media
STATIC_ROOT=/app/staticfiles
MEDIA_ROOT=/app/media
EOF
```

### 3.4 Update Nginx Configuration
```bash
# Update nginx.conf with your droplet IP
sed -i 's/127.0.0.1:8000/YOUR_DROPLET_IP:8000/g' nginx/nginx.conf
```

### 3.5 Build and Deploy
```bash
# Make deploy script executable
chmod +x deploy.sh

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Step 4: SSL Certificate Setup

### 4.1 Configure Nginx for Certbot
```bash
# Create temporary nginx config for SSL verification
sudo tee /etc/nginx/sites-available/teniola-temp << 'EOF'
server {
    listen 80;
    server_name teniolaokunlola.com www.teniolaokunlola.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/teniola-temp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 4.2 Obtain SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d teniolaokunlola.com -d www.teniolaokunlola.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 4.3 Update Nginx with SSL
```bash
# Copy your production nginx config
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Final Configuration

### 5.1 Create Systemd Service (Optional)
```bash
# Create systemd service for auto-start
sudo tee /etc/systemd/system/teniola.service << 'EOF'
[Unit]
Description=Teniola Site
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/teniola/teniola-site
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl enable teniola.service
```

### 5.2 Setup Log Rotation
```bash
# Create log directory
mkdir -p /home/teniola/teniola-site/backend/logs

# Setup log rotation
sudo tee /etc/logrotate.d/teniola << 'EOF'
/home/teniola/teniola-site/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 teniola teniola
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

## Step 6: Monitoring and Maintenance

### 6.1 Health Checks
```bash
# Check application health
curl -f https://teniolaokunlola.com/health
curl -f https://teniolaokunlola.com/api/health/

# Check container status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 6.2 Backup Strategy
```bash
# Create backup script
cat > /home/teniola/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/teniola/backups"

mkdir -p $BACKUP_DIR

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /home/teniola/teniola-site/backend media/

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C /home/teniola/teniola-site/backend logs/

# Keep only last 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/teniola/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/teniola/backup.sh") | crontab -
```

## Troubleshooting

### Common Issues:

1. **Port 8000 not accessible**: Check firewall rules and Docker container status
2. **SSL errors**: Verify domain DNS points to droplet IP, check certbot logs
3. **Database connection**: Verify Supabase credentials and network access
4. **Static files not loading**: Check Django collectstatic and nginx configuration

### Useful Commands:
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

## Security Considerations

1. **Firewall**: Only allow necessary ports (22, 80, 443)
2. **SSH**: Use key-based authentication, disable password login
3. **Updates**: Regularly update system packages
4. **Monitoring**: Set up log monitoring and alerting
5. **Backups**: Regular automated backups of data and configuration

## Performance Optimization

1. **Gzip**: Already enabled in nginx
2. **Caching**: Static assets cached for 1 year
3. **Rate Limiting**: API endpoints protected against abuse
4. **CDN**: Consider using Cloudflare for global distribution

Your application should now be live at https://teniolaokunlola.com!
