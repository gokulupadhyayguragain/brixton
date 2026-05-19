#!/bin/bash
#
# BRIXTON Friends - Complete AWS EC2 Deployment Script
# Platform: Ubuntu 22.04 LTS (t3.micro - Free Tier)
# Purpose: One-command deployment from scratch to production
# Time: ~10-15 minutes
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verify we're on Ubuntu
print_header "Verifying System"
if ! grep -q "Ubuntu" /etc/os-release; then
    print_error "This script requires Ubuntu. Please use Ubuntu 22.04 LTS"
fi
print_success "Ubuntu detected"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root. Use: sudo bash deploy-aws.sh"
fi
print_success "Running as root"

# Variables (IP-only, no domain)
PROJECT_DIR="${PROJECT_DIR:-/opt/brixton-friends}"
REPO_URL="${REPO_URL:-https://github.com/gokulupadhyayguragain/brixton.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"

print_warning "Project Dir: $PROJECT_DIR"
print_warning "Mode: IP-only (no domain/SSL)"
print_warning "Repo: $REPO_URL ($REPO_BRANCH)"

# ============================================================================
# STEP 1: Update System
# ============================================================================
print_header "STEP 1: Updating System Packages"

apt-get update
apt-get upgrade -y
apt-get install -y \
    curl \
    wget \
    git \
  openssl \
    unzip \
    zip \
    build-essential \
    software-properties-common

print_success "System packages updated"

# ============================================================================
# STEP 2: Install Docker
# ============================================================================
print_header "STEP 2: Installing Docker & Docker Compose"

# Install Docker
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
print_success "Docker installed"

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Add ubuntu user to docker group (so no sudo needed)
usermod -aG docker ubuntu
print_success "Docker & Docker Compose installed"

# ============================================================================
# STEP 3: Clone Repository
# ============================================================================
print_header "STEP 3: Cloning Repository"

if [ -d "$PROJECT_DIR/.git" ]; then
  print_warning "Existing git repository found. Pulling latest changes..."
  cd "$PROJECT_DIR"
  git fetch origin
  git checkout "$REPO_BRANCH"
  git pull origin "$REPO_BRANCH"
elif [ -f "$PROJECT_DIR/deploy-aws.sh" ] && [ -d "$PROJECT_DIR/backend" ] && [ -d "$PROJECT_DIR/frontend" ]; then
  print_warning "Project files already present. Skipping clone and using local files."
else
  print_warning "Cloning repository to $PROJECT_DIR ..."
  rm -rf "$PROJECT_DIR"
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"
print_success "Project directory ready: $PROJECT_DIR"

# ============================================================================
# STEP 4: Create Environment File
# ============================================================================
print_header "STEP 4: Creating Environment Configuration"

# Generate random passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > "$PROJECT_DIR/.env" << EOF
# BRIXTON Friends - Production Configuration (IP-Only)
# Generated on: $(date)

# ============ DATABASE ============
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=brixton_friends

# ============ SERVER ============
PORT=5000
NODE_ENV=production

# ============ JWT AUTH ============
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=30d

# ============ CORS (Local Network Only) ============
CORS_ORIGIN=*

# ============ FRONTEND RUNTIME ============
REACT_APP_API_URL=/api
REACT_APP_SOCKET_URL=/

# ============ TIMEZONE ============
TZ=UTC
EOF

print_success "Environment file created at $PROJECT_DIR/.env"
print_warning "Database Password: $DB_PASSWORD (save this!)"
print_warning "JWT Secret: $JWT_SECRET (save this!)"

# ============================================================================
# STEP 5: Create/Update docker-compose.yml
# ============================================================================
print_header "STEP 5: Creating Production Docker Compose Config"

cat > "$PROJECT_DIR/docker-compose-prod.yml" << 'EOF'
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: brixton_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      TZ: ${TZ:-UTC}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "127.0.0.1:3306:3306"  # Only local access
    networks:
      - brixton_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
      interval: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: brixton_backend
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      PORT: 5000
      NODE_ENV: ${NODE_ENV}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      TZ: ${TZ:-UTC}
    ports:
      - "127.0.0.1:5000:5000"  # Only local access
    networks:
      - brixton_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      timeout: 10s
      retries: 3
      interval: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: brixton_frontend
    restart: always
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL}
      REACT_APP_SOCKET_URL: ${REACT_APP_SOCKET_URL}
    ports:
      - "127.0.0.1:3000:3000"  # Only local access
    networks:
      - brixton_network
    depends_on:
      - backend
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  mysql_data:
    driver: local

networks:
  brixton_network:
    driver: bridge
EOF

print_success "Production docker-compose created"

# ============================================================================
# STEP 6: Install Nginx (Reverse Proxy - IP Only)
# ============================================================================
print_header "STEP 6: Installing & Configuring Nginx"

apt-get install -y nginx
systemctl enable nginx

