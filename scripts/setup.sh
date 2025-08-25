#!/bin/bash
# scripts/setup.sh - DevOps Pilot Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_header() {
    echo
    print_color $BLUE "=================================="
    print_color $BLUE "$1"
    print_color $BLUE "=================================="
    echo
}

print_success() {
    print_color $GREEN "✅ $1"
}

print_warning() {
    print_color $YELLOW "⚠️  $1"
}

print_error() {
    print_color $RED "❌ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker is installed"
        docker --version
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is installed"
        if command_exists docker-compose; then
            docker-compose --version
        else
            docker compose version
        fi
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if command_exists node; then
        print_success "Node.js is installed"
        node --version
    else
        print_warning "Node.js is not installed. It's recommended for local development."
    fi
    
    # Check Python
    if command_exists python3; then
        print_success "Python 3 is installed"
        python3 --version
    else
        print_warning "Python 3 is not installed. It's recommended for local development."
    fi
}

# Create project structure
create_project_structure() {
    print_header "Creating Project Structure"
    
    # Create main directories
    mkdir -p frontend/{src,public} backend/{app,tests} infrastructure/{docker,kubernetes,terraform,monitoring} database/{migrations,seeds} docs logs scripts
    
    # Create subdirectories
    mkdir -p frontend/src/{components,pages,hooks,services,types,utils,styles}
    mkdir -p frontend/src/components/{common,dashboard,monitoring,ai}
    mkdir -p backend/app/{core,api,models,services,utils}
    mkdir -p infrastructure/monitoring/{prometheus,grafana}
    mkdir -p infrastructure/kubernetes/{base,overlays}
    
    print_success "Project structure created"
}

# Setup environment files
setup_environment() {
    print_header "Setting Up Environment Files"
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/api/ws
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
EOF
        print_success "Frontend environment file created"
    else
        print_warning "Frontend environment file already exists"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
ENVIRONMENT=development
SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "change-this-secret-key-in-production")
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001

# Database
MONGODB_DATABASE=devops_pilot
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=100

# Monitoring
METRICS_COLLECTION_INTERVAL=30
ALERT_CHECK_INTERVAL=60
METRICS_RETENTION_DAYS=30

# Security
BCRYPT_ROUNDS=12
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Logging
LOG_LEVEL=INFO
EOF
        print_success "Backend environment file created"
    else
        print_warning "Backend environment file already exists"
    fi
    
    # Docker environment
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Project Configuration
PROJECT_NAME=devops-pilot
COMPOSE_PROJECT_NAME=devops-pilot

# Application Versions
FRONTEND_VERSION=latest
BACKEND_VERSION=latest

# Database Configuration
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=password123
REDIS_PASSWORD=

# Monitoring Configuration
GRAFANA_ADMIN_PASSWORD=admin123
PROMETHEUS_RETENTION_TIME=30d

# Security
JWT_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "change-this-secret-key-in-production")

# Network Configuration
NETWORK_SUBNET=172.20.0.0/16
EOF
        print_success "Docker environment file created"
    else
        print_warning "Docker environment file already exists"
    fi
}

# Initialize databases
init_databases() {
    print_header "Initializing Databases"
    
    # Create MongoDB init script
    if [ ! -f "database/init.js" ]; then
        cat > database/init.js << EOF
// MongoDB initialization script
db = db.getSiblingDB('devops_pilot');

// Create collections
db.createCollection('users');
db.createCollection('metrics');
db.createCollection('alerts');
db.createCollection('deployments');
db.createCollection('configurations');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.metrics.createIndex({ "timestamp": 1, "service": 1 });
db.alerts.createIndex({ "severity": 1, "timestamp": -1 });
db.deployments.createIndex({ "status": 1, "created_at": -1 });

// Insert sample data
db.users.insertOne({
    email: "admin@devopspilot.com",
    username: "admin",
    full_name: "System Administrator",
    hashed_password: "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    is_active: true,
    is_superuser: true,
    created_at: new Date(),
    roles: ["admin", "user"]
});

print("✅ DevOps Pilot database initialized successfully");
EOF
        print_success "MongoDB init script created"
    fi
    
    # Create Redis configuration
    if [ ! -f "infrastructure/redis.conf" ]; then
        cat > infrastructure/redis.conf << EOF
# Redis configuration for DevOps Pilot
port 6379
bind 0.0.0.0
timeout 0
tcp-keepalive 60
loglevel notice
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF
        print_success "Redis configuration created"
    fi
}

