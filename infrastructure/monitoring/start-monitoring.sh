#!/bin/bash

# DevOpsPilot Monitoring Stack Startup Script

set -e

echo "🚀 Starting DevOpsPilot Monitoring Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create monitoring network if it doesn't exist
if ! docker network ls | grep -q "monitoring"; then
    echo "📡 Creating monitoring network..."
    docker network create monitoring
fi

# Start monitoring services
echo "📊 Starting Prometheus..."
docker-compose up -d prometheus

echo "📈 Starting Grafana..."
docker-compose up -d grafana

echo "🖥️  Starting Node Exporter..."
docker-compose up -d node-exporter

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

services=("prometheus:9090" "grafana:3000" "node-exporter:9100")
for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ $name is running on port $port"
    else
        echo "❌ $name is not responding on port $port"
    fi
done

echo ""
echo "🎉 Monitoring stack started successfully!"
echo ""
echo "📊 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3000 (admin/admin123)"
echo ""
echo "🔧 To stop the monitoring stack:"
echo "   docker-compose down"
echo ""
echo "📋 To view logs:"
echo "   docker-compose logs -f [service-name]"
