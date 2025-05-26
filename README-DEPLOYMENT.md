
# Kapelczak ELN - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Kapelczak Electronic Laboratory Notebook in a production environment.

## Quick Start (Automated Deployment)

For a one-click deployment with minimal configuration:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Check system dependencies
- Configure SSL certificates (optional)
- Set up monitoring and backups
- Deploy the application with Docker
- Create systemd services for auto-restart

## Manual Deployment

### Prerequisites

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Domain Name**: Optional, for SSL setup
- **Minimum Hardware**:
  - 2 CPU cores
  - 4GB RAM
  - 20GB disk space
  - Network connectivity

### Installation Steps

#### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in to apply group changes
```

**CentOS/RHEL:**
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Download and Prepare Application

```bash
# Clone or download the application
git clone <repository-url> kapelczak-eln
cd kapelczak-eln

# Make deployment script executable
chmod +x deploy.sh
```

#### 3. Configure Environment

Create a `.env` file for environment-specific settings:

```bash
# Application settings
NODE_ENV=production
APP_NAME=kapelczak-eln

# Security settings (optional)
# Add any API keys or secrets here
```

#### 4. Deploy with Docker Compose

**Basic deployment (HTTP only):**
```bash
docker-compose up -d --build
```

**With SSL (requires domain):**
```bash
# First, ensure your domain points to your server
# Then run with SSL profile
COMPOSE_PROFILES=ssl docker-compose up -d --build
```

#### 5. Verify Deployment

```bash
# Check container status
docker-compose ps

# Check application health
curl http://localhost:80/health

# View logs
docker-compose logs -f
```

## SSL Configuration

### Using Let's Encrypt (Recommended)

1. **Install Certbot:**
```bash
# Ubuntu/Debian
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

2. **Generate Certificate:**
```bash
sudo certbot certonly --standalone \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.com
```

3. **Configure SSL in nginx:**
The deployment script automatically handles SSL configuration when a domain is provided.

### Using Custom Certificates

1. Place your certificates in the `ssl/` directory:
   - `ssl/fullchain.pem` (certificate + intermediate)
   - `ssl/privkey.pem` (private key)

2. Update `nginx.conf` with SSL configuration

## Monitoring and Maintenance

### Health Monitoring

The application includes built-in health checks:

```bash
# Check application health
curl http://localhost:80/health

# Check container health
docker-compose ps
```

### Log Management

```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app

# Monitor system logs
tail -f /var/log/kapelczak-eln-monitor.log
```

### Backup and Recovery

**Automated Backups:**
The deployment script creates automatic daily backups at 2 AM.

**Manual Backup:**
```bash
./backup.sh
```

**Restore from Backup:**
```bash
# Stop application
docker-compose down

# Extract backup
tar -xzf /var/backups/kapelczak-eln/backup_YYYYMMDD_HHMMSS.tar.gz

# Restart application
docker-compose up -d
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Performance Optimization

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### Nginx Optimization

The included `nginx.conf` is pre-optimized with:
- Gzip compression
- Static asset caching
- Security headers
- Performance tuning

### Database Optimization (if using local database)

For Supabase integration, optimization is handled by the Supabase platform.

## Security Considerations

### Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block unnecessary ports
sudo ufw enable
```

### Security Headers

The nginx configuration includes security headers:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory usage
free -h
```

**SSL certificate issues:**
```bash
# Check certificate validity
openssl x509 -in ssl/fullchain.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
```

**Performance issues:**
```bash
# Monitor resource usage
docker stats

# Check container health
docker-compose ps
```

### Support and Maintenance

1. **Monitor logs regularly**
2. **Keep system updated**
3. **Monitor disk space**
4. **Test backups periodically**
5. **Review security settings**

## Advanced Configuration

### Load Balancing

For high-availability deployments, consider:
- Multiple application instances
- Load balancer (nginx, HAProxy)
- Database clustering

### Monitoring Solutions

Integrate with monitoring tools:
- Prometheus + Grafana
- ELK Stack
- Docker monitoring tools

### CI/CD Integration

Set up automated deployment:
- GitHub Actions
- GitLab CI
- Jenkins

## Production Checklist

- [ ] Dependencies installed
- [ ] Domain configured (if using SSL)
- [ ] SSL certificate obtained
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] Health checks working
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Documentation updated

## Contact and Support

For deployment issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Consult the monitoring dashboard
4. Contact system administrator

---

**Note**: This deployment guide assumes a Linux environment. For other operating systems, adjust commands accordingly.