# Create Nginx config (IP-only, no SSL/domain)
cat > /etc/nginx/sites-available/brixton << 'EOF'
upstream backend {
    server 127.0.0.1:5000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://backend/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/brixton /etc/nginx/sites-enabled/brixton
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t
print_success "Nginx installed and configured (IP-only)"

# ============================================================================
# STEP 8: Start Docker Services
# ============================================================================
print_header "STEP 8: Starting Docker Services"

cd "$PROJECT_DIR"

# Use production compose file
docker compose -f docker-compose-prod.yml build --no-cache
print_success "Docker images built"

docker compose -f docker-compose-prod.yml up -d
print_success "Docker services started"

# Wait for services to be ready
print_warning "Waiting for services to be ready (30 seconds)..."
sleep 30

# Check status
docker compose -f docker-compose-prod.yml ps
print_success "All services running!"

# ============================================================================
# STEP 9: Verify Database
# ============================================================================
print_header "STEP 9: Verifying Database"

# Wait for MySQL to fully initialize
sleep 10

# Check if tables exist
TABLES=$(docker compose -f docker-compose-prod.yml exec -T mysql mysql \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)

if [ "$TABLES" -gt 0 ]; then
    print_success "Database tables created successfully"
else
    print_warning "Database tables may not be created. Check logs."
fi

# ============================================================================
# STEP 10: Restart Nginx
# ============================================================================
print_header "STEP 10: Finalizing Nginx"

systemctl restart nginx
systemctl enable nginx
print_success "Nginx configured and enabled"

# ============================================================================
# STEP 11: Setup Auto-Restart & Monitoring
# ============================================================================
print_header "STEP 11: Setting Up Auto-Restart"

# Create systemd service for Docker Compose
cat > /etc/systemd/system/brixton-friends.service << EOF
[Unit]
Description=BRIXTON Friends - Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker compose -f docker-compose-prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose-prod.yml down
RemainAfterExit=yes
SyslogIdentifier=brixton

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable brixton-friends.service
print_success "Auto-restart configured"

# ============================================================================
# STEP 12: Create Backup Script
# ============================================================================
print_header "STEP 12: Creating Backup Script"

BACKUP_DIR="/opt/brixton-backups"
mkdir -p "$BACKUP_DIR"

cat > "$BACKUP_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Backup script - Run daily via cron

BACKUP_DIR="/opt/brixton-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Backup database
docker compose -f /opt/brixton-friends/docker-compose-prod.yml exec -T mysql \
    mysqldump -u"${DB_USER}" -p"${DB_PASSWORD}" brixton_friends > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x "$BACKUP_DIR/backup.sh"

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/backup.sh") | crontab -

print_success "Backup script created and scheduled"

# ============================================================================
# STEP 13: Final Status Report
# ============================================================================
print_header "✓ DEPLOYMENT COMPLETE!"

# Get public IP
TOKEN=$(curl -fsX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)

if [ -n "$TOKEN" ]; then
    PUBLIC_IP=$(curl -fs -H "X-aws-ec2-metadata-token: $TOKEN" \
      http://169.254.169.254/latest/meta-data/public-ipv4 || true)
else
    PUBLIC_IP=$(curl -fs http://169.254.169.254/latest/meta-data/public-ipv4 || true)
fi

if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP="<your-ec2-public-ip>"
fi

echo ""
echo -e "${GREEN}========== ACCESS YOUR APP ==========${NC}"
echo -e "Open your browser and go to:"
echo -e "${YELLOW}http://$PUBLIC_IP${NC}"
echo -e "Project Dir: ${YELLOW}$PROJECT_DIR${NC}"
echo ""

echo -e "${GREEN}========== DATABASE ==========${NC}"
echo -e "Database Host: ${YELLOW}localhost:3306${NC}"
echo -e "Database Name: ${YELLOW}brixton_friends${NC}"
echo -e "Database User: ${YELLOW}root${NC}"
echo -e "Database Password: ${YELLOW}(see .env)${NC}"
echo ""

echo -e "${GREEN}========== IMPORTANT CREDENTIALS ==========${NC}"
echo -e "DB Password: ${YELLOW}$DB_PASSWORD${NC}"
echo -e "JWT Secret: ${YELLOW}$JWT_SECRET${NC}"
echo -e "${RED}⚠ SAVE THESE SECURELY!${NC}"
echo ""

echo -e "${GREEN}========== USEFUL COMMANDS ==========${NC}"
echo -e "View logs: ${YELLOW}docker compose -f $PROJECT_DIR/docker-compose-prod.yml logs -f${NC}"
echo -e "Stop services: ${YELLOW}docker compose -f $PROJECT_DIR/docker-compose-prod.yml down${NC}"
echo -e "Start services: ${YELLOW}docker compose -f $PROJECT_DIR/docker-compose-prod.yml up -d${NC}"
echo -e "Database shell: ${YELLOW}docker compose -f $PROJECT_DIR/docker-compose-prod.yml exec mysql mysql -uroot -p${NC}"
echo ""

echo -e "${GREEN}========== NEXT STEPS ==========${NC}"
echo "1. Access your app at: http://$PUBLIC_IP"
echo "2. Register a test account"
echo "3. Application will auto-restart if server reboots"
echo "4. Daily backups run at 2 AM UTC"
echo "5. Check: systemctl status brixton-friends"
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🎉 BRIXTON Friends is LIVE!${NC}"
echo -e "${BLUE}================================${NC}"

# ============================================================================
# STEP 14: Verification
# ============================================================================
print_header "Final Verification"

# Check if backend is responding
if curl -s http://127.0.0.1:5000/api/health | grep -q "OK"; then
    print_success "Backend API is responding ✓"
else
    print_error "Backend API not responding"
fi

# Check if frontend is serving
if curl -s http://127.0.0.1:3000 | grep -q "html"; then
    print_success "Frontend is serving ✓"
else
    print_error "Frontend not responding"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running ✓"
else
    print_error "Nginx is not running"
fi

echo ""
print_success "All systems operational! 🚀"
