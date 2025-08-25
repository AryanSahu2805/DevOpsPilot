# app/services/notification_service.py
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger
from ..core.config import get_settings

settings = get_settings()

class NotificationService:
    def __init__(self):
        self.is_running = False
        self.notification_queue = asyncio.Queue()
        self.notification_history = []
        self.channels = {
            "email": EmailChannel(),
            "slack": SlackChannel(),
            "webhook": WebhookChannel(),
            "sms": SMSChannel()
        }

    async def start_service(self):
        """Start the notification service"""
        self.is_running = True
        logger.info("📧 Starting notification service...")
        
        # Start notification processor
        asyncio.create_task(self.process_notifications())
        
        logger.info("✅ Notification service started")

    async def stop_service(self):
        """Stop the notification service"""
        self.is_running = False
        logger.info("🛑 Stopping notification service...")

    async def send_notification(self, notification: Dict[str, Any]) -> bool:
        """Send a notification through specified channels"""
        try:
            # Add metadata
            notification["id"] = f"notif_{datetime.utcnow().timestamp()}"
            notification["created_at"] = datetime.utcnow().isoformat()
            notification["status"] = "pending"
            
            # Add to queue
            await self.notification_queue.put(notification)
            
            logger.info(f"📧 Notification queued: {notification.get('title', 'Unknown')}")
            return True
            
        except Exception as e:
            logger.error(f"Error queuing notification: {e}")
            return False

    async def process_notifications(self):
        """Process notifications from the queue"""
        while self.is_running:
            try:
                # Get notification from queue
                notification = await asyncio.wait_for(
                    self.notification_queue.get(), 
                    timeout=1.0
                )
                
                # Process notification
                await self.process_single_notification(notification)
                
                # Mark as processed
                self.notification_queue.task_done()
                
            except asyncio.TimeoutError:
                # No notifications in queue, continue
                continue
            except Exception as e:
                logger.error(f"Error processing notification: {e}")

    async def process_single_notification(self, notification: Dict[str, Any]):
        """Process a single notification"""
        try:
            channels = notification.get("channels", ["email"])
            success_count = 0
            
            for channel_name in channels:
                if channel_name in self.channels:
                    channel = self.channels[channel_name]
                    
                    try:
                        success = await channel.send(notification)
                        if success:
                            success_count += 1
                            logger.info(f"✅ Notification sent via {channel_name}")
                        else:
                            logger.warning(f"⚠️ Failed to send notification via {channel_name}")
                            
                    except Exception as e:
                        logger.error(f"Error sending via {channel_name}: {e}")
                else:
                    logger.warning(f"Unknown notification channel: {channel_name}")
            
            # Update notification status
            if success_count > 0:
                notification["status"] = "sent"
                notification["sent_at"] = datetime.utcnow().isoformat()
                notification["channels_sent"] = success_count
            else:
                notification["status"] = "failed"
                notification["failed_at"] = datetime.utcnow().isoformat()
            
            # Store in history
            self.notification_history.append(notification)
            
        except Exception as e:
            logger.error(f"Error processing notification: {e}")
            notification["status"] = "error"
            notification["error"] = str(e)

    async def send_alert_notification(self, alert: Dict[str, Any]) -> bool:
        """Send notification for an alert"""
        try:
            notification = {
                "type": "alert",
                "title": f"🚨 Alert: {alert.get('name', 'Unknown Alert')}",
                "message": alert.get('description', 'No description available'),
                "severity": alert.get('severity', 'info'),
                "alert_id": alert.get('id'),
                "channels": self.get_channels_by_severity(alert.get('severity', 'info')),
                "priority": "high" if alert.get('severity') == 'critical' else "normal"
            }
            
            return await self.send_notification(notification)
            
        except Exception as e:
            logger.error(f"Error creating alert notification: {e}")
            return False

    async def send_insight_notification(self, insight: Dict[str, Any]) -> bool:
        """Send notification for an AI insight"""
        try:
            notification = {
                "type": "insight",
                "title": f"🤖 AI Insight: {insight.get('title', 'Unknown Insight')}",
                "message": insight.get('description', 'No description available'),
                "severity": insight.get('severity', 'info'),
                "insight_id": insight.get('id'),
                "channels": self.get_channels_by_severity(insight.get('severity', 'info')),
                "priority": "normal"
            }
            
            return await self.send_notification(notification)
            
        except Exception as e:
            logger.error(f"Error creating insight notification: {e}")
            return False

    def get_channels_by_severity(self, severity: str) -> List[str]:
        """Get notification channels based on severity"""
        if severity == "critical":
            return ["email", "slack", "sms"]
        elif severity == "warning":
            return ["email", "slack"]
        else:
            return ["email"]

    async def get_notification_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get notification history"""
        return self.notification_history[-limit:] if self.notification_history else []

    async def get_notifications_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get notifications by status"""
        return [n for n in self.notification_history if n.get("status") == status]

    async def get_notifications_by_type(self, notification_type: str) -> List[Dict[str, Any]]:
        """Get notifications by type"""
        return [n for n in self.notification_history if n.get("type") == notification_type]


class EmailChannel:
    """Email notification channel"""
    
    async def send(self, notification: Dict[str, Any]) -> bool:
        """Send email notification"""
        try:
            # Mock email sending - in production, integrate with SMTP or email service
            logger.info(f"📧 [EMAIL] Sending to: {notification.get('recipients', 'default')}")
            logger.info(f"📧 [EMAIL] Subject: {notification.get('title', 'No title')}")
            logger.info(f"📧 [EMAIL] Body: {notification.get('message', 'No message')}")
            
            # Simulate email sending delay
            await asyncio.sleep(0.5)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False


class SlackChannel:
    """Slack notification channel"""
    
    async def send(self, notification: Dict[str, Any]) -> bool:
        """Send Slack notification"""
        try:
            # Mock Slack sending - in production, integrate with Slack API
            logger.info(f"💬 [SLACK] Sending to channel: {notification.get('channel', 'general')}")
            logger.info(f"💬 [SLACK] Message: {notification.get('message', 'No message')}")
            
            # Simulate Slack API delay
            await asyncio.sleep(0.3)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending Slack message: {e}")
            return False


class WebhookChannel:
    """Webhook notification channel"""
    
    async def send(self, notification: Dict[str, Any]) -> bool:
        """Send webhook notification"""
        try:
            # Mock webhook sending - in production, make HTTP POST request
            logger.info(f"🔗 [WEBHOOK] Sending to: {notification.get('webhook_url', 'default')}")
            logger.info(f"🔗 [WEBHOOK] Payload: {notification.get('message', 'No message')}")
            
            # Simulate webhook delay
            await asyncio.sleep(0.2)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending webhook: {e}")
            return False


class SMSChannel:
    """SMS notification channel"""
    
    async def send(self, notification: Dict[str, Any]) -> bool:
        """Send SMS notification"""
        try:
            # Mock SMS sending - in production, integrate with SMS service
            logger.info(f"📱 [SMS] Sending to: {notification.get('phone_number', 'default')}")
            logger.info(f"📱 [SMS] Message: {notification.get('message', 'No message')}")
            
            # Simulate SMS delay
            await asyncio.sleep(0.4)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return False
