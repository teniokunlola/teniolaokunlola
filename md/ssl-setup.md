# SSL Certificate Setup Guide

## 🔒 SSL Certificate Configuration

### **Required Directory Structure:**
```
nginx/
├── ssl/
│   └── teniolaokunlola.com/
│       ├── fullchain.pem
│       └── privkey.pem
```

### **Let's Encrypt Setup:**

#### **1. Install Certbot:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

#### **2. Generate Certificates:**
```bash
sudo certbot certonly --standalone \
  -d teniolaokunlola.com \
  -d www.teniolaokunlola.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

#### **3. Copy Certificates to nginx/ssl:**
```bash
# Create directory structure
mkdir -p nginx/ssl/teniolaokunlola.com

# Copy certificates (adjust paths as needed)
sudo cp /etc/letsencrypt/live/teniolaokunlola.com/fullchain.pem nginx/ssl/teniolaokunlola.com/
sudo cp /etc/letsencrypt/live/teniolaokunlola.com/privkey.pem nginx/ssl/teniolaokunloda.com/

# Set proper permissions
sudo chown -R $USER:$USER nginx/ssl/
chmod 600 nginx/ssl/teniolaokunlola.com/*.pem
```

### **Manual Certificate Setup:**

If you have certificates from another provider:

1. **Place certificates in:** `nginx/ssl/teniolaokunlola.com/`
2. **Required files:**
   - `fullchain.pem` - Certificate chain
   - `privkey.pem` - Private key
3. **Set permissions:** `chmod 600 *.pem`

### **Auto-renewal Setup:**

#### **1. Create renewal script:**
```bash
#!/bin/bash
# /etc/cron.daily/renew-ssl

certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

#### **2. Make executable:**
```bash
sudo chmod +x /etc/cron.daily/renew-ssl
```

### **Verification:**

#### **1. Test nginx configuration:**
```bash
docker run --rm -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine nginx -t
```

#### **2. Check certificate validity:**
```bash
openssl x509 -in nginx/ssl/teniolaokunlola.com/fullchain.pem -text -noout
```

### **Troubleshooting:**

- **Certificate not found:** Check file paths and permissions
- **Permission denied:** Ensure nginx can read certificate files
- **SSL handshake failed:** Verify certificate and private key match

### **Security Notes:**

- ✅ Keep private keys secure (`chmod 600`)
- ✅ Use strong SSL protocols (TLS 1.2+)
- ✅ Enable HSTS headers
- ✅ Regular certificate renewal
- ✅ Monitor certificate expiration
