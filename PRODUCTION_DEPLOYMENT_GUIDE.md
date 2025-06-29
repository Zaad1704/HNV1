# HNV Property Management - Production Deployment Guide

## 🚀 Complete Production Deployment

### Prerequisites
- Docker & Docker Compose
- Domain name with DNS access
- SSL certificate (Let's Encrypt recommended)
- MongoDB Atlas or self-hosted MongoDB
- Redis instance
- Email service (Gmail, SendGrid, etc.)

### 1. Environment Setup

```bash
# Clone repository
git clone <your-repo-url>
cd HNV1

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Required Environment Variables

```bash
# Production Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hnv_production

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
API_SECRET=your_api_signature_secret_32_chars

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_business_email@domain.com
EMAIL_PASS=your_app_specific_password

# Domain & SSL
DOMAIN_NAME=yourdomain.com
SSL_EMAIL=admin@yourdomain.com

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Database Setup

```bash
# Create database indexes
cd backend
npm run create-indexes

# Run migrations (if any)
npm run migrate
```

### 4. SSL Certificate Setup

```bash
# Create SSL directories
mkdir -p nginx/ssl nginx/www

# Generate SSL certificate with Certbot
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com
```

### 5. Production Deployment

```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 6. Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5001;
    }

    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/live/yourdomain.com/privkey.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            
            # Enable gzip compression
            gzip on;
            gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        }
    }
}
```

### 7. Monitoring Setup

```bash
# Install monitoring tools
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Grafana: https://yourdomain.com:3000
# Prometheus: https://yourdomain.com:9090
```

### 8. Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$DATE"

# File uploads backup
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/

# Remove backups older than 30 days
find $BACKUP_DIR -name "mongo_*" -mtime +30 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### 9. Health Checks & Monitoring

```bash
# Check application health
curl https://yourdomain.com/api/health

# Monitor logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# Monitor system resources
docker stats
```

### 10. Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Strong passwords for all services
- [ ] Database access restricted to application only
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] File upload restrictions in place
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Error logging and tracking enabled

### 11. Performance Optimization

```bash
# Enable Redis caching
REDIS_URL=redis://redis:6379

# Configure CDN (CloudFlare recommended)
# Point DNS to CloudFlare
# Enable caching rules for static assets

# Database optimization
# Create proper indexes
# Enable connection pooling
# Monitor slow queries
```

### 12. Scaling Considerations

```bash
# Horizontal scaling with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.production.yml hnv-stack

# Or use Kubernetes
kubectl apply -f k8s/
```

### 13. Maintenance Tasks

```bash
# Weekly tasks
- Review error logs
- Check disk space
- Update dependencies
- Review security alerts

# Monthly tasks
- Rotate logs
- Update SSL certificates
- Performance review
- Backup verification

# Quarterly tasks
- Security audit
- Dependency updates
- Performance optimization
- Disaster recovery testing
```

### 14. Troubleshooting

```bash
# Common issues and solutions

# Service won't start
docker-compose -f docker-compose.production.yml logs service-name

# Database connection issues
docker exec -it mongodb mongo --eval "db.adminCommand('ping')"

# SSL certificate issues
docker-compose run --rm certbot certificates

# High memory usage
docker stats
docker system prune -a

# Performance issues
# Check logs for slow queries
# Monitor API response times
# Review database indexes
```

### 15. Support & Maintenance

- Monitor application logs daily
- Set up alerts for critical errors
- Regular security updates
- Performance monitoring
- User feedback collection
- Regular backups verification

## 🎯 Go-Live Checklist

- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] Database properly configured and indexed
- [ ] Email service working
- [ ] Payment processing tested
- [ ] Monitoring and logging active
- [ ] Backup strategy implemented
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] Documentation updated

Your HNV Property Management platform is now production-ready! 🚀