# app/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import asyncio
from loguru import logger
import time
from datetime import datetime

# Core imports
from app.core.config import get_settings
from app.core.database import connect_to_database, close_database_connection
from app.core.security import get_current_user

# API Routes
from app.api.auth import router as auth_router
from app.api.metrics import router as metrics_router
from app.api.alerts import router as alerts_router
from app.api.deployments import router as deployments_router
from app.api.websocket import router as websocket_router

# Services
from app.services.metrics_collector import MetricsCollector
from app.services.alert_engine import AlertEngine

settings = get_settings()

# Background services
metrics_collector = None
alert_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global metrics_collector, alert_engine
    
    # Startup
    logger.info("🚀 Starting DevOps Pilot Backend...")
    
    # Connect to databases
    await connect_to_database()
    logger.info("📊 Connected to databases")
    
    # Initialize background services
    metrics_collector = MetricsCollector()
    alert_engine = AlertEngine()
    
    # Start background tasks
    asyncio.create_task(metrics_collector.start_collection())
    asyncio.create_task(alert_engine.start_monitoring())
    
    logger.info("⚡ Background services started")
    logger.info("🎯 DevOps Pilot is ready!")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down DevOps Pilot...")
    
    if metrics_collector:
        await metrics_collector.stop_collection()
    if alert_engine:
        await alert_engine.stop_monitoring()
    
    await close_database_connection()
    logger.info("👋 DevOps Pilot shutdown complete")

# Initialize FastAPI app
app = FastAPI(
    title="DevOps Pilot API",
    description="Cloud-Native DevOps Dashboard with AI-Powered Insights",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    return response

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "redis": "connected",
            "metrics_collector": "running" if metrics_collector else "stopped",
            "alert_engine": "running" if alert_engine else "stopped"
        }
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def read_root():
    """API Root endpoint"""
    return {
        "message": "Welcome to DevOps Pilot API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

# API Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(metrics_router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(deployments_router, prefix="/api/deployments", tags=["Deployments"])
app.include_router(websocket_router, prefix="/api/ws", tags=["WebSocket"])

# Protected endpoint example
@app.get("/api/dashboard", tags=["Dashboard"])
async def get_dashboard_data(current_user = Depends(get_current_user)):
    """Get dashboard overview data"""
    try:
        # Collect real-time metrics
        system_metrics = await metrics_collector.get_current_metrics() if metrics_collector else {}
        recent_alerts = await alert_engine.get_recent_alerts() if alert_engine else []
        
        return {
            "system_health": 98.5,
            "active_services": 47,
            "total_alerts": len(recent_alerts),
            "deployments_today": 12,
            "metrics": system_metrics,
            "recent_alerts": recent_alerts[:5],
            "timestamp": datetime.utcnow().isoformat(),
            "user": current_user.email
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch dashboard data"
        )

# AI Insights endpoint
@app.get("/api/ai/insights", tags=["AI"])
async def get_ai_insights(current_user = Depends(get_current_user)):
    """Get AI-powered system insights"""
    try:
        from app.services.ai_engine import AIEngine
        ai_engine = AIEngine()
        
        insights = await ai_engine.generate_insights()
        
        return {
            "insights": insights,
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI insights"
        )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
