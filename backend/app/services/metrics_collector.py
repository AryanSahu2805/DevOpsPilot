# app/services/metrics_collector.py
import asyncio
import psutil
from datetime import datetime
from typing import Dict, Any
from loguru import logger
from ..core.config import get_settings

settings = get_settings()

class MetricsCollector:
    def __init__(self):
        self.is_running = False
        self.collection_interval = settings.METRICS_COLLECTION_INTERVAL
        self.metrics_history = []
        self.max_history_size = 1000  # Keep last 1000 metrics

    async def start_collection(self):
        """Start collecting metrics"""
        self.is_running = True
        logger.info("🚀 Starting metrics collection...")
        
        while self.is_running:
            try:
                metrics = await self.collect_system_metrics()
                self.metrics_history.append(metrics)
                
                # Keep only the last N metrics
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history = self.metrics_history[-self.max_history_size:]
                
                logger.debug(f"Collected metrics: {metrics}")
                
                # Wait for next collection cycle
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"Error collecting metrics: {e}")
                await asyncio.sleep(60)  # Wait longer on error

    async def stop_collection(self):
        """Stop collecting metrics"""
        self.is_running = False
        logger.info("🛑 Stopped metrics collection")

    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect current system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            metrics = {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": cpu_count,
                    "frequency_mhz": cpu_freq.current if cpu_freq else None,
                    "load_average": psutil.getloadavg()
                },
                "memory": {
                    "total_gb": memory.total / (1024**3),
                    "available_gb": memory.available / (1024**3),
                    "used_gb": memory.used / (1024**3),
                    "usage_percent": memory.percent
                },
                "disk": {
                    "total_gb": disk.total / (1024**3),
                    "used_gb": disk.used / (1024**3),
                    "free_gb": disk.free / (1024**3),
                    "usage_percent": (disk.used / disk.total) * 100
                },
                "network": {
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                }
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }

    async def get_current_metrics(self) -> Dict[str, Any]:
        """Get the most recent metrics"""
        if self.metrics_history:
            return self.metrics_history[-1]
        return {}

    async def get_metrics_history(self, limit: int = 100) -> list:
        """Get metrics history"""
        return self.metrics_history[-limit:] if self.metrics_history else []

    async def get_metrics_summary(self) -> Dict[str, Any]:
        """Get metrics summary statistics"""
        if not self.metrics_history:
            return {}
        
        try:
            cpu_usage = [m.get("cpu", {}).get("usage_percent", 0) for m in self.metrics_history if "cpu" in m]
            memory_usage = [m.get("memory", {}).get("usage_percent", 0) for m in self.metrics_history if "memory" in m]
            
            return {
                "cpu": {
                    "current": cpu_usage[-1] if cpu_usage else 0,
                    "average": sum(cpu_usage) / len(cpu_usage) if cpu_usage else 0,
                    "max": max(cpu_usage) if cpu_usage else 0,
                    "min": min(cpu_usage) if cpu_usage else 0
                },
                "memory": {
                    "current": memory_usage[-1] if memory_usage else 0,
                    "average": sum(memory_usage) / len(memory_usage) if memory_usage else 0,
                    "max": max(memory_usage) if memory_usage else 0,
                    "min": min(memory_usage) if memory_usage else 0
                },
                "collection_count": len(self.metrics_history),
                "last_collection": self.metrics_history[-1]["timestamp"] if self.metrics_history else None
            }
            
        except Exception as e:
            logger.error(f"Error calculating metrics summary: {e}")
            return {}
