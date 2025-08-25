# app/api/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
from loguru import logger
import json
import asyncio
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial connection message
        await manager.send_personal_message(
            json.dumps({
                "type": "connection",
                "message": "Connected to DevOps Pilot WebSocket",
                "timestamp": datetime.utcnow().isoformat()
            }),
            websocket
        )
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                elif message.get("type") == "subscribe":
                    # Handle subscription to specific metrics
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscribed",
                            "channel": message.get("channel"),
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                else:
                    # Echo back unknown message types
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "echo",
                            "data": message,
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await manager.send_personal_message(
                    json.dumps({
                        "type": "error",
                        "message": "Internal server error",
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    websocket
                )
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    finally:
        manager.disconnect(websocket)

# Background task to send periodic updates
async def send_metrics_updates():
    """Send periodic metrics updates to all connected clients"""
    while True:
        try:
            if manager.active_connections:
                # Mock metrics data - in production, fetch real metrics
                metrics_data = {
                    "type": "metrics_update",
                    "data": {
                        "cpu_usage": 65,
                        "memory_usage": 78,
                        "disk_usage": 45,
                        "network_traffic": 1.2
                    },
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await manager.broadcast(json.dumps(metrics_data))
                logger.debug(f"Sent metrics update to {len(manager.active_connections)} clients")
            
            # Wait before sending next update
            await asyncio.sleep(30)  # Send updates every 30 seconds
            
        except Exception as e:
            logger.error(f"Error sending metrics updates: {e}")
            await asyncio.sleep(60)  # Wait longer on error

# Start the background task when the module is imported
# In production, this should be managed by the application lifecycle
# asyncio.create_task(send_metrics_updates())
