# 🚀 DigitalOcean Deployment Checklist

## Pre-Deployment
- [ ] DigitalOcean account created
- [ ] Domain name (teniolaokunlola.com) purchased
- [ ] SSH key pair generated
- [ ] Repository cloned locally
- [ ] Production environment variables prepared

## Step 1: Create Droplet
- [ ] Create Ubuntu 22.04 LTS droplet
- [ ] Choose appropriate size (2GB RAM minimum)
- [ ] Select datacenter location
- [ ] Add SSH key
- [ ] Note droplet IP address

## Step 2: Server Setup
- [ ] SSH to droplet as root
- [ ] Run `scripts/digitalocean-setup.sh`
- [ ] Verify Docker installation: `docker --version`
- [ ] Verify Docker Compose: `docker-compose --version`
- [ ] Verify Nginx: `nginx -v`

## Step 3: Application Deployment
- [ ] Switch to teniola user: `su - teniola`
- [ ] Clone repository: `git clone https://github.com/YOUR_USERNAME/teniola-site.git`
- [ ] Navigate to project: `cd teniola-site`
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Fill in production environment variables
- [ ] Copy `.env.production` to `backend/.env.production`
- [ ] Update nginx.conf with droplet IP
- [ ] Build and start services: `docker-compose -f docker-compose.prod.yml up -d --build`

## Step 4: Domain Configuration
- [ ] Point domain DNS to droplet IP
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify domain resolves: `nslookup teniolaokunlola.com`

## Step 5: SSL Certificate
- [ ] Configure temporary nginx for certbot
- [ ] Obtain SSL certificate: `sudo certbot --nginx -d teniolaokunlola.com -d www.teniolaokunlola.com`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Update nginx with production configuration
- [ ] Test nginx configuration: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`

## Step 6: Testing & Verification
- [ ] Test frontend: `curl -f https://teniolaokunlola.com/health`
- [ ] Test backend: `curl -f https://teniolaokunlola.com/api/health/`
- [ ] Check container status: `./deploy-helper.sh status`
- [ ] Verify SSL certificate: `sudo certbot certificates`
- [ ] Test website in browser

## Step 7: Post-Deployment
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Test backup and restore procedures
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline (optional)

## Health Check Commands
```bash
# Check service status
./deploy-helper.sh status

# Check service health
./deploy-helper.sh health

# View logs
./deploy-helper.sh logs [service-name]

# Restart services
./deploy-helper.sh restart

# Rebuild and deploy
./deploy-helper.sh deploy
```

## Troubleshooting
- [ ] Check firewall rules: `sudo ufw status`
- [ ] Check nginx status: `sudo systemctl status nginx`
- [ ] Check Docker status: `sudo systemctl status docker`
- [ ] View nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] View application logs: `./deploy-helper.sh logs [service-name]`

## Security Checklist
- [ ] Firewall configured (ports 22, 80, 443, 8000 only)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled
- [ ] SSL certificate valid and auto-renewing
- [ ] Security headers configured in nginx
- [ ] Rate limiting enabled
- [ ] Regular security updates scheduled

## Performance Checklist
- [ ] Gzip compression enabled
- [ ] Static asset caching configured
- [ ] Database connection pooling
- [ ] CDN configured (optional)
- [ ] Monitoring and alerting set up

## Backup Checklist
- [ ] Automated daily backups scheduled
- [ ] Backup retention policy configured
- [ ] Backup restoration tested
- [ ] Off-site backup storage configured

## Maintenance Schedule
- [ ] Weekly: Check service health and logs
- [ ] Monthly: Update system packages
- [ ] Quarterly: Review security settings
- [ ] Annually: Full backup and restore test

---

**Deployment Status**: ⏳ Pending
**Last Updated**: [Date]
**Deployed By**: [Name]
**Notes**: [Any special considerations or customizations]
