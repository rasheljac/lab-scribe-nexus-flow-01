
# Comprehensive Supabase Self-Hosting Guide for Kapelczak ELN

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [System Requirements](#system-requirements)
4. [Self-Hosted Supabase Installation](#self-hosted-supabase-installation)
5. [Database Migration](#database-migration)
6. [Application Configuration](#application-configuration)
7. [Service Configuration](#service-configuration)
8. [Security Setup](#security-setup)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Data Migration from Hosted to Self-Hosted](#data-migration)
12. [Production Considerations](#production-considerations)

---

## Introduction

This guide provides comprehensive instructions for migrating the Kapelczak Electronic Laboratory Notebook (ELN) from the hosted Supabase cloud service to a self-hosted Supabase instance. Self-hosting provides greater control over your data, infrastructure, and compliance requirements.

**Important Note**: This migration involves significant infrastructure changes and should be thoroughly tested in a staging environment before implementing in production.

---

## Prerequisites

### Required Knowledge
- Docker and Docker Compose
- PostgreSQL database administration
- Linux system administration
- Basic networking concepts
- SSL/TLS certificate management

### Required Software
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git
- OpenSSL
- A text editor (vim, nano, etc.)

### Required Access
- Root or sudo access to the target server
- Domain name (for SSL setup)
- Access to current Supabase project data

---

## System Requirements

### Minimum Hardware Requirements
- **CPU**: 4 cores (8 cores recommended)
- **RAM**: 8GB (16GB recommended for production)
- **Storage**: 100GB SSD (adjust based on data requirements)
- **Network**: Stable internet connection with adequate bandwidth

### Recommended Hardware for Production
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 500GB+ NVMe SSD with backup storage
- **Network**: Redundant network connections

### Operating System
- Ubuntu 20.04 LTS or later (recommended)
- CentOS 8+ / RHEL 8+
- Debian 11+

---

## Self-Hosted Supabase Installation

### Step 1: Server Preparation

1. **Update the system:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Install Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

4. **Logout and login again** to apply Docker group changes.

### Step 2: Download Supabase

1. **Clone the official Supabase repository:**
```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

2. **Copy the example environment file:**
```bash
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit the `.env` file with your specific configuration:

```bash
############
# SECRETS
############

# JWT Secret (generate a secure 32+ character string)
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# Anonymous Key (generate using Supabase CLI or online JWT generator)
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (generate using Supabase CLI or online JWT generator)
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

############
# DATABASE
############

POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
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
SITE_URL=http://localhost:3000
ADDITIONAL_REDIRECT_URLS=
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
API_EXTERNAL_URL=http://localhost:8000

## Mailer Config
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
MAILER_URLPATHS_INVITE="/auth/v1/verify"
MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"

## Email auth
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
SMTP_ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_SENDER_NAME=Kapelczak ELN

############
# DASHBOARD
############

DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=this_password_is_insecure_and_should_be_updated

############
# STORAGE
############

STORAGE_BACKEND=file
GLOBAL_S3_BUCKET=storage
```

### Step 4: Generate JWT Tokens

You need to generate the ANON_KEY and SERVICE_ROLE_KEY. Use the following payload structure:

**For ANON_KEY:**
```json
{
  "iss": "supabase",
  "ref": "localhost",
  "role": "anon",
  "iat": 1625247600,
  "exp": 1940963200
}
```

**For SERVICE_ROLE_KEY:**
```json
{
  "iss": "supabase",
  "ref": "localhost", 
  "role": "service_role",
  "iat": 1625247600,
  "exp": 1940963200
}
```

Generate these at [jwt.io](https://jwt.io) using your JWT_SECRET.

### Step 5: Start Supabase Services

```bash
docker-compose up -d
```

Verify all services are running:
```bash
docker-compose ps
```

You should see services for:
- db (PostgreSQL)
- auth (GoTrue)
- rest (PostgREST)
- realtime
- storage
- kong (API Gateway)
- dashboard

---

## Database Migration

### Step 1: Access Your Current Database Schema

First, export your current database schema and data from the hosted Supabase instance.

1. **Connect to your hosted Supabase database:**
```bash
# Using psql (get connection details from Supabase dashboard)
pg_dump -h your-project.supabase.co -U postgres -d postgres --schema-only > schema.sql
pg_dump -h your-project.supabase.co -U postgres -d postgres --data-only > data.sql
```

### Step 2: Apply Existing Migrations

The Kapelczak ELN project includes several migrations. Apply them to your self-hosted instance:

1. **Connect to your self-hosted database:**
```bash
docker exec -it supabase-db psql -U postgres -d postgres
```

2. **Apply the migrations in order:**

```sql
-- Migration: Add URL field to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN url text;

-- Migration: Update experiment_note_attachments table
ALTER TABLE public.experiment_note_attachments 
DROP COLUMN IF EXISTS file_path,
ADD COLUMN file_content TEXT NOT NULL DEFAULT '';

-- Migration: Add order columns and indexes
ALTER TABLE public.experiments 
ADD COLUMN display_order INTEGER DEFAULT 0;

ALTER TABLE public.projects 
ADD COLUMN display_order INTEGER DEFAULT 0;

CREATE INDEX idx_experiments_user_order ON public.experiments(user_id, display_order);
CREATE INDEX idx_projects_user_order ON public.projects(user_id, display_order);

-- Update existing records with sequential order
WITH numbered_experiments AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.experiments
  WHERE display_order = 0
)
UPDATE public.experiments 
SET display_order = numbered_experiments.rn
FROM numbered_experiments
WHERE public.experiments.id = numbered_experiments.id;

WITH numbered_projects AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.projects
  WHERE display_order = 0
)
UPDATE public.projects 
SET display_order = numbered_projects.rn
FROM numbered_projects
WHERE public.projects.id = numbered_projects.id;

-- Migration: Add order to experiment_ideas
ALTER TABLE public.experiment_ideas 
ADD COLUMN display_order INTEGER DEFAULT 0;

CREATE INDEX idx_experiment_ideas_user_order ON public.experiment_ideas(user_id, display_order);

WITH numbered_ideas AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.experiment_ideas
  WHERE display_order = 0
)
UPDATE public.experiment_ideas 
SET display_order = numbered_ideas.rn
FROM numbered_ideas
WHERE public.experiment_ideas.id = numbered_ideas.id;

-- Migration: Add order to protocols
ALTER TABLE public.protocols 
ADD COLUMN display_order INTEGER DEFAULT 0;

CREATE INDEX idx_protocols_user_order ON public.protocols(user_id, display_order);

WITH numbered_protocols AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.protocols
  WHERE display_order = 0
)
UPDATE public.protocols 
SET display_order = numbered_protocols.rn
FROM numbered_protocols
WHERE public.protocols.id = numbered_protocols.id;
```

### Step 3: Set Up Row Level Security (RLS) Policies

Apply the necessary RLS policies for the Kapelczak ELN:

```sql
-- Enable RLS on all tables
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your security requirements)
CREATE POLICY "Users can view their own experiments" ON public.experiments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments" ON public.experiments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments" ON public.experiments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments" ON public.experiments
    FOR DELETE USING (auth.uid() = user_id);

-- Repeat similar policies for other tables
-- (projects, protocols, experiment_ideas, inventory_items, etc.)
```

---

## Application Configuration

### Step 1: Update Supabase Client Configuration

Update the `src/integrations/supabase/client.ts` file in your Kapelczak ELN application:

```typescript
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Update these URLs to point to your self-hosted instance
const SUPABASE_URL = "http://your-server-ip:8000";  // or https://your-domain.com
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key-generated-earlier";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### Step 2: Update CORS Settings

Configure CORS in your self-hosted Supabase to allow your application domain:

1. **Edit the Kong configuration** (in your Supabase Docker setup):

Create a custom Kong configuration file:

```yaml
# kong.yml
_format_version: "2.1"
_transform: true

services:
  - name: auth-v1-open
    url: http://auth:9999/verify
    routes:
      - name: auth-v1-open
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors
        config:
          origins:
            - http://localhost:3000
            - https://your-domain.com  # Add your production domain
          methods:
            - GET
            - POST
            - PUT
            - PATCH
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Accept-Version
            - Content-Length
            - Content-MD5
            - Content-Type
            - Date
            - X-Auth-Token
            - Authorization
            - X-Client-Info
          exposed_headers:
            - X-Auth-Token
          credentials: true
          max_age: 3600
```

### Step 3: Environment Configuration

Create a production environment configuration:

```bash
# .env.production
REACT_APP_SUPABASE_URL=https://your-domain.com
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

---

## Service Configuration

### Step 1: Authentication Service Configuration

Configure the authentication service for your domain:

1. **Update the `.env` file** with your domain settings:

```bash
# Auth Configuration
SITE_URL=https://your-domain.com
ADDITIONAL_REDIRECT_URLS=https://your-domain.com/auth/callback
API_EXTERNAL_URL=https://your-domain.com
```

2. **Configure email templates** (optional):

Create custom email templates in the `volumes/auth/templates/` directory.

### Step 2: Storage Service Setup

Configure file storage for the application:

1. **Create storage buckets:**

Connect to your Supabase dashboard (http://your-server:3000) and create the necessary storage buckets:

- `experiment-attachments`
- `protocol-attachments` 
- `avatars`
- `exports`

2. **Set bucket policies:**

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to view files  
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT TO authenticated USING (true);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 3: Edge Functions Deployment

If your application uses Edge Functions, deploy them to your self-hosted instance:

1. **Install Supabase CLI:**
```bash
npm install -g supabase
```

2. **Link to your self-hosted project:**
```bash
supabase link --project-ref localhost
```

3. **Deploy functions:**
```bash
supabase functions deploy send-task-reminders
supabase functions deploy send-calendar-reminders
supabase functions deploy s3-file-operations
```

---

## Security Setup

### Step 1: SSL/TLS Configuration

Set up SSL certificates for production use:

1. **Install Certbot:**
```bash
sudo apt install certbot
```

2. **Generate SSL certificates:**
```bash
sudo certbot certonly --standalone -d your-domain.com
```

3. **Configure nginx proxy** (create `nginx.conf`):

```nginx
events {
    worker_connections 1024;
}

http {
    upstream supabase {
        server localhost:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://supabase;
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
}
```

4. **Run nginx in Docker:**
```bash
docker run -d \
  --name nginx-proxy \
  -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

### Step 2: Database Security

1. **Change default passwords:**
```bash
# Update all default passwords in .env file
POSTGRES_PASSWORD=your-very-secure-database-password
DASHBOARD_PASSWORD=your-secure-dashboard-password
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
```

2. **Configure database access:**
```sql
-- Restrict database access
ALTER USER postgres PASSWORD 'your-very-secure-database-password';

-- Create application-specific user
CREATE USER kapelczak_app WITH PASSWORD 'secure-app-password';
GRANT CONNECT ON DATABASE postgres TO kapelczak_app;
GRANT USAGE ON SCHEMA public TO kapelczak_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kapelczak_app;
```

### Step 3: Firewall Configuration

Configure UFW (Ubuntu Firewall):

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Supabase services (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 8000
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status
```

---

## Monitoring and Maintenance

### Step 1: Health Monitoring

Create a monitoring script:

```bash
#!/bin/bash
# supabase-monitor.sh

LOG_FILE="/var/log/supabase-monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if all services are running
if ! docker-compose ps | grep -q "Up"; then
    log_message "ERROR: Some Supabase services are down"
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
```

Make it executable and add to crontab:
```bash
chmod +x supabase-monitor.sh
(crontab -l; echo "*/5 * * * * /path/to/supabase-monitor.sh") | crontab -
```

### Step 2: Backup Strategy

Create automated backup script:

```bash
#!/bin/bash
# supabase-backup.sh

BACKUP_DIR="/var/backups/supabase"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/postgres_$DATE.sql"
VOLUME_BACKUP_FILE="$BACKUP_DIR/volumes_$DATE.tar.gz"

# Create backup directory
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
```

Schedule daily backups:
```bash
(crontab -l; echo "0 2 * * * /path/to/supabase-backup.sh") | crontab -
```

### Step 3: Log Management

Configure log rotation:

```bash
# /etc/logrotate.d/supabase
/var/log/supabase-monitor.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 root root
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Services Won't Start

**Problem**: Docker containers fail to start

**Solution**:
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d

# Check system resources
df -h
free -h
```

#### Issue 2: Database Connection Errors

**Problem**: Application can't connect to database

**Solution**:
```bash
# Check database status
docker exec supabase-db pg_isready -U postgres

# Check connection parameters
docker exec -it supabase-db psql -U postgres -d postgres

# Verify environment variables
grep -E "(POSTGRES|DB)" .env
```

#### Issue 3: Authentication Issues

**Problem**: Users can't log in or sign up

**Solution**:
```bash
# Check auth service logs
docker-compose logs auth

# Verify JWT configuration
echo $JWT_SECRET | wc -c  # Should be 32+ characters

# Test auth endpoint
curl -X POST http://localhost:8000/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Issue 4: Storage Issues

**Problem**: File uploads fail

**Solution**:
```bash
# Check storage service
docker-compose logs storage

# Verify storage directory permissions
ls -la volumes/storage/

# Check available disk space
df -h
```

#### Issue 5: Performance Issues

**Problem**: Slow response times

**Solutions**:
- **Database optimization:**
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM experiments WHERE user_id = 'uuid';

-- Add missing indexes
CREATE INDEX idx_experiments_user_created ON experiments(user_id, created_at);
```

- **Resource allocation:**
```yaml
# docker-compose.yml - Add resource limits
services:
  db:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
```

### Debug Commands

Useful commands for troubleshooting:

```bash
# View all container logs
docker-compose logs -f

# Check specific service
docker-compose logs auth
docker-compose logs db
docker-compose logs rest

# Monitor resource usage
docker stats

# Access database directly
docker exec -it supabase-db psql -U postgres

# Check network connectivity
docker network ls
docker network inspect supabase_default
```

---

## Data Migration from Hosted to Self-Hosted

### Step 1: Export Data from Hosted Supabase

1. **Export database schema and data:**
```bash
# Get connection details from Supabase dashboard > Settings > Database
pg_dump -h db.your-project-ref.supabase.co \
        -U postgres \
        -d postgres \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > complete_backup.sql
```

2. **Export authentication users:**

Since user data is managed by Supabase Auth, you'll need to export user data through the dashboard or API:

```bash
# Using Supabase CLI
supabase db dump --db-url "postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres"
```

3. **Export storage files:**

Download all storage bucket contents through the Supabase dashboard or use the API.

### Step 2: Import Data to Self-Hosted Instance

1. **Import database:**
```bash
# Import to self-hosted instance
docker exec -i supabase-db psql -U postgres -d postgres < complete_backup.sql
```

2. **Import users:**

Users will need to re-register, or you can use the Supabase CLI to migrate auth data:

```bash
# This requires admin access and should be done carefully
supabase db reset --db-url "postgresql://postgres:password@localhost:5432/postgres"
```

3. **Import storage files:**

Upload files to the appropriate storage buckets in your self-hosted instance.

### Step 3: Verification

1. **Verify data integrity:**
```sql
-- Count records in major tables
SELECT 'experiments' as table_name, COUNT(*) as count FROM experiments
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'protocols', COUNT(*) FROM protocols;
```

2. **Test application functionality:**
- User registration/login
- Data creation and retrieval
- File uploads and downloads
- All major features

---

## Production Considerations

### High Availability Setup

For production environments, consider:

1. **Database clustering:**
   - Set up PostgreSQL streaming replication
   - Use connection pooling (PgBouncer)
   - Implement automated failover

2. **Load balancing:**
   - Use nginx or HAProxy for load balancing
   - Set up multiple application instances
   - Implement health checks

3. **Monitoring:**
   - Use Prometheus + Grafana for metrics
   - Set up alerting for critical issues
   - Monitor database performance

### Backup and Disaster Recovery

1. **Automated backups:**
   - Database backups every 6 hours
   - File storage backups daily
   - Test restore procedures regularly

2. **Disaster recovery plan:**
   - Document recovery procedures
   - Test failover scenarios
   - Maintain offsite backups

### Security Hardening

1. **Network security:**
   - Use VPN for administrative access
   - Implement IP whitelisting
   - Regular security updates

2. **Application security:**
   - Regular security audits
   - Dependency vulnerability scanning
   - Penetration testing

### Maintenance Windows

Schedule regular maintenance:
- Weekly security updates
- Monthly full system backups
- Quarterly disaster recovery tests
- Annual security audits

---

## Conclusion

This guide provides a comprehensive approach to migrating from hosted Supabase to a self-hosted instance for the Kapelczak ELN application. While self-hosting requires more operational overhead, it provides greater control over your data and infrastructure.

### Key Takeaways:

1. **Planning is crucial** - Test thoroughly in a staging environment
2. **Security first** - Implement proper security measures from the start
3. **Monitor everything** - Set up comprehensive monitoring and alerting
4. **Backup regularly** - Implement and test backup/recovery procedures
5. **Document processes** - Maintain documentation for troubleshooting and maintenance

### Next Steps:

1. Set up a staging environment following this guide
2. Test the migration process with sample data
3. Plan your production migration timeline
4. Prepare rollback procedures
5. Train your team on the new infrastructure

For additional support or questions about specific aspects of the migration, refer to the official Supabase documentation or consider consulting with a DevOps specialist familiar with Supabase deployments.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-02  
**Compatibility**: Supabase v2.x, Kapelczak ELN v1.x  

---

*This guide is provided as-is. Always test thoroughly in a non-production environment before implementing changes in production.*
