# app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from redis import Redis
from loguru import logger
from .config import get_settings

settings = get_settings()

# MongoDB client
mongodb_client: AsyncIOMotorClient = None
mongodb_database = None

# Redis client
redis_client: Redis = None

async def connect_to_database():
    """Connect to MongoDB and Redis"""
    global mongodb_client, mongodb_database, redis_client
    
    try:
        # Connect to MongoDB
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE
        )
        mongodb_database = mongodb_client[settings.MONGODB_DATABASE]
        
        # Test MongoDB connection
        await mongodb_client.admin.command('ping')
        logger.info("✅ Connected to MongoDB")
        
        # Connect to Redis
        redis_client = Redis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
            decode_responses=True
        )
        
        # Test Redis connection
        redis_client.ping()
        logger.info("✅ Connected to Redis")
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to databases: {e}")
        raise

async def close_database_connection():
    """Close database connections"""
    global mongodb_client, redis_client
    
    try:
        if mongodb_client:
            mongodb_client.close()
            logger.info("✅ MongoDB connection closed")
        
        if redis_client:
            redis_client.close()
            logger.info("✅ Redis connection closed")
            
    except Exception as e:
        logger.error(f"❌ Error closing database connections: {e}")

def get_mongodb_database():
    """Get MongoDB database instance"""
    return mongodb_database

def get_redis_client():
    """Get Redis client instance"""
    return redis_client
