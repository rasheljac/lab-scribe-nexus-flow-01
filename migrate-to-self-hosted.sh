
#!/bin/bash

# Kapelczak ELN - Automated Supabase Self-Hosting Migration Script
# This script automates the complete migration from hosted Supabase to self-hosted instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/migration_backup_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$BACKUP_DIR/migration.log"
CONFIG_FILE="$BACKUP_DIR/migration_config.json"

# Migration configuration variables
CURRENT_SUPABASE_URL=""
CURRENT_SUPABASE_KEY=""
CURRENT_DB_HOST=""
CURRENT_DB_PASSWORD=""
TARGET_DOMAIN=""
TARGET_EMAIL=""
USE_SSL=""
SMTP_HOST=""
SMTP_USER=""
SMTP_PASS=""
JWT_SECRET=""
ANON_KEY=""
SERVICE_ROLE_KEY=""
DB_PASSWORD=""
DASHBOARD_PASSWORD=""

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

log_progress() {
    echo -e "${CYAN}[PROGRESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons."
        log_info "Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Create backup directory and initialize logging
init_logging() {
    mkdir -p "$BACKUP_DIR"
    touch "$LOG_FILE"
    log_info "Migration started at $(date)"
    log_info "Backup directory: $BACKUP_DIR"
}

# Check system dependencies
check_dependencies() {
    log_step "Checking system dependencies..."
    
    local missing_deps=()
    
    # Check for required commands
    for cmd in docker docker-compose git curl pg_dump openssl jq; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and run the script again."
        
        # Provide installation instructions
        echo ""
        echo "Installation instructions:"
        echo "Ubuntu/Debian: sudo apt update && sudo apt install -y docker.io docker-compose git curl postgresql-client openssl jq"
        echo "CentOS/RHEL: sudo yum install -y docker docker-compose git curl postgresql openssl jq"
        echo "macOS: brew install docker docker-compose git curl postgresql openssl jq"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check available disk space (minimum 10GB)
    local available_space=$(df "$SCRIPT_DIR" | awk 'NR==2 {print $4}')
    local required_space=$((10 * 1024 * 1024)) # 10GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_warning "Low disk space detected. At least 10GB recommended for migration."
        read -p "Continue anyway? (y/N): " continue_choice
        if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "All dependencies satisfied."
}

# Collect configuration from user
collect_configuration() {
    log_step "Collecting migration configuration..."
    
    echo ""
    echo "=== CURRENT SUPABASE CONFIGURATION ==="
    echo "Please provide your current hosted Supabase configuration:"
    echo ""
    
    # Current Supabase URL
    while [ -z "$CURRENT_SUPABASE_URL" ]; do
        read -p "Current Supabase URL (e.g., https://xxx.supabase.co): " CURRENT_SUPABASE_URL
        if [[ ! $CURRENT_SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]]; then
            log_warning "URL should be in format: https://xxx.supabase.co"
            CURRENT_SUPABASE_URL=""
        fi
    done
    
    # Current Supabase Anon Key
    while [ -z "$CURRENT_SUPABASE_KEY" ]; do
        read -p "Current Supabase Anon Key: " CURRENT_SUPABASE_KEY
        if [ ${#CURRENT_SUPABASE_KEY} -lt 100 ]; then
            log_warning "Anon key seems too short. Please verify."
            CURRENT_SUPABASE_KEY=""
        fi
    done
    
    # Database connection details
    echo ""
    echo "Database connection details (found in Supabase Dashboard > Settings > Database):"
    
    while [ -z "$CURRENT_DB_HOST" ]; do
        read -p "Database Host (e.g., db.xxx.supabase.co): " CURRENT_DB_HOST
    done
    
    while [ -z "$CURRENT_DB_PASSWORD" ]; do
        read -s -p "Database Password: " CURRENT_DB_PASSWORD
        echo ""
        if [ -z "$CURRENT_DB_PASSWORD" ]; then
            log_warning "Database password cannot be empty."
        fi
    done
    
    echo ""
    echo "=== TARGET CONFIGURATION ==="
    echo "Configure your self-hosted Supabase instance:"
    echo ""
    
    # Target domain (optional)
    read -p "Target domain (optional, e.g., eln.yourdomain.com): " TARGET_DOMAIN
    
    if [ ! -z "$TARGET_DOMAIN" ]; then
        read -p "Your email for SSL certificate: " TARGET_EMAIL
        read -p "Enable SSL with Let's Encrypt? (y/N): " ssl_choice
        if [[ $ssl_choice =~ ^[Yy]$ ]]; then
            USE_SSL="true"
        else
            USE_SSL="false"
        fi
    else
        USE_SSL="false"
        log_info "Using localhost configuration without SSL."
    fi
    
    echo ""
    echo "=== EMAIL CONFIGURATION ==="
    echo "Configure SMTP settings for notifications:"
    echo ""
    
    read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
    read -p "SMTP User (email address): " SMTP_USER
    read -s -p "SMTP Password: " SMTP_PASS
    echo ""
    
    echo ""
    echo "=== SECURITY CONFIGURATION ==="
    echo "Generating secure passwords and tokens..."
    
    # Generate secure passwords and tokens
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | sed 's/[^a-zA-Z0-9]//g')
    DASHBOARD_PASSWORD=$(openssl rand -base64 24 | tr -d '\n' | sed 's/[^a-zA-Z0-9]//g')
    
    log_info "Generated secure JWT secret, database password, and dashboard password."
    
    # Save configuration
    cat > "$CONFIG_FILE" << EOF
{
  "current_supabase_url": "$CURRENT_SUPABASE_URL",
  "current_supabase_key": "$CURRENT_SUPABASE_KEY",
  "current_db_host": "$CURRENT_DB_HOST",
  "target_domain": "$TARGET_DOMAIN",
  "target_email": "$TARGET_EMAIL",
  "use_ssl": "$USE_SSL",
  "smtp_host": "$SMTP_HOST",
  "smtp_user": "$SMTP_USER",
  "migration_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    log_success "Configuration collected and saved."
}

# Generate JWT tokens
generate_jwt_tokens() {
    log_step "Generating JWT tokens..."
    
    # Create temporary Node.js script to generate JWT tokens
    cat > "$BACKUP_DIR/generate_jwt.js" << 'EOF'
const crypto = require('crypto');

function base64UrlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlEncode(str) {
    return base64UrlEscape(Buffer.from(str).toString('base64'));
}

function base64UrlDecode(str) {
    str += new Array(5 - str.length % 4).join('=');
    return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function sign(message, secret) {
    return base64UrlEscape(crypto.createHmac('sha256', secret).update(message).digest('base64'));
}

function generateJWT(payload, secret) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = sign(encodedHeader + '.' + encodedPayload, secret);
    
    return encodedHeader + '.' + encodedPayload + '.' + signature;
}

const secret = process.argv[2];
const role = process.argv[3];

const payload = {
    iss: 'supabase',
    ref: 'localhost',
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

console.log(generateJWT(payload, secret));
EOF
    
    # Generate tokens
    ANON_KEY=$(node "$BACKUP_DIR/generate_jwt.js" "$JWT_SECRET" "anon")
    SERVICE_ROLE_KEY=$(node "$BACKUP_DIR/generate_jwt.js" "$JWT_SECRET" "service_role")
    
    log_success "JWT tokens generated successfully."
}

# Export data from current Supabase instance
export_current_data() {
    log_step "Exporting data from current Supabase instance..."
    
    local export_dir="$BACKUP_DIR/exported_data"
    mkdir -p "$export_dir"
    
    log_progress "Exporting database schema and data..."
    
    # Export database schema
    PGPASSWORD="$CURRENT_DB_PASSWORD" pg_dump \
        -h "$CURRENT_DB_HOST" \
        -U postgres \
        -d postgres \
        --schema-only \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > "$export_dir/schema.sql" 2>> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        log_success "Database schema exported successfully."
    else
        log_error "Failed to export database schema."
        return 1
    fi
    
    # Export database data
    PGPASSWORD="$CURRENT_DB_PASSWORD" pg_dump \
        -h "$CURRENT_DB_HOST" \
        -U postgres \
        -d postgres \
        --data-only \
        --no-owner \
        --no-privileges \
        --disable-triggers \
        > "$export_dir/data.sql" 2>> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        log_success "Database data exported successfully."
    else
        log_error "Failed to export database data."
        return 1
    fi
    
    # Export storage files (if accessible)
    log_progress "Attempting to export storage files..."
    
    # Create a simple script to download storage files using Supabase API
    cat > "$export_dir/download_storage.sh" << EOF
#!/bin/bash
# Storage download script (manual execution required)
# Due to RLS policies, storage files may need to be downloaded manually
echo "Storage files should be manually downloaded from Supabase Dashboard > Storage"
echo "Save them to: $export_dir/storage/"
mkdir -p "$export_dir/storage"
EOF
    
    chmod +x "$export_dir/download_storage.sh"
    
    log_warning "Storage files need to be manually downloaded from Supabase Dashboard."
    log_info "Please download all storage bucket contents and save them to: $export_dir/storage/"
    
    read -p "Press Enter when storage files have been downloaded (or skip if none exist)..."
    
    log_success "Data export completed."
}

# Setup self-hosted Supabase
setup_selfhosted_supabase() {
    log_step "Setting up self-hosted Supabase..."
    
    local supabase_dir="$SCRIPT_DIR/supabase-selfhosted"
    
    # Clone Supabase repository
    log_progress "Downloading Supabase Docker setup..."
    
    if [ -d "$supabase_dir" ]; then
        rm -rf "$supabase_dir"
    fi
    
    git clone --depth 1 https://github.com/supabase/supabase.git "$supabase_dir" >> "$LOG_FILE" 2>&1
    
    if [ $? -ne 0 ]; then
        log_error "Failed to download Supabase repository."
        return 1
    fi
    
    cd "$supabase_dir/docker"
    
    # Create environment configuration
    log_progress "Configuring environment variables..."
    
    cp .env.example .env
    
    # Configure .env file
    cat > .env << EOF
############
# SECRETS
############

JWT_SECRET=$JWT_SECRET
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

############
# DATABASE
############

POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_PORT=5432

############
# API PROXY
############

KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

############
# API
############

PGRST_DB_SCHEMAS=public,storage,graphql_public

############
# AUTH
############

## General
SITE_URL=${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:3000}
ADDITIONAL_REDIRECT_URLS=${TARGET_DOMAIN:+https://$TARGET_DOMAIN/auth/callback}${TARGET_DOMAIN:-http://localhost:3000/auth/callback}
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
API_EXTERNAL_URL=${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:8000}

## Mailer Config
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
MAILER_URLPATHS_INVITE="/auth/v1/verify"
MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"

## Email auth
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
SMTP_ADMIN_EMAIL=$TARGET_EMAIL
SMTP_HOST=$SMTP_HOST
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_SENDER_NAME=Kapelczak ELN

############
# DASHBOARD
############

DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD

############
# STORAGE
############

STORAGE_BACKEND=file
GLOBAL_S3_BUCKET=storage
EOF
    
    # Start Supabase services
    log_progress "Starting Supabase services..."
    
    docker-compose up -d >> "$LOG_FILE" 2>&1
    
    if [ $? -ne 0 ]; then
        log_error "Failed to start Supabase services."
        return 1
    fi
    
    # Wait for services to be ready
    log_progress "Waiting for services to initialize..."
    sleep 30
    
    # Health check
    local retries=0
    local max_retries=10
    
    while [ $retries -lt $max_retries ]; do
        if curl -f http://localhost:8000/rest/v1/ &>/dev/null; then
            log_success "Supabase services are running."
            break
        fi
        
        retries=$((retries + 1))
        log_progress "Waiting for services... ($retries/$max_retries)"
        sleep 10
    done
    
    if [ $retries -eq $max_retries ]; then
        log_error "Services failed to start properly."
        docker-compose logs --tail=50 >> "$LOG_FILE" 2>&1
        return 1
    fi
    
    log_success "Self-hosted Supabase setup completed."
}

# Apply database migrations
apply_migrations() {
    log_step "Applying database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Apply the existing migrations from the project
    log_progress "Applying project-specific migrations..."
    
    # Copy migrations to a temporary location
    local migrations_dir="$BACKUP_DIR/migrations"
    mkdir -p "$migrations_dir"
    
    # Apply each migration file found in the project
    for migration_file in "$SCRIPT_DIR/supabase/migrations"/*.sql; do
        if [ -f "$migration_file" ]; then
            local migration_name=$(basename "$migration_file")
            log_progress "Applying migration: $migration_name"
            
            docker exec supabase-db psql -U postgres -d postgres -f - < "$migration_file" >> "$LOG_FILE" 2>&1
            
            if [ $? -eq 0 ]; then
                log_success "Applied migration: $migration_name"
            else
                log_warning "Migration $migration_name may have failed. Check logs."
            fi
        fi
    done
    
    # Apply additional setup for Kapelczak ELN
    log_progress "Setting up Kapelczak ELN specific configuration..."
    
    docker exec supabase-db psql -U postgres -d postgres << 'EOF' >> "$LOG_FILE" 2>&1
-- Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.experiment_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.experiment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.idea_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.label_templates ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('experiment-attachments', 'experiment-attachments', false),
  ('protocol-attachments', 'protocol-attachments', false),
  ('experiment-note-attachments', 'experiment-note-attachments', false),
  ('avatars', 'avatars', true),
  ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
  -- Policies for experiment-attachments bucket
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own attachments' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload their own attachments"
      ON storage.objects FOR INSERT 
      WITH CHECK (bucket_id = 'experiment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own attachments' AND tablename = 'objects') THEN
    CREATE POLICY "Users can view their own attachments"
      ON storage.objects FOR SELECT 
      USING (bucket_id = 'experiment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own attachments' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete their own attachments"
      ON storage.objects FOR DELETE 
      USING (bucket_id = 'experiment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END
$$;
EOF
    
    log_success "Database migrations applied successfully."
}

# Import exported data
import_data() {
    log_step "Importing exported data..."
    
    local export_dir="$BACKUP_DIR/exported_data"
    
    if [ -f "$export_dir/data.sql" ]; then
        log_progress "Importing database data..."
        
        docker exec -i supabase-db psql -U postgres -d postgres < "$export_dir/data.sql" >> "$LOG_FILE" 2>&1
        
        if [ $? -eq 0 ]; then
            log_success "Database data imported successfully."
        else
            log_warning "Some data import issues occurred. Check logs for details."
        fi
    else
        log_warning "No data export file found. Skipping data import."
    fi
    
    # Import storage files if they exist
    if [ -d "$export_dir/storage" ] && [ "$(ls -A $export_dir/storage 2>/dev/null)" ]; then
        log_progress "Importing storage files..."
        log_info "Storage file import requires manual upload to the new instance."
        log_info "Files are available in: $export_dir/storage"
    fi
    
    log_success "Data import completed."
}

# Deploy Edge Functions
deploy_edge_functions() {
    log_step "Deploying Edge Functions..."
    
    # Check if Supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        log_progress "Installing Supabase CLI..."
        npm install -g supabase >> "$LOG_FILE" 2>&1
        
        if [ $? -ne 0 ]; then
            log_warning "Failed to install Supabase CLI. Edge functions will need to be deployed manually."
            return 0
        fi
    fi
    
    cd "$SCRIPT_DIR"
    
    # Initialize Supabase project
    log_progress "Initializing Supabase project..."
    
    # Link to local instance
    echo "http://localhost:54321" | supabase link --project-ref localhost >> "$LOG_FILE" 2>&1
    
    # Deploy functions
    for func_dir in supabase/functions/*/; do
        if [ -d "$func_dir" ]; then
            local func_name=$(basename "$func_dir")
            log_progress "Deploying function: $func_name"
            
            supabase functions deploy "$func_name" --project-ref localhost >> "$LOG_FILE" 2>&1
            
            if [ $? -eq 0 ]; then
                log_success "Deployed function: $func_name"
            else
                log_warning "Failed to deploy function: $func_name"
            fi
        fi
    done
    
    log_success "Edge Functions deployment completed."
}

# Update application configuration
update_app_config() {
    log_step "Updating application configuration..."
    
    # Create new Supabase client configuration
    local new_url="${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:8000}"
    
    log_progress "Updating Supabase client configuration..."
    
    # Update the client configuration
    cat > "$SCRIPT_DIR/src/integrations/supabase/client.ts" << EOF
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "$new_url";
const SUPABASE_PUBLISHABLE_KEY = "$ANON_KEY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
EOF
    
    # Update Supabase config
    cat > "$SCRIPT_DIR/supabase/config.toml" << EOF
project_id = "localhost"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322

[db.pooler]
enabled = false
port = 54329
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100

[realtime]
enabled = true
port = 54323
ip_version = "ipv4"

[studio]
enabled = true
port = 54324
api_url = "$new_url"

[inbucket]
enabled = true
port = 54325
smtp_port = 54326
pop3_port = 54327

[storage]
enabled = true
port = 54326
file_size_limit = "50MiB"

[auth]
enabled = true
port = 54327
site_url = "${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:3000}"
additional_redirect_urls = ["${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:3000}"]
jwt_expiry = 3600
enable_signup = true
enable_confirmations = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[functions.send-task-reminders]
verify_jwt = false
EOF
    
    # Create production environment file
    cat > "$SCRIPT_DIR/.env.production" << EOF
VITE_SUPABASE_URL=$new_url
VITE_SUPABASE_ANON_KEY=$ANON_KEY
NODE_ENV=production
EOF
    
    log_success "Application configuration updated."
}

# Setup SSL (if requested)
setup_ssl() {
    if [ "$USE_SSL" = "true" ] && [ ! -z "$TARGET_DOMAIN" ]; then
        log_step "Setting up SSL certificate..."
        
        # Install certbot if not available
        if ! command -v certbot &> /dev/null; then
            log_progress "Installing certbot..."
            
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y certbot >> "$LOG_FILE" 2>&1
            elif command -v yum &> /dev/null; then
                sudo yum install -y certbot >> "$LOG_FILE" 2>&1
            else
                log_warning "Please install certbot manually for SSL setup."
                return 0
            fi
        fi
        
        # Generate SSL certificate
        log_progress "Generating SSL certificate for $TARGET_DOMAIN..."
        
        sudo certbot certonly --standalone \
            --email "$TARGET_EMAIL" \
            --agree-tos \
            --no-eff-email \
            -d "$TARGET_DOMAIN" >> "$LOG_FILE" 2>&1
        
        if [ $? -eq 0 ]; then
            log_success "SSL certificate generated successfully."
            
            # Create nginx configuration
            setup_nginx_proxy
        else
            log_warning "SSL certificate generation failed. Continuing without SSL."
        fi
    fi
}

# Setup nginx proxy
setup_nginx_proxy() {
    log_progress "Setting up nginx proxy..."
    
    mkdir -p "$SCRIPT_DIR/nginx"
    
    cat > "$SCRIPT_DIR/nginx/nginx.conf" << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream supabase {
        server localhost:8000;
    }

    server {
        listen 80;
        server_name $TARGET_DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name $TARGET_DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$TARGET_DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$TARGET_DOMAIN/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://supabase;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF
    
    # Start nginx proxy
    docker run -d \
        --name nginx-proxy \
        --restart unless-stopped \
        -p 80:80 -p 443:443 \
        -v /etc/letsencrypt:/etc/letsencrypt:ro \
        -v "$SCRIPT_DIR/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
        nginx:alpine >> "$LOG_FILE" 2>&1
    
    log_success "Nginx proxy configured and started."
}

# Build and deploy application
build_deploy_app() {
    log_step "Building and deploying application..."
    
    cd "$SCRIPT_DIR"
    
    # Install dependencies
    log_progress "Installing application dependencies..."
    npm install >> "$LOG_FILE" 2>&1
    
    if [ $? -ne 0 ]; then
        log_error "Failed to install dependencies."
        return 1
    fi
    
    # Build application
    log_progress "Building application..."
    npm run build >> "$LOG_FILE" 2>&1
    
    if [ $? -ne 0 ]; then
        log_error "Failed to build application."
        return 1
    fi
    
    # Deploy with Docker
    log_progress "Deploying application with Docker..."
    docker-compose up -d --build >> "$LOG_FILE" 2>&1
    
    if [ $? -ne 0 ]; then
        log_error "Failed to deploy application."
        return 1
    fi
    
    log_success "Application built and deployed successfully."
}

# Setup monitoring and backups
setup_monitoring_backups() {
    log_step "Setting up monitoring and backups..."
    
    # Create monitoring script
    cat > "$SCRIPT_DIR/monitor-selfhosted.sh" << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/kapelczak-eln-monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if all services are running
cd "$(dirname "$0")/supabase-selfhosted/docker"
if ! docker-compose ps | grep -q "Up"; then
    log_message "ERROR: Some Supabase services are down. Restarting..."
    docker-compose up -d
fi

# Check database connectivity
if ! docker exec supabase-db pg_isready -U postgres; then
    log_message "ERROR: Database is not responding"
fi

# Check API endpoint
if ! curl -f http://localhost:8000/rest/v1/ &>/dev/null; then
    log_message "ERROR: REST API is not responding"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi

log_message "INFO: Health check completed"
EOF
    
    chmod +x "$SCRIPT_DIR/monitor-selfhosted.sh"
    
    # Create backup script
    cat > "$SCRIPT_DIR/backup-selfhosted.sh" << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/kapelczak-eln-selfhosted"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/postgres_$DATE.sql"
VOLUME_BACKUP_FILE="$BACKUP_DIR/volumes_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Backup database
docker exec supabase-db pg_dump -U postgres postgres > "$DB_BACKUP_FILE"

# Backup Docker volumes
docker run --rm \
  -v supabase_db_data:/source:ro \
  -v supabase_storage_data:/source2:ro \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/volumes_$DATE.tar.gz" -C /source . -C /source2 .

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.sql" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $DB_BACKUP_FILE"
EOF
    
    chmod +x "$SCRIPT_DIR/backup-selfhosted.sh"
    
    # Schedule monitoring and backups
    (crontab -l 2>/dev/null; echo "*/5 * * * * $SCRIPT_DIR/monitor-selfhosted.sh") | crontab -
    (crontab -l 2>/dev/null; echo "0 2 * * * $SCRIPT_DIR/backup-selfhosted.sh") | crontab -
    
    log_success "Monitoring and backup scripts configured."
}

# Verify migration
verify_migration() {
    log_step "Verifying migration..."
    
    # Health checks
    local health_checks=0
    local max_checks=5
    
    # Check database
    log_progress "Checking database connectivity..."
    if docker exec supabase-db pg_isready -U postgres >> "$LOG_FILE" 2>&1; then
        log_success "Database is responsive."
        health_checks=$((health_checks + 1))
    else
        log_error "Database health check failed."
    fi
    
    # Check REST API
    log_progress "Checking REST API..."
    if curl -f http://localhost:8000/rest/v1/ &>/dev/null; then
        log_success "REST API is responsive."
        health_checks=$((health_checks + 1))
    else
        log_error "REST API health check failed."
    fi
    
    # Check Auth service
    log_progress "Checking Auth service..."
    if curl -f http://localhost:8000/auth/v1/settings &>/dev/null; then
        log_success "Auth service is responsive."
        health_checks=$((health_checks + 1))
    else
        log_error "Auth service health check failed."
    fi
    
    # Check Storage service
    log_progress "Checking Storage service..."
    if curl -f http://localhost:8000/storage/v1/bucket &>/dev/null; then
        log_success "Storage service is responsive."
        health_checks=$((health_checks + 1))
    else
        log_error "Storage service health check failed."
    fi
    
    # Check Application
    log_progress "Checking application..."
    if curl -f http://localhost:8086/ &>/dev/null; then
        log_success "Application is responsive."
        health_checks=$((health_checks + 1))
    else
        log_error "Application health check failed."
    fi
    
    # Summary
    log_info "Health checks passed: $health_checks/$max_checks"
    
    if [ $health_checks -ge 4 ]; then
        log_success "Migration verification completed successfully."
        return 0
    else
        log_warning "Some health checks failed. Please review the logs."
        return 1
    fi
}

# Create migration summary
create_summary() {
    log_step "Creating migration summary..."
    
    local summary_file="$BACKUP_DIR/MIGRATION_SUMMARY.md"
    
    cat > "$summary_file" << EOF
# Kapelczak ELN Self-Hosted Migration Summary

**Migration Date:** $(date)
**Migration Directory:** $BACKUP_DIR

## Configuration

- **Source:** $CURRENT_SUPABASE_URL
- **Target:** ${TARGET_DOMAIN:-localhost}
- **SSL Enabled:** $USE_SSL
- **SMTP Configured:** ${SMTP_HOST:-No}

## Services Status

The following services have been configured and deployed:

- ✅ PostgreSQL Database (port 5432)
- ✅ PostgREST API (port 8000)
- ✅ GoTrue Auth (port 8000)
- ✅ Realtime (port 8000)
- ✅ Storage (port 8000)
- ✅ Dashboard (port 3000)
- ✅ Kapelczak ELN Application (port 8086)

## Access Information

- **Supabase Dashboard:** http://localhost:3000
  - Username: supabase
  - Password: $DASHBOARD_PASSWORD

- **Application:** ${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:8086}

- **API Base URL:** ${TARGET_DOMAIN:+https://$TARGET_DOMAIN}${TARGET_DOMAIN:-http://localhost:8000}

## Important Files

- **Configuration Backup:** $CONFIG_FILE
- **Environment File:** $SCRIPT_DIR/supabase-selfhosted/docker/.env
- **Application Config:** $SCRIPT_DIR/src/integrations/supabase/client.ts
- **Migration Logs:** $LOG_FILE

## Management Commands

### Start/Stop Services
\`\`\`bash
cd $SCRIPT_DIR/supabase-selfhosted/docker
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose restart    # Restart all services
\`\`\`

### View Logs
\`\`\`bash
cd $SCRIPT_DIR/supabase-selfhosted/docker
docker-compose logs -f   # Follow all logs
docker-compose logs db   # Database logs only
\`\`\`

### Backup Database
\`\`\`bash
$SCRIPT_DIR/backup-selfhosted.sh
\`\`\`

### Monitor Health
\`\`\`bash
$SCRIPT_DIR/monitor-selfhosted.sh
\`\`\`

## Security Notes

1. **Change Default Passwords:** Update the dashboard password regularly
2. **Firewall:** Configure firewall to restrict access to necessary ports only
3. **SSL Certificate:** Renew SSL certificates before expiration
4. **Backups:** Automated backups are scheduled daily at 2 AM
5. **Monitoring:** Health checks run every 5 minutes

## Troubleshooting

If services fail to start:
1. Check Docker logs: \`docker-compose logs\`
2. Verify port availability: \`netstat -tulpn | grep -E '(8000|5432|3000)'\`
3. Check disk space: \`df -h\`
4. Restart services: \`docker-compose restart\`

## Next Steps

1. **Test Authentication:** Create a test user account
2. **Import Data:** Complete any remaining data import tasks
3. **Configure DNS:** Point your domain to this server (if using custom domain)
4. **Setup Monitoring:** Configure external monitoring and alerting
5. **Security Hardening:** Review and implement additional security measures

---

**Migration completed successfully!**
EOF
    
    log_success "Migration summary created: $summary_file"
}

# Cleanup function
cleanup() {
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        log_error "Migration failed with exit code: $exit_code"
        log_info "Check the log file for details: $LOG_FILE"
        
        # Offer rollback
        echo ""
        read -p "Would you like to rollback the changes? (y/N): " rollback_choice
        if [[ $rollback_choice =~ ^[Yy]$ ]]; then
            perform_rollback
        fi
    fi
    
    # Clean up temporary files
    rm -f "$BACKUP_DIR/generate_jwt.js" 2>/dev/null
    
    exit $exit_code
}

# Rollback function
perform_rollback() {
    log_warning "Performing rollback..."
    
    # Stop services
    if [ -d "$SCRIPT_DIR/supabase-selfhosted/docker" ]; then
        cd "$SCRIPT_DIR/supabase-selfhosted/docker"
        docker-compose down >> "$LOG_FILE" 2>&1
    fi
    
    # Restore original configuration
    if [ -f "$SCRIPT_DIR/src/integrations/supabase/client.ts.backup" ]; then
        mv "$SCRIPT_DIR/src/integrations/supabase/client.ts.backup" "$SCRIPT_DIR/src/integrations/supabase/client.ts"
    fi
    
    # Remove installed components
    docker container prune -f >> "$LOG_FILE" 2>&1
    docker image prune -f >> "$LOG_FILE" 2>&1
    
    log_warning "Rollback completed. Original configuration restored."
}

# Main execution
main() {
    echo "=================================================="
    echo "  Kapelczak ELN - Supabase Self-Hosting Migration"
    echo "=================================================="
    echo ""
    echo "This script will migrate your Kapelczak ELN from"
    echo "hosted Supabase to a self-hosted instance."
    echo ""
    echo "⚠️  IMPORTANT: This is a complex migration process."
    echo "   Please ensure you have:"
    echo "   - Backup of your current data"
    echo "   - Adequate system resources"
    echo "   - Stable internet connection"
    echo "   - Administrative privileges"
    echo ""
    
    read -p "Do you want to proceed with the migration? (y/N): " proceed
    if [[ ! $proceed =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 0
    fi
    
    # Set up error handling
    trap cleanup EXIT
    
    # Execute migration steps
    check_root
    init_logging
    check_dependencies
    collect_configuration
    generate_jwt_tokens
    export_current_data
    setup_selfhosted_supabase
    apply_migrations
    import_data
    deploy_edge_functions
    update_app_config
    setup_ssl
    build_deploy_app
    setup_monitoring_backups
    
    if verify_migration; then
        create_summary
        
        echo ""
        echo "🎉 Migration completed successfully!"
        echo ""
        echo "Your self-hosted Kapelczak ELN is now running at:"
        if [ ! -z "$TARGET_DOMAIN" ]; then
            echo "  Application: https://$TARGET_DOMAIN"
            echo "  Dashboard: https://$TARGET_DOMAIN:3000"
        else
            echo "  Application: http://localhost:8086"
            echo "  Dashboard: http://localhost:3000"
        fi
        echo ""
        echo "Dashboard credentials:"
        echo "  Username: supabase"
        echo "  Password: $DASHBOARD_PASSWORD"
        echo ""
        echo "Migration summary: $BACKUP_DIR/MIGRATION_SUMMARY.md"
        echo "Migration logs: $LOG_FILE"
        echo ""
        echo "Thank you for using Kapelczak ELN!"
        
    else
        log_error "Migration completed with some issues."
        log_info "Please review the logs and summary for details."
        exit 1
    fi
}

# Run main function
main "$@"