# Setup monitoring
setup_monitoring() {
    print_header "Setting Up Monitoring"
    
    # Prometheus configuration
    if [ ! -f "infrastructure/monitoring/prometheus.yml" ]; then
        cat > infrastructure/monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'devops-pilot-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
EOF
        print_success "Prometheus configuration created"
    fi
    
    # Create alert rules directory
    mkdir -p infrastructure/monitoring/rules
    
    # Basic alert rules
    if [ ! -f "infrastructure/monitoring/rules/basic.yml" ]; then
        cat > infrastructure/monitoring/rules/basic.yml << EOF
groups:
  - name: basic
    rules:
      - alert: HighCPUUsage
        expr: cpu_usage_percent > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 85% for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: memory_usage_percent > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% for more than 5 minutes"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ \$labels.instance }} service is down"
EOF
        print_success "Alert rules created"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Frontend dependencies
    if [ -f "frontend/package.json" ] && command_exists npm; then
        print_color $BLUE "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
    
    # Backend dependencies
    if [ -f "backend/requirements.txt" ] && command_exists pip3; then
        print_color $BLUE "Installing backend dependencies..."
        cd backend
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        print_success "Backend dependencies installed"
    fi
}

# Build and start services
start_services() {
    print_header "Starting Services"
    
    print_color $BLUE "Building and starting Docker services..."
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully"
    
    # Wait for services to be ready
    print_color $BLUE "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_color $BLUE "Checking service health..."
    
    services=(
        "http://localhost:3000:Frontend"
        "http://localhost:8000/health:Backend API"
        "http://localhost:9090:Prometheus"
        "http://localhost:3001:Grafana"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        if curl -f -s "$url" > /dev/null; then
            print_success "$name is healthy"
        else
            print_warning "$name might not be ready yet"
        fi
    done
}

# Show final information
show_info() {
    print_header "Setup Complete!"
    
    echo
    print_color $GREEN "🎉 DevOps Pilot has been set up successfully!"
    echo
    print_color $BLUE "Access your services at:"
    print_color $YELLOW "  • Frontend:     http://localhost:3000"
    print_color $YELLOW "  • Backend API:  http://localhost:8000"
    print_color $YELLOW "  • API Docs:     http://localhost:8000/api/docs"
    print_color $YELLOW "  • Prometheus:   http://localhost:9090"
    print_color $YELLOW "  • Grafana:      http://localhost:3001 (admin/admin123)"
    echo
    print_color $BLUE "Default Login:"
    print_color $YELLOW "  • Email:        admin@devopspilot.com"
    print_color $YELLOW "  • Password:     admin123"
    echo
    print_color $BLUE "Useful Commands:"
    print_color $YELLOW "  • View logs:    docker-compose logs -f [service_name]"
    print_color $YELLOW "  • Stop services: docker-compose down"
    print_color $YELLOW "  • Restart:      docker-compose restart"
    print_color $YELLOW "  • Update:       docker-compose pull && docker-compose up -d"
    echo
    print_color $GREEN "Happy monitoring! 🚀"
    echo
}

# Main execution
main() {
    print_color $BLUE "🚀 DevOps Pilot Setup Script"
    print_color $BLUE "=============================="
    echo
    
    check_requirements
    create_project_structure
    setup_environment
    init_databases
    setup_monitoring
    install_dependencies
    start_services
    show_info
}

# Error handling
trap 'print_error "Setup failed! Check the logs above for details."; exit 1' ERR

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
