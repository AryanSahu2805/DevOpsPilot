# app/api/alerts.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from loguru import logger
from ..core.security import get_current_user

router = APIRouter()

@router.get("/")
async def get_alerts(
    page: int = 1,
    limit: int = 20,
    severity: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get paginated alerts"""
    try:
        # Mock alerts data - in production, fetch from database
        mock_alerts = [
            {
                "id": "1",
                "title": "High CPU Usage",
                "description": "Production server CPU usage above 85%",
                "severity": "warning",
                "status": "active",
                "timestamp": "2024-01-15T10:30:00Z",
                "service": "production-server-1",
                "acknowledged": False
            },
            {
                "id": "2",
                "title": "Database Connection Timeout",
                "description": "Connection timeout to primary database",
                "severity": "error",
                "status": "active",
                "timestamp": "2024-01-15T09:15:00Z",
                "service": "database-primary",
                "acknowledged": False
            },
            {
                "id": "3",
                "title": "Disk Space Low",
                "description": "Storage usage above 80% on /var partition",
                "severity": "warning",
                "status": "resolved",
                "timestamp": "2024-01-15T08:45:00Z",
                "service": "storage-server",
                "acknowledged": True
            }
        ]
        
        # Filter by severity if specified
        if severity:
            mock_alerts = [alert for alert in mock_alerts if alert["severity"] == severity]
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit
        paginated_alerts = mock_alerts[start:end]
        
        return {
            "data": paginated_alerts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(mock_alerts),
                "total_pages": (len(mock_alerts) + limit - 1) // limit
            }
        }
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, current_user = Depends(get_current_user)):
    """Acknowledge an alert"""
    try:
        # Mock acknowledgment - in production, update database
        logger.info(f"Alert {alert_id} acknowledged by user {current_user['email']}")
        return {"message": f"Alert {alert_id} acknowledged successfully"}
    except Exception as e:
        logger.error(f"Error acknowledging alert: {e}")
        raise

@router.get("/rules")
async def get_alert_rules(current_user = Depends(get_current_user)):
    """Get alert rules configuration"""
    try:
        # Mock alert rules - in production, fetch from database
        return [
            {
                "id": "1",
                "name": "High CPU Usage",
                "condition": "cpu_usage > 85",
                "severity": "warning",
                "enabled": True
            },
            {
                "id": "2",
                "name": "High Memory Usage",
                "condition": "memory_usage > 90",
                "severity": "critical",
                "enabled": True
            },
            {
                "id": "3",
                "name": "Service Down",
                "condition": "service_status == 'down'",
                "severity": "critical",
                "enabled": True
            }
        ]
    except Exception as e:
        logger.error(f"Error fetching alert rules: {e}")
        raise

@router.post("/rules")
async def create_alert_rule(rule: dict, current_user = Depends(get_current_user)):
    """Create a new alert rule"""
    try:
        # Mock rule creation - in production, save to database
        logger.info(f"New alert rule created by user {current_user['email']}: {rule}")
        return {"message": "Alert rule created successfully", "rule": rule}
    except Exception as e:
        logger.error(f"Error creating alert rule: {e}")
        raise
