# DevOpsPilot Monitoring Stack

This directory contains the monitoring infrastructure for DevOpsPilot, including Prometheus, Grafana, and Node Exporter.

## Components

### Core Monitoring
- **Prometheus** (Port 9090): Metrics collection and storage
- **Grafana** (Port 3000): Metrics visualization and dashboards
- **Node Exporter** (Port 9100): System metrics collection

### Configuration Files
- `prometheus.yml`: Prometheus configuration with scrape targets
- `docker-compose.yml`: Container orchestration
- `start-monitoring.sh`: Startup script
- `grafana-dashboard.json`: Pre-configured Grafana dashboard

## Quick Start

1. **Start the monitoring stack:**
   ```bash
   ./start-monitoring.sh
   ```

2. **Access the services:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin123)
   - Node Exporter: http://localhost:9100

3. **Stop the monitoring stack:**
   ```bash
   cd infrastructure/monitoring
   docker-compose down
   ```

## Manual Setup

If you prefer to start services manually:

```bash
cd infrastructure/monitoring

# Create monitoring network
docker network create monitoring

# Start services
docker-compose up -d prometheus
docker-compose up -d grafana
docker-compose up -d node-exporter
```

## Grafana Setup

1. Access Grafana at http://localhost:3000
2. Login with admin/admin123
3. Add Prometheus as a data source:
   - URL: http://prometheus:9090
   - Access: Server (default)
4. Import the dashboard from `grafana-dashboard.json`

## Metrics Collected

- **System Metrics**: CPU, memory, disk, network
- **Application Metrics**: HTTP requests, response times, error rates
- **Infrastructure Metrics**: Container health, service status

## Troubleshooting

### Check service status:
```bash
docker-compose ps
```

### View logs:
```bash
docker-compose logs -f [service-name]
```

### Check network connectivity:
```bash
docker network ls
docker network inspect monitoring
```

### Reset volumes (if needed):
```bash
docker-compose down -v
docker volume prune
```

## Customization

### Add new metrics targets:
Edit `prometheus.yml` and add new scrape configurations.

### Modify Grafana dashboard:
Edit `grafana-dashboard.json` or create new dashboards through the Grafana UI.

### Add alerting rules:
Create new rule files in the `rules/` directory and reference them in `prometheus.yml`.

## Security Notes

- Default Grafana credentials are admin/admin123 - change these in production
- Prometheus and Node Exporter are exposed on all interfaces by default
- Consider using reverse proxy and authentication in production environments

## Production Considerations

- Use persistent volumes for data storage
- Implement proper authentication and authorization
- Set up alerting and notification systems
- Configure backup and retention policies
- Use HTTPS for all external access
- Implement rate limiting and access controls
