# app/services/alert_engine.py
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from loguru import logger
from ..core.config import get_settings

settings = get_settings()

class AlertEngine:
    def __init__(self):
        self.is_running = False
        self.check_interval = settings.ALERT_CHECK_INTERVAL
        self.active_alerts = []
        self.alert_rules = []
        self.alert_history = []

    async def start_monitoring(self):
        """Start monitoring for alerts"""
        self.is_running = True
        logger.info("🚨 Starting alert monitoring...")
        
        # Load default alert rules
        await self.load_default_rules()
        
        while self.is_running:
            try:
                await self.check_alerts()
                await asyncio.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Error in alert monitoring: {e}")
                await asyncio.sleep(60)  # Wait longer on error

    async def stop_monitoring(self):
        """Stop monitoring for alerts"""
        self.is_running = False
        logger.info("🛑 Stopped alert monitoring")

    async def load_default_rules(self):
        """Load default alert rules"""
        self.alert_rules = [
            {
                "id": "1",
                "name": "High CPU Usage",
                "condition": "cpu_usage > 85",
                "severity": "warning",
                "enabled": True,
                "description": "CPU usage above 85%"
            },
            {
                "id": "2",
                "name": "High Memory Usage",
                "condition": "memory_usage > 90",
                "severity": "critical",
                "enabled": True,
                "description": "Memory usage above 90%"
            },
            {
                "id": "3",
                "name": "High Disk Usage",
                "condition": "disk_usage > 80",
                "severity": "warning",
                "enabled": True,
                "description": "Disk usage above 80%"
            },
            {
                "id": "4",
                "name": "Service Down",
                "condition": "service_status == 'down'",
                "severity": "critical",
                "enabled": True,
                "description": "Service is down"
            }
        ]
        logger.info(f"Loaded {len(self.alert_rules)} default alert rules")

    async def check_alerts(self):
        """Check for new alerts based on current metrics"""
        try:
            # Mock metrics check - in production, this would check actual metrics
            mock_metrics = {
                "cpu_usage": 65,
                "memory_usage": 78,
                "disk_usage": 45,
                "service_status": "up"
            }
            
            for rule in self.alert_rules:
                if not rule["enabled"]:
                    continue
                
                # Simple rule evaluation - in production, use a proper rule engine
                if await self.evaluate_rule(rule, mock_metrics):
                    await self.create_alert(rule, mock_metrics)
                    
        except Exception as e:
            logger.error(f"Error checking alerts: {e}")

    async def evaluate_rule(self, rule: Dict[str, Any], metrics: Dict[str, Any]) -> bool:
        """Evaluate if an alert rule should trigger"""
        try:
            condition = rule["condition"]
            
            # Simple condition evaluation - in production, use a proper expression evaluator
            if "cpu_usage >" in condition:
                threshold = float(condition.split(">")[1].strip())
                return metrics.get("cpu_usage", 0) > threshold
            elif "memory_usage >" in condition:
                threshold = float(condition.split(">")[1].strip())
                return metrics.get("memory_usage", 0) > threshold
            elif "disk_usage >" in condition:
                threshold = float(condition.split(">")[1].strip())
                return metrics.get("disk_usage", 0) > threshold
            elif "service_status ==" in condition:
                expected_status = condition.split("==")[1].strip().strip('"')
                return metrics.get("service_status") == expected_status
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluating rule {rule['id']}: {e}")
            return False

    async def create_alert(self, rule: Dict[str, Any], metrics: Dict[str, Any]):
        """Create a new alert"""
        try:
            # Check if alert already exists
            existing_alert = next(
                (alert for alert in self.active_alerts 
                 if alert["rule_id"] == rule["id"] and alert["status"] == "active"),
                None
            )
            
            if existing_alert:
                # Update existing alert
                existing_alert["last_triggered"] = datetime.utcnow().isoformat()
                existing_alert["trigger_count"] += 1
                logger.debug(f"Updated existing alert: {rule['name']}")
            else:
                # Create new alert
                alert = {
                    "id": f"alert_{datetime.utcnow().timestamp()}",
                    "rule_id": rule["id"],
                    "name": rule["name"],
                    "description": rule["description"],
                    "severity": rule["severity"],
                    "status": "active",
                    "created_at": datetime.utcnow().isoformat(),
                    "last_triggered": datetime.utcnow().isoformat(),
                    "trigger_count": 1,
                    "acknowledged": False,
                    "metrics": metrics
                }
                
                self.active_alerts.append(alert)
                self.alert_history.append(alert)
                
                logger.info(f"🚨 New alert created: {rule['name']} ({rule['severity']})")
                
                # In production, send notifications here
                await self.send_notifications(alert)
                
        except Exception as e:
            logger.error(f"Error creating alert: {e}")

    async def send_notifications(self, alert: Dict[str, Any]):
        """Send alert notifications"""
        try:
            # Mock notification sending - in production, send to Slack, email, etc.
            logger.info(f"📧 Sending notification for alert: {alert['name']}")
            
            # Simulate notification delay
            await asyncio.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        return self.alert_history[-limit:] if self.alert_history else []

    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get currently active alerts"""
        return [alert for alert in self.active_alerts if alert["status"] == "active"]

    async def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge an alert"""
        try:
            alert = next(
                (alert for alert in self.active_alerts if alert["id"] == alert_id),
                None
            )
            
            if alert:
                alert["acknowledged"] = True
                alert["acknowledged_at"] = datetime.utcnow().isoformat()
                logger.info(f"Alert acknowledged: {alert['name']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error acknowledging alert: {e}")
            return False

    async def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an alert"""
        try:
            alert = next(
                (alert for alert in self.active_alerts if alert["id"] == alert_id),
                None
            )
            
            if alert:
                alert["status"] = "resolved"
                alert["resolved_at"] = datetime.utcnow().isoformat()
                logger.info(f"Alert resolved: {alert['name']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error resolving alert: {e}")
            return False
