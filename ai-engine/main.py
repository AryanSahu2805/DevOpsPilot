#!/usr/bin/env python3
"""
DevOpsPilot AI Engine
FastAPI service for AI/ML operations including anomaly detection, predictive scaling, and root cause analysis.
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import asyncio
from loguru import logger
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import os
import sys

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import AI models
from models.anomaly_detection import AnomalyDetectionModel
from models.predictive_scaling import PredictiveScalingModel
from models.root_cause_analysis import RootCauseAnalysisModel
from training.data_preprocessing import DataPreprocessor
from training.model_training import ModelTrainer

# Pydantic models for API
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np

# Configuration
class AIEngineConfig:
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8001))
    RELOAD = os.getenv("RELOAD", "false").lower() == "true"
    
    # Model configurations
    MODEL_UPDATE_INTERVAL = int(os.getenv("MODEL_UPDATE_INTERVAL", 3600))  # 1 hour
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", 1000))
    
    # Storage
    MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/app/models/storage")
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

config = AIEngineConfig()

# API Request/Response Models
class MetricsData(BaseModel):
    timestamp: datetime
    cpu_usage: float = Field(..., ge=0, le=100)
    memory_usage: float = Field(..., ge=0, le=100)
    disk_usage: float = Field(..., ge=0, le=100)
    network_in: float = Field(..., ge=0)
    network_out: float = Field(..., ge=0)
    response_time: float = Field(..., ge=0)
    throughput: float = Field(..., ge=0)
    error_rate: float = Field(..., ge=0, le=100)
    service_name: Optional[str] = None
    environment: Optional[str] = None

class AnomalyDetectionRequest(BaseModel):
    metrics: List[MetricsData]
    metric_name: str
    detection_type: str = "ensemble"  # isolation_forest, dbscan, statistical, ensemble

class PredictiveScalingRequest(BaseModel):
    metrics: List[MetricsData]
    prediction_horizon: int = Field(24, ge=1, le=168)  # 1 hour to 1 week

class RootCauseAnalysisRequest(BaseModel):
    incident_metrics: List[MetricsData]
    incident_metadata: Dict[str, Any]
    analysis_depth: int = Field(3, ge=1, le=5)

class TrainingRequest(BaseModel):
    training_data: List[MetricsData]
    model_type: str  # anomaly_detection, predictive_scaling, root_cause_analysis
    training_config: Optional[Dict[str, Any]] = None

# Global AI models
ai_models = {
    "anomaly_detection": None,
    "predictive_scaling": None,
    "root_cause_analysis": None,
    "data_preprocessor": None,
    "model_trainer": None
}

# Background task for model updates
async def periodic_model_update():
    """Periodically retrain models with new data"""
    while True:
        try:
            logger.info("Starting periodic model update...")
            
            # This would typically fetch new data from a database or data pipeline
            # For now, we'll skip the actual training
            
            logger.info("Periodic model update completed")
            await asyncio.sleep(config.MODEL_UPDATE_INTERVAL)
            
        except Exception as e:
            logger.error(f"Error in periodic model update: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes before retry

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global ai_models
    
    # Startup
    logger.info("🤖 Starting DevOpsPilot AI Engine...")
    
    # Create model storage directory
    os.makedirs(config.MODEL_STORAGE_PATH, exist_ok=True)
    
    # Initialize AI models
    logger.info("Initializing AI models...")
    ai_models["anomaly_detection"] = AnomalyDetectionModel()
    ai_models["predictive_scaling"] = PredictiveScalingModel()
    ai_models["root_cause_analysis"] = RootCauseAnalysisModel()
    ai_models["data_preprocessor"] = DataPreprocessor()
    ai_models["model_trainer"] = ModelTrainer()
    
    # Load pre-trained models if they exist
    try:
        for model_name in ["anomaly_detection", "predictive_scaling", "root_cause_analysis"]:
            model_path = os.path.join(config.MODEL_STORAGE_PATH, f"{model_name}.joblib")
            if os.path.exists(model_path):
                ai_models[model_name].load_models(model_path)
                logger.info(f"Loaded pre-trained {model_name} model")
    except Exception as e:
        logger.warning(f"Could not load pre-trained models: {e}")
    
    # Start background tasks
    background_task = asyncio.create_task(periodic_model_update())
    
    logger.info("🚀 AI Engine is ready!")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down AI Engine...")
    background_task.cancel()
    
    # Save models
    try:
        for model_name in ["anomaly_detection", "predictive_scaling", "root_cause_analysis"]:
            if ai_models[model_name] and ai_models[model_name].is_trained:
                model_path = os.path.join(config.MODEL_STORAGE_PATH, f"{model_name}.joblib")
                ai_models[model_name].save_models(model_path)
                logger.info(f"Saved {model_name} model")
    except Exception as e:
        logger.error(f"Error saving models: {e}")
    
    logger.info("👋 AI Engine shutdown complete")

# Initialize FastAPI app
app = FastAPI(
    title="DevOpsPilot AI Engine",
    description="AI/ML Service for Anomaly Detection, Predictive Scaling, and Root Cause Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
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
        "models": {
            "anomaly_detection": "trained" if ai_models["anomaly_detection"] and ai_models["anomaly_detection"].is_trained else "untrained",
            "predictive_scaling": "trained" if ai_models["predictive_scaling"] and ai_models["predictive_scaling"].is_trained else "untrained",
            "root_cause_analysis": "trained" if ai_models["root_cause_analysis"] and ai_models["root_cause_analysis"].is_trained else "untrained"
        }
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def read_root():
    """AI Engine root endpoint"""
    return {
        "message": "DevOpsPilot AI Engine",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "capabilities": [
            "anomaly_detection",
            "predictive_scaling", 
            "root_cause_analysis",
            "model_training"
        ]
    }

# Anomaly Detection Endpoints
@app.post("/anomaly-detection/detect", tags=["Anomaly Detection"])
async def detect_anomalies(request: AnomalyDetectionRequest):
    """Detect anomalies in metrics data"""
    try:
        if not ai_models["anomaly_detection"]:
            raise HTTPException(status_code=503, detail="Anomaly detection model not available")
        
        # Convert metrics to DataFrame
        metrics_df = pd.DataFrame([m.dict() for m in request.metrics])
        
        # Detect anomalies
        result = ai_models["anomaly_detection"].detect_anomalies(metrics_df, request.metric_name)
        
        return {
            "anomalies": result.get("anomalies", []),
            "confidence": result.get("confidence", 0.0),
            "method": result.get("method", "unknown"),
            "detection_time": datetime.utcnow().isoformat(),
            "total_samples": len(request.metrics),
            "anomaly_count": len(result.get("anomalies", []))
        }
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {e}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/anomaly-detection/train", tags=["Anomaly Detection"])
async def train_anomaly_detection(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train anomaly detection model"""
    try:
        if request.model_type != "anomaly_detection":
            raise HTTPException(status_code=400, detail="Invalid model type for this endpoint")
        
        # Convert metrics to DataFrame
        training_df = pd.DataFrame([m.dict() for m in request.training_data])
        
        # Group by metric names for training
        training_data = {}
        for metric_name in ["cpu_usage", "memory_usage", "disk_usage", "response_time"]:
            if metric_name in training_df.columns:
                training_data[metric_name] = training_df
        
        # Train in background
        def train_model():
            try:
                ai_models["anomaly_detection"].train_models(training_data)
                logger.info("Anomaly detection model training completed")
            except Exception as e:
                logger.error(f"Model training failed: {e}")
        
        background_tasks.add_task(train_model)
        
        return {
            "message": "Training started",
            "model_type": "anomaly_detection",
            "training_samples": len(request.training_data),
            "status": "training_in_progress"
        }
        
    except Exception as e:
        logger.error(f"Error starting anomaly detection training: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Predictive Scaling Endpoints
@app.post("/predictive-scaling/predict", tags=["Predictive Scaling"])
async def predict_scaling_needs(request: PredictiveScalingRequest):
    """Predict scaling needs for the next N hours"""
    try:
        if not ai_models["predictive_scaling"]:
            raise HTTPException(status_code=503, detail="Predictive scaling model not available")
        
        # Convert metrics to DataFrame
        metrics_df = pd.DataFrame([m.dict() for m in request.metrics])
        
        # Generate predictions
        result = ai_models["predictive_scaling"].predict_scaling_needs(
            metrics_df, 
            request.prediction_horizon
        )
        
        return {
            "predictions": result.get("predictions", {}),
            "scaling_recommendations": result.get("scaling_recommendations", []),
            "confidence": result.get("confidence", 0.0),
            "prediction_horizon": request.prediction_horizon,
            "prediction_time": datetime.utcnow().isoformat(),
            "input_samples": len(request.metrics)
        }
        
    except Exception as e:
        logger.error(f"Error in predictive scaling: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predictive-scaling/train", tags=["Predictive Scaling"])
async def train_predictive_scaling(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train predictive scaling model"""
    try:
        if request.model_type != "predictive_scaling":
            raise HTTPException(status_code=400, detail="Invalid model type for this endpoint")
        
        # Convert metrics to DataFrame
        training_df = pd.DataFrame([m.dict() for m in request.training_data])
        
        # Train in background
        def train_model():
            try:
                ai_models["predictive_scaling"].train_models(training_df)
                logger.info("Predictive scaling model training completed")
            except Exception as e:
                logger.error(f"Model training failed: {e}")
        
        background_tasks.add_task(train_model)
        
        return {
            "message": "Training started",
            "model_type": "predictive_scaling",
            "training_samples": len(request.training_data),
            "status": "training_in_progress"
        }
        
    except Exception as e:
        logger.error(f"Error starting predictive scaling training: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Root Cause Analysis Endpoints
@app.post("/root-cause-analysis/analyze", tags=["Root Cause Analysis"])
async def analyze_root_cause(request: RootCauseAnalysisRequest):
    """Analyze root cause of an incident"""
    try:
        if not ai_models["root_cause_analysis"]:
            raise HTTPException(status_code=503, detail="Root cause analysis model not available")
        
        # Convert metrics to DataFrame
        incident_df = pd.DataFrame([m.dict() for m in request.incident_metrics])
        
        # Analyze root cause
        result = ai_models["root_cause_analysis"].analyze_root_cause(
            incident_df, 
            request.incident_metadata
        )
        
        return {
            "root_causes": result.get("root_causes", []),
            "confidence": result.get("confidence", 0.0),
            "analysis_path": result.get("analysis_path", []),
            "analysis_time": datetime.utcnow().isoformat(),
            "incident_samples": len(request.incident_metrics),
            "analysis_depth": request.analysis_depth
        }
        
    except Exception as e:
        logger.error(f"Error in root cause analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/root-cause-analysis/train", tags=["Root Cause Analysis"])
async def train_root_cause_analysis(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train root cause analysis model"""
    try:
        if request.model_type != "root_cause_analysis":
            raise HTTPException(status_code=400, detail="Invalid model type for this endpoint")
        
        # Convert metrics to DataFrame
        training_df = pd.DataFrame([m.dict() for m in request.training_data])
        
        # Train in background
        def train_model():
            try:
                ai_models["root_cause_analysis"].train_models(training_df)
                logger.info("Root cause analysis model training completed")
            except Exception as e:
                logger.error(f"Model training failed: {e}")
        
        background_tasks.add_task(train_model)
        
        return {
            "message": "Training started",
            "model_type": "root_cause_analysis",
            "training_samples": len(request.training_data),
            "status": "training_in_progress"
        }
        
    except Exception as e:
        logger.error(f"Error starting root cause analysis training: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Model Status Endpoints
@app.get("/models/status", tags=["Models"])
async def get_model_status():
    """Get status of all AI models"""
    try:
        status = {}
        for model_name, model in ai_models.items():
            if model and hasattr(model, 'get_model_status'):
                status[model_name] = model.get_model_status()
            else:
                status[model_name] = {"available": model is not None, "trained": False}
        
        return {
            "models": status,
            "timestamp": datetime.utcnow().isoformat(),
            "engine_version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.post("/models/reload", tags=["Models"])
async def reload_models():
    """Reload all AI models from storage"""
    try:
        reloaded = []
        failed = []
        
        for model_name in ["anomaly_detection", "predictive_scaling", "root_cause_analysis"]:
            try:
                model_path = os.path.join(config.MODEL_STORAGE_PATH, f"{model_name}.joblib")
                if os.path.exists(model_path):
                    ai_models[model_name].load_models(model_path)
                    reloaded.append(model_name)
                else:
                    failed.append(f"{model_name}: No saved model found")
            except Exception as e:
                failed.append(f"{model_name}: {str(e)}")
        
        return {
            "reloaded": reloaded,
            "failed": failed,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error reloading models: {e}")
        raise HTTPException(status_code=500, detail=f"Model reload failed: {str(e)}")

# Data Processing Endpoints
@app.post("/data/preprocess", tags=["Data Processing"])
async def preprocess_data(metrics: List[MetricsData]):
    """Preprocess metrics data for AI models"""
    try:
        if not ai_models["data_preprocessor"]:
            raise HTTPException(status_code=503, detail="Data preprocessor not available")
        
        # Convert metrics to DataFrame
        metrics_df = pd.DataFrame([m.dict() for m in metrics])
        
        # Preprocess data
        processed_df = ai_models["data_preprocessor"].preprocess_data(metrics_df)
        
        return {
            "processed_samples": len(processed_df),
            "original_samples": len(metrics),
            "features": list(processed_df.columns),
            "preprocessing_time": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in data preprocessing: {e}")
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO" if not config.DEBUG else "DEBUG"
    )
    
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.RELOAD,
        log_level="info"
    )
