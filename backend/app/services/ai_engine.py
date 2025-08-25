# app/services/ai_engine.py
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from loguru import logger
from ..core.config import get_settings

settings = get_settings()

class AIEngine:
    def __init__(self):
        self.is_running = False
        self.analysis_interval = settings.AI_ANALYSIS_INTERVAL
        self.anomaly_threshold = 0.8
        self.prediction_horizon = 24  # hours
        self.insights_history = []

    async def start_analysis(self):
        """Start AI analysis"""
        self.is_running = True
        logger.info("🤖 Starting AI analysis...")
        
        while self.is_running:
            try:
                await self.perform_analysis()
                await asyncio.sleep(self.analysis_interval)
                
            except Exception as e:
                logger.error(f"Error in AI analysis: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error

    async def stop_analysis(self):
        """Stop AI analysis"""
        self.is_running = False
        logger.info("🛑 Stopped AI analysis")

    async def perform_analysis(self):
        """Perform comprehensive AI analysis"""
        try:
            # Mock metrics data - in production, fetch from actual metrics
            mock_metrics = await self.get_mock_metrics()
            
            # Perform different types of analysis
            anomaly_results = await self.detect_anomalies(mock_metrics)
            predictions = await self.predict_trends(mock_metrics)
            insights = await self.generate_insights(mock_metrics, anomaly_results, predictions)
            
            # Store insights
            if insights:
                self.insights_history.extend(insights)
                logger.info(f"Generated {len(insights)} new AI insights")
                
        except Exception as e:
            logger.error(f"Error performing AI analysis: {e}")

    async def get_mock_metrics(self) -> Dict[str, Any]:
        """Get mock metrics for analysis"""
        return {
            "cpu_usage": [65, 68, 72, 75, 78, 82, 85, 88, 90, 92],
            "memory_usage": [70, 72, 75, 78, 80, 82, 85, 87, 89, 91],
            "disk_usage": [45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
            "network_io": [100, 120, 110, 130, 140, 150, 160, 170, 180, 190],
            "response_time": [50, 52, 55, 58, 60, 62, 65, 68, 70, 72]
        }

    async def detect_anomalies(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in metrics"""
        try:
            anomalies = {}
            
            for metric_name, values in metrics.items():
                if len(values) < 3:
                    continue
                
                # Simple statistical anomaly detection
                mean_val = sum(values) / len(values)
                variance = sum((x - mean_val) ** 2 for x in values) / len(values)
                std_dev = variance ** 0.5
                
                # Check for values beyond 2 standard deviations
                threshold = mean_val + (2 * std_dev)
                anomaly_points = [i for i, val in enumerate(values) if val > threshold]
                
                if anomaly_points:
                    anomalies[metric_name] = {
                        "anomaly_points": anomaly_points,
                        "severity": "high" if len(anomaly_points) > 2 else "medium",
                        "threshold": threshold,
                        "mean": mean_val,
                        "std_dev": std_dev
                    }
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {e}")
            return {}

    async def predict_trends(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Predict future trends"""
        try:
            predictions = {}
            
            for metric_name, values in metrics.items():
                if len(values) < 3:
                    continue
                
                # Simple linear trend prediction
                n = len(values)
                x_sum = sum(range(n))
                y_sum = sum(values)
                xy_sum = sum(i * val for i, val in enumerate(values))
                x2_sum = sum(i * i for i in range(n))
                
                # Linear regression coefficients
                slope = (n * xy_sum - x_sum * y_sum) / (n * x2_sum - x_sum * x_sum)
                intercept = (y_sum - slope * x_sum) / n
                
                # Predict next few values
                future_values = []
                for i in range(n, n + 6):  # Predict next 6 points
                    predicted = slope * i + intercept
                    future_values.append(max(0, predicted))  # Ensure non-negative
                
                predictions[metric_name] = {
                    "trend": "increasing" if slope > 0 else "decreasing",
                    "slope": slope,
                    "future_values": future_values,
                    "confidence": min(0.95, 1 - abs(slope) / 100)  # Simple confidence metric
                }
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error predicting trends: {e}")
            return {}

    async def generate_insights(self, metrics: Dict[str, Any], anomalies: Dict[str, Any], predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actionable insights"""
        try:
            insights = []
            current_time = datetime.utcnow()
            
            # Generate insights based on anomalies
            for metric_name, anomaly_data in anomalies.items():
                insight = {
                    "id": f"insight_{current_time.timestamp()}_{metric_name}",
                    "type": "anomaly_detection",
                    "title": f"Anomaly detected in {metric_name}",
                    "description": f"Unusual pattern detected in {metric_name} with {anomaly_data['severity']} severity",
                    "severity": anomaly_data["severity"],
                    "metric": metric_name,
                    "timestamp": current_time.isoformat(),
                    "recommendations": [
                        "Investigate the root cause",
                        "Check for recent deployments or changes",
                        "Monitor closely for the next few hours"
                    ],
                    "confidence": 0.85
                }
                insights.append(insight)
            
            # Generate insights based on predictions
            for metric_name, prediction_data in predictions.items():
                if prediction_data["trend"] == "increasing" and prediction_data["slope"] > 5:
                    insight = {
                        "id": f"insight_{current_time.timestamp()}_{metric_name}_trend",
                        "type": "trend_analysis",
                        "title": f"Rapid increase in {metric_name}",
                        "description": f"{metric_name} is increasing rapidly and may reach critical levels soon",
                        "severity": "warning",
                        "metric": metric_name,
                        "timestamp": current_time.isoformat(),
                        "recommendations": [
                            "Consider scaling resources",
                            "Investigate what's causing the increase",
                            "Set up proactive alerts"
                        ],
                        "confidence": prediction_data["confidence"]
                    }
                    insights.append(insight)
            
            # Generate capacity planning insights
            if "memory_usage" in metrics and "disk_usage" in metrics:
                avg_memory = sum(metrics["memory_usage"]) / len(metrics["memory_usage"])
                avg_disk = sum(metrics["disk_usage"]) / len(metrics["disk_usage"])
                
                if avg_memory > 80 or avg_disk > 70:
                    insight = {
                        "id": f"insight_{current_time.timestamp()}_capacity",
                        "type": "capacity_planning",
                        "title": "Resource capacity planning needed",
                        "description": f"High resource usage detected (Memory: {avg_memory:.1f}%, Disk: {avg_disk:.1f}%)",
                        "severity": "info",
                        "metric": "capacity",
                        "timestamp": current_time.isoformat(),
                        "recommendations": [
                            "Plan for resource expansion",
                            "Review resource allocation",
                            "Consider optimization strategies"
                        ],
                        "confidence": 0.9
                    }
                    insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []

    async def get_recent_insights(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent AI insights"""
        return self.insights_history[-limit:] if self.insights_history else []

    async def get_insights_by_type(self, insight_type: str) -> List[Dict[str, Any]]:
        """Get insights by type"""
        return [insight for insight in self.insights_history if insight["type"] == insight_type]

    async def get_insights_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """Get insights by severity"""
        return [insight for insight in self.insights_history if insight["severity"] == severity]

    async def analyze_specific_metric(self, metric_name: str, time_range: int = 24) -> Dict[str, Any]:
        """Analyze a specific metric in detail"""
        try:
            # Mock detailed analysis - in production, fetch actual historical data
            mock_data = {
                "cpu_usage": [65, 68, 72, 75, 78, 82, 85, 88, 90, 92, 89, 86, 83, 80, 77, 74, 71, 68, 65, 62, 59, 56, 53, 50],
                "memory_usage": [70, 72, 75, 78, 80, 82, 85, 87, 89, 91, 88, 85, 82, 79, 76, 73, 70, 67, 64, 61, 58, 55, 52, 49]
            }
            
            if metric_name not in mock_data:
                return {"error": "Metric not found"}
            
            values = mock_data[metric_name]
            
            analysis = {
                "metric": metric_name,
                "time_range_hours": time_range,
                "current_value": values[-1],
                "average": sum(values) / len(values),
                "min_value": min(values),
                "max_value": max(values),
                "trend": "stable",
                "anomalies": [],
                "recommendations": []
            }
            
            # Trend analysis
            if len(values) >= 2:
                recent_avg = sum(values[-6:]) / 6
                older_avg = sum(values[:6]) / 6
                if recent_avg > older_avg * 1.1:
                    analysis["trend"] = "increasing"
                elif recent_avg < older_avg * 0.9:
                    analysis["trend"] = "decreasing"
            
            # Generate recommendations
            if analysis["current_value"] > 80:
                analysis["recommendations"].append("Consider scaling up resources")
            elif analysis["current_value"] < 20:
                analysis["recommendations"].append("Consider scaling down to save costs")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing metric {metric_name}: {e}")
            return {"error": str(e)}
