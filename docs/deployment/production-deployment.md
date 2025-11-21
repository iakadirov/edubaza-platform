# 🚀 Production Deployment Guide

**Server:** Hetzner VPS (157.180.73.190)
**Domain:** https://baza.eduplay.uz
**Status:** ✅ Deployed
**Last Updated:** 2025-11-22

---

## 📋 Server Specifications

- **Provider:** Hetzner Cloud
- **IP:** 157.180.73.190
- **RAM:** 2 GB
- **Disk:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS
- **vCPU:** 2 cores

---

## 🔧 Installed Software

### System Requirements
- **Node.js:** 20.19.5 LTS
- **npm:** 10.8.2
- **PostgreSQL:** 16.10
- **PM2:** 6.0.13 (Process Manager)
- **Nginx:** 1.24.0 (Reverse Proxy)
- **Certbot:** SSL Certificate Management

### Application Stack
- **Next.js:** 14.2.33 (App Router)
- **Prisma ORM:** 5.22.0
- **React:** 18.2.0
- **TypeScript:** 5.3.3

---

## 🗄️ Database Configuration

**PostgreSQL Database:**
```
Host: localhost
Port: 5432
Database: edubaza
User: edubaza
Password: edubaza_secure_2025
```

**Connection String:**
```
postgresql://edubaza:edubaza_secure_2025@localhost:5432/edubaza?schema=public
```

**Tables:**
- users (authentication, profiles)
- worksheets (generated worksheets)
- grades (classes 1-11)
- subjects (Math, Physics, etc.)
- topics (curriculum topics)
- content_items (tasks, tests, questions)
- subscription_plans (FREE, PRO, SCHOOL)

---

## 🔐 Environment Variables

**Location:** `/root/edubaza-platform/.env`

```bash
# Database
DATABASE_URL="postgresql://edubaza:edubaza_secure_2025@localhost:5432/edubaza?schema=public"

# JWT Authentication
JWT_SECRET="edubaza_jwt_secret_key_2024_very_secure_change_in_production_32chars"
JWT_EXPIRES_IN=30d

# SMS OTP (Eskiz.uz)
ESKIZ_EMAIL=iakadirov@gmail.com
ESKIZ_PASSWORD=4eobRTT41AS53Ysor1NkdA6LsgeXRIGg7QIaRCbN
ESKIZ_API_URL=https://notify.eskiz.uz/api

# AI Generation (Google Gemini)
GEMINI_API_KEY=AIzaSyBsbQt6pS1lJNNd8Wkh3j0RvDAeVPR25Ns
GEMINI_MODEL=gemini-2.0-flash-exp

# Next.js
NODE_ENV=production
PORT=3000
```

---

## 🚀 Deployment Process

### Initial Setup (Done Once)

1. **SSH Access:**
   ```bash
   ssh root@157.180.73.190
   # Password: EduBaz@2025!
   ```

2. **Clone Repository:**
   ```bash
   cd /root
   git clone https://github.com/iakadirov/edubaza-platform.git
   cd edubaza-platform
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Setup Database:**
   ```bash
   # Database already created:
   # - Database: edubaza
   # - User: edubaza
   # - Password: edubaza_secure_2025
   ```

5. **Configure Environment:**
   ```bash
   # .env file already created with all credentials
   cat .env  # Verify environment variables
   ```

6. **Make Deploy Script Executable:**
   ```bash
   chmod +x deploy.sh
   ```

7. **First Deployment:**
   ```bash
   ./deploy.sh
   ```

### Automated Deployment (GitHub Actions)

**Every push to `main` branch automatically:**
1. Triggers GitHub Action workflow
2. SSH into server
3. Runs `./deploy.sh` script
4. Application automatically updates

**deploy.sh does:**
1. Pull latest code: `git pull origin main`
2. Install dependencies: `npm install`
3. Build application: `npm run build`
4. Restart PM2 process: `pm2 restart edubaza`
5. Show status: `pm2 list`

---

## 🔄 Manual Deployment

If you need to deploy manually:

```bash
# SSH into server
ssh root@157.180.73.190

# Navigate to project
cd /root/edubaza-platform

