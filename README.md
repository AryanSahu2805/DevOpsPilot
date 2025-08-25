# DevOps Pilot 🚀

A **cloud-native monitoring and automation platform** that integrates DevOps workflows with AI-powered intelligent system insights. Built for modern infrastructure teams who need comprehensive observability with predictive analytics.

![DevOps Pilot Dashboard](https://via.placeholder.com/800x400/1a1d23/10b981?text=DevOps+Pilot+Dashboard)

## ✨ Features

### 🎯 Core Monitoring
- **Real-time System Metrics** - CPU, Memory, Disk, Network monitoring
- **Application Performance** - Response times, error rates, throughput
- **Infrastructure Health** - Container, Kubernetes, cloud resource monitoring
- **Database Performance** - Connection pools, query performance, replication status

### 🤖 AI-Powered Insights
- **Anomaly Detection** - ML-powered unusual pattern detection
- **Predictive Scaling** - Forecast resource needs 15-30 minutes ahead
- **Root Cause Analysis** - Intelligent correlation of system events
- **Cost Optimization** - AI recommendations for resource optimization

### 🚨 Intelligent Alerting
- **Smart Alert Routing** - Context-aware notification delivery
- **False Positive Reduction** - ML-enhanced alert filtering
- **Escalation Management** - Automated escalation workflows
- **Multi-channel Notifications** - Slack, email, PagerDuty, webhooks

### 🚀 Deployment Integration
- **CI/CD Pipeline Monitoring** - Track deployment health and performance
- **Automated Rollbacks** - Intelligent failure detection and rollback
- **Environment Management** - Dev, staging, production workflow tracking
- **Kubernetes Native** - Built for cloud-native deployments

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: FastAPI + Python 3.11 + MongoDB + Redis
- **Monitoring**: Prometheus + Grafana + Node Exporter
- **AI/ML**: Scikit-learn + XGBoost + Time Series Analysis
- **Infrastructure**: Docker + Kubernetes + Terraform
- **Message Queue**: Redis + Celery for background tasks

### Design Philosophy
- **Cloud-Native**: Kubernetes-first architecture with horizontal scaling
- **API-First**: Everything accessible via REST API with OpenAPI documentation
- **Real-Time**: WebSocket connections for live dashboard updates
- **Secure**: JWT authentication with role-based access control
- **Extensible**: Plugin architecture for custom integrations

## 🚀 Quick Start

### Prerequisites
- Docker 20.0+ and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- 4GB+ RAM recommended

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/devops-pilot.git
cd devops-pilot

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup
```bash
# 1. Start infrastructure services
docker-compose up -d mongodb redis prometheus grafana

# 2. Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Start development servers
cd ../backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
cd ../frontend && npm run dev &
```

### Recent Updates (Latest Release)
- ✅ **Frontend TypeScript Errors Fixed**: All 77 TypeScript errors resolved
- ✅ **Hardcoded Data Removed**: Components now use real-time API data
- ✅ **Build System Fixed**: Frontend builds successfully with Vite
- ✅ **Component Architecture**: AI components properly typed and structured
- ✅ **Real-time Data Integration**: WebSocket connections for live updates
- ✅ **Security Vulnerabilities**: Updated dependencies to latest secure versions

### Access Your Services
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

### Current Development Status
- **Frontend**: ✅ Ready for development and testing
- **Backend**: ✅ Ready for development and testing  
- **AI Engine**: ✅ Ready for development and testing
- **Infrastructure**: ✅ Complete with Terraform and Kubernetes
- **CI/CD**: ✅ Complete GitHub Actions workflow
- **Monitoring**: ✅ Complete Prometheus + Grafana stack

### Default Login
- **Email**: admin@devopspilot.com
- **Password**: admin123

## 📊 Dashboard Overview

### Main Dashboard
The main dashboard provides a comprehensive view of your infrastructure:

- **System Health Score** - Overall infrastructure health percentage
- **Active Services** - Count of monitored services and their status
- **Active Alerts** - Current alerts requiring attention
- **Recent Deployments** - Latest deployment pipeline activities

### Real-Time Metrics
- **Interactive Charts** - CPU, Memory, Network, and Disk usage over time
- **Service Health Matrix** - Visual representation of all monitored services
- **Performance Trends** - Historical data with predictive analytics
- **Resource Utilization** - Detailed breakdown of resource consumption

### AI Insights Panel
- **Performance Predictions** - ML forecasts for system load and scaling needs
- **Anomaly Detection** - Unusual patterns detected in real-time
- **Cost Optimization** - Recommendations for infrastructure cost savings
- **Root Cause Analysis** - Intelligent correlation of system events

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key
DEBUG=false

# Database
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
METRICS_COLLECTION_INTERVAL=30
ALERT_CHECK_INTERVAL=60

# AI/ML
AI_PREDICTION_INTERVAL=300
ANOMALY_DETECTION_THRESHOLD=0.8

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/api/ws
REACT_APP_ENVIRONMENT=production
```

### Monitoring Configuration
Configure Prometheus targets in `infrastructure/monitoring/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-application'
    static_configs:
      - targets: ['your-app:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

## 🔌 API Documentation

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@devopspilot.com", "password": "admin123"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/metrics/dashboard
```

### Key Endpoints
- `GET /api/dashboard` - Dashboard overview data
- `GET /api/metrics/system` - System metrics
- `GET /api/alerts` - Alert management
- `GET /api/deployments` - Deployment tracking
- `GET /api/ai/insights` - AI-powered insights

Full API documentation available at: http://localhost:8000/api/docs

## 🚀 Deployment

### Production Deployment
```bash
# 1. Configure production environment
cp .env.example .env
# Edit .env with production values

# 2. Build production images
docker-compose -f docker-compose.prod.yml build

# 3. Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d

# 4. Run database migrations
docker-compose exec backend python -m app.db.migrate
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n devops-pilot
kubectl get services -n devops-pilot
```

### Terraform Infrastructure
```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init

# Plan and apply infrastructure
terraform plan -out=tfplan
terraform apply tfplan
```

## 📈 Monitoring & Observability

### Built-in Metrics
DevOps Pilot automatically collects and monitors:
- **System Resources**: CPU, Memory, Disk, Network
- **Application Metrics**: Request rate, response time, error rate
- **Database Performance**: Connection pools, query performance
- **Container Metrics**: Docker and Kubernetes container health

### Custom Metrics
Add your own metrics using Prometheus client libraries:

```python
from prometheus_client import Counter, Histogram, Gauge

# Custom counters
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests')
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
ACTIVE_USERS = Gauge('active_users', 'Number of active users')
```

### Grafana Dashboards
Pre-built dashboards for:
- **System Overview** - Infrastructure health and performance
- **Application Performance** - Service-specific metrics
- **Business Metrics** - Custom KPIs and business logic
- **SLA Monitoring** - Service level agreement tracking

## 🤖 AI & Machine Learning

### Anomaly Detection
The system uses multiple ML algorithms for anomaly detection:
- **Isolation Forest** - Detects outliers in high-dimensional data
- **LSTM Networks** - Time series anomaly detection
- **Statistical Methods** - Z-score and moving averages

### Predictive Analytics
- **Resource Forecasting** - Predict CPU, memory, and storage needs
- **Capacity Planning** - Long-term infrastructure planning
- **Cost Prediction** - Forecast cloud infrastructure costs
- **Performance Optimization** - Identify optimization opportunities

### Model Training
```bash
# Train anomaly detection models
cd ai-engine
python training/train_anomaly_model.py --data-path /path/to/metrics

# Update prediction models
python training/train_prediction_model.py --retrain
```

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens** - Secure API authentication
- **Role-Based Access** - Fine-grained permission control
- **Multi-Factor Authentication** - Optional 2FA support
- **Session Management** - Secure session handling

### Network Security
- **HTTPS/TLS** - Encrypted communication
- **API Rate Limiting** - Prevent abuse and DDoS
- **CORS Configuration** - Cross-origin resource sharing
- **Security Headers** - OWASP recommended headers

### Data Protection
- **Encryption at Rest** - Database encryption
- **Audit Logging** - Complete audit trail
- **Data Retention** - Configurable data retention policies
- **GDPR Compliance** - Privacy-first design

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Testing
```bash
# End-to-end testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm test` and `pytest`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- **Python**: Black formatter, isort, mypy type checking
- **TypeScript**: ESLint, Prettier
- **Git**: Conventional Commits specification

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

### Documentation
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Community
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - General questions and community support
- **Discord** - Real-time chat with the community
- **Email** - security@devopspilot.com for security issues

### Commercial Support
Professional support, training, and consulting available. Contact us at enterprise@devopspilot.com

---

**Built with ❤️ for the DevOps community**

Made by developers, for developers. DevOps Pilot aims to make infrastructure monitoring and management accessible, intelligent, and enjoyable.
