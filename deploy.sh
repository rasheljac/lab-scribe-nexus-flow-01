#!/bin/bash

# Kapelczak ELN - Production Deployment Script
# This script automates the deployment process for the Kapelczak Electronic Laboratory Notebook

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kapelczak-eln"
DOMAIN=""
EMAIL=""
USE_SSL=false
BACKUP_ENABLED=true

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup_existing_containers() {
    log_info "Cleaning up existing containers and networks..."
    
    # Stop and remove containers with the project name
    docker-compose -p authentication_eln-dev down --remove-orphans 2>/dev/null || true
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Remove any dangling containers
    docker container prune -f 2>/dev/null || true
    
    # Free up the port if something is using it
    local port_process=$(lsof -ti:8086 2>/dev/null || true)
    if [ ! -z "$port_process" ]; then
        log_warning "Port 8086 is in use. Attempting to free it..."
        kill -9 $port_process 2>/dev/null || true
        sleep 2
    fi
    
    log_success "Cleanup completed."
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "All dependencies are installed."
}

collect_configuration() {
    log_info "Collecting deployment configuration..."
    
    read -p "Enter your domain name (e.g., eln.yourdomain.com) [optional]: " DOMAIN
    
    if [ ! -z "$DOMAIN" ]; then
        read -p "Enter your email for SSL certificate: " EMAIL
        read -p "Enable SSL with Let's Encrypt? (y/n) [y]: " ssl_choice
        ssl_choice=${ssl_choice:-y}
        
        if [[ $ssl_choice =~ ^[Yy]$ ]]; then
            USE_SSL=true
        fi
    fi
    
    read -p "Enable automatic backups? (y/n) [y]: " backup_choice
    backup_choice=${backup_choice:-y}
    
    if [[ ! $backup_choice =~ ^[Yy]$ ]]; then
        BACKUP_ENABLED=false
    fi
}

setup_ssl() {
    if [ "$USE_SSL" = true ] && [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
        log_info "Setting up SSL certificate with Let's Encrypt..."
        
        # Create SSL directory
        mkdir -p ssl
        
        # Generate SSL certificate using certbot
        if command -v certbot &> /dev/null; then
            sudo certbot certonly --standalone \
                --email "$EMAIL" \
                --agree-tos \
                --no-eff-email \
                -d "$DOMAIN"
            
            # Copy certificates
            sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/
            sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/
            sudo chown $(whoami):$(whoami) ssl/*.pem
            
            # Create SSL nginx config
            cat > nginx-ssl.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name $DOMAIN;
        
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files \$uri \$uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
            
            log_success "SSL certificate generated and configured."
        else
            log_warning "Certbot not found. SSL setup skipped."
            USE_SSL=false
        fi
    fi
}

create_backup_script() {
    if [ "$BACKUP_ENABLED" = true ]; then
        log_info "Creating backup script..."
        
        cat > backup.sh << 'EOF'
#!/bin/bash

# Backup script for Kapelczak ELN
BACKUP_DIR="/var/backups/kapelczak-eln"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    .

# Keep only last 7 backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
EOF
        
        chmod +x backup.sh
        
        # Add to crontab for daily backups
        (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
        
        log_success "Backup script created and scheduled."
    fi
}

build_and_deploy() {
    log_info "Building and deploying the application..."
    
    # Clean up first to avoid conflicts
    cleanup_existing_containers
    
    # Build and start containers
    if [ "$USE_SSL" = true ]; then
        COMPOSE_PROFILES=ssl docker-compose up -d --build
    else
        docker-compose up -d --build
    fi
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 15
    
    # Health check with retries
    for i in {1..5}; do
        if curl -f http://localhost:8086/health &>/dev/null; then
            log_success "Application is running and healthy!"
            return 0
        fi
        log_info "Health check attempt $i/5 failed, retrying..."
        sleep 5
    done
    
    log_error "Application health check failed after 5 attempts. Please check the logs."
    docker-compose logs --tail=50
    exit 1
}

create_systemd_service() {
    log_info "Creating systemd service for auto-restart..."
    
    sudo tee /etc/systemd/system/kapelczak-eln.service > /dev/null << EOF
[Unit]
Description=Kapelczak ELN Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable kapelczak-eln.service
    
    log_success "Systemd service created and enabled."
}

setup_monitoring() {
    log_info "Setting up basic monitoring..."
    
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script for Kapelczak ELN
LOG_FILE="/var/log/kapelczak-eln-monitor.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    log_message "ERROR: Some containers are not running. Attempting restart..."
    docker-compose up -d
fi

# Check application health
if ! curl -f http://localhost:8086/health &>/dev/null; then
    log_message "ERROR: Application health check failed"
else
    log_message "INFO: Application is healthy"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi
EOF
    
    chmod +x monitor.sh
    
    # Add to crontab for monitoring every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/monitor.sh") | crontab -
    
    log_success "Monitoring script created and scheduled."
}

print_deployment_info() {
    log_success "Deployment completed successfully!"
    echo ""
    echo "=== Deployment Information ==="
    echo "Application: Kapelczak Electronic Laboratory Notebook"
    echo "Status: Running"
    echo "Port: 8086"
    
    if [ ! -z "$DOMAIN" ]; then
        if [ "$USE_SSL" = true ]; then
            echo "URL: https://$DOMAIN"
        else
            echo "URL: http://$DOMAIN"
        fi
    else
        echo "URL: http://localhost:8086"
    fi
    
    echo ""
    echo "=== Management Commands ==="
    echo "View logs: docker-compose logs -f"
    echo "Stop application: docker-compose down"
    echo "Start application: docker-compose up -d"
    echo "Restart application: docker-compose restart"
    echo "Update application: ./deploy.sh"
    
    if [ "$BACKUP_ENABLED" = true ]; then
        echo "Manual backup: ./backup.sh"
    fi
    
    echo ""
    echo "=== Monitoring ==="
    echo "Monitor logs: tail -f /var/log/kapelczak-eln-monitor.log"
    echo "System status: systemctl status kapelczak-eln"
    echo ""
}

# Main deployment process
main() {
    echo "=== Kapelczak ELN Production Deployment ==="
    echo ""
    
    check_dependencies
    collect_configuration
    setup_ssl
    create_backup_script
    build_and_deploy
    create_systemd_service
    setup_monitoring
    print_deployment_info
}

# Run main function
main "$@"