# Run deploy script
./deploy.sh
```

---

## 📊 Process Management (PM2)

### PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs edubaza

# View last 50 lines
pm2 logs edubaza --lines 50

# Restart application
pm2 restart edubaza

# Stop application
pm2 stop edubaza

# Start application
pm2 start npm --name "edubaza" -- start

# Monitor resources
pm2 monit

# Show process info
pm2 show edubaza
```

### PM2 Status

Application runs as PM2 process named "edubaza"
- Auto-restart on failure
- Logs stored in PM2 log directory
- Starts automatically on server reboot

---

## 🌐 Nginx Configuration

**Config File:** `/etc/nginx/sites-available/edubaza`

```nginx
server {
    listen 80;
    server_name baza.eduplay.uz;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name baza.eduplay.uz;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/baza.eduplay.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baza.eduplay.uz/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View status
systemctl status nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

---

## 🔒 SSL Certificate (Let's Encrypt)

**Certificate Status:** ✅ Active
**Domain:** baza.eduplay.uz
**Provider:** Let's Encrypt (Certbot)

### SSL Certificate Commands

```bash
# Renew certificate (auto-renewal is configured)
certbot renew

# Force renew
certbot renew --force-renewal

# Check certificate status
certbot certificates

# Test auto-renewal
certbot renew --dry-run
```

**Auto-Renewal:** Configured via cron (runs twice daily)

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs edubaza --lines 100

# Check if port 3000 is in use
netstat -tulpn | grep :3000

# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Restart application
pm2 restart edubaza
```

### Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Connect to database
psql -U edubaza -d edubaza

# Check database tables
psql -U edubaza -d edubaza -c "\dt"

# Restart PostgreSQL
systemctl restart postgresql
```

### Nginx Issues

```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# View error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Build Errors

If `npm run build` fails:

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Try build again
npm run build
```

---

## 📈 Monitoring

### System Resources

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# PM2 monitoring
pm2 monit
```

### Application Logs

```bash
# PM2 logs (real-time)
pm2 logs edubaza

# PM2 logs (last 100 lines)
pm2 logs edubaza --lines 100

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

---

## 🔄 Rollback

If deployment fails, rollback to previous version:

```bash
# SSH into server
ssh root@157.180.73.190

# Navigate to project
cd /root/edubaza-platform

# View commit history
git log --oneline -10

# Rollback to previous commit
git reset --hard <previous-commit-hash>

# Rebuild and restart
npm install
npm run build
pm2 restart edubaza
```

---

## 📝 Maintenance Tasks

### Daily
- Monitor PM2 logs for errors
- Check application uptime

### Weekly
- Review Nginx logs
- Monitor disk usage
- Check database performance

### Monthly
- Update Node.js dependencies (if needed)
- Review SSL certificate expiration
- Database backup verification

---

## 🔗 Important URLs

- **Production App:** https://baza.eduplay.uz
- **GitHub Repository:** https://github.com/iakadirov/edubaza-platform
- **GitHub Actions:** https://github.com/iakadirov/edubaza-platform/actions

---

## 📞 Support Contacts

**Server Provider:** Hetzner Cloud
**Domain Provider:** eduplay.uz registrar
**SSL Provider:** Let's Encrypt (Free)

---

## ✅ Deployment Checklist

### Initial Setup
- [x] Server provisioned (Hetzner)
- [x] Domain configured (baza.eduplay.uz)
- [x] SSH access configured
- [x] Node.js installed
- [x] PostgreSQL installed and configured
- [x] Database created
- [x] PM2 installed
- [x] Nginx installed and configured
- [x] SSL certificate installed
- [x] Repository cloned
- [x] Environment variables configured
- [x] First deployment successful

### Automated Deployment
- [x] GitHub Actions workflow created
- [x] SSH keys configured
- [x] deploy.sh script created
- [x] Auto-deployment tested

### Post-Deployment
- [x] Application accessible at https://baza.eduplay.uz
- [x] SSL certificate valid
- [x] Database connections working
- [x] Authentication working (SMS OTP)
- [x] AI generation working (Gemini)
- [x] PM2 auto-restart configured

---

**Status:** ✅ Production Deployment Complete
**Date:** 2025-11-22
**Version:** 2.0
**Next Steps:** Monitor application performance and user feedback
