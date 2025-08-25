# app/core/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "DevOps Pilot"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # CORS
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://devops-pilot.com"
    ]
    
    # Database - MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "devops_pilot"
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 100
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_SOCKET_TIMEOUT: int = 5
    
    # Monitoring
    METRICS_COLLECTION_INTERVAL: int = 30  # seconds
    ALERT_CHECK_INTERVAL: int = 60  # seconds
    METRICS_RETENTION_DAYS: int = 30
    
    # External Services
    PROMETHEUS_URL: str = "http://localhost:9090"
    GRAFANA_URL: str = "http://localhost:3001"
    
    # Notifications
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    
    SLACK_WEBHOOK_URL: Optional[str] = None
    SLACK_CHANNEL: str = "#devops-alerts"
    
    # AI/ML
    AI_MODEL_PATH: str = "models/"
    AI_PREDICTION_INTERVAL: int = 300  # seconds
    ANOMALY_DETECTION_THRESHOLD: float = 0.8
    
    # Kubernetes
    KUBECONFIG_PATH: Optional[str] = None
    K8S_NAMESPACE: str = "default"
    
    # AWS (if using cloud monitoring)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-west-2"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Environment-specific configurations
class DevelopmentSettings(Settings):
    """Development environment settings"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    MONGODB_DATABASE: str = "devops_pilot_dev"
    
class ProductionSettings(Settings):
    """Production environment settings"""
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"
    BCRYPT_ROUNDS: int = 16
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
class TestingSettings(Settings):
    """Testing environment settings"""
    MONGODB_DATABASE: str = "devops_pilot_test"
    REDIS_DB: int = 15  # Use different Redis DB for tests
    METRICS_COLLECTION_INTERVAL: int = 5
    ALERT_CHECK_INTERVAL: int = 10

def get_environment_settings():
    """Get environment-specific settings"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()
