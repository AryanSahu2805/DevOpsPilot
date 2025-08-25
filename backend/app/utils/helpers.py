# app/utils/helpers.py
import hashlib
import json
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from loguru import logger

def generate_id(prefix: str = "id") -> str:
    """Generate a unique ID with prefix"""
    timestamp = datetime.utcnow().timestamp()
    random_suffix = hashlib.md5(f"{timestamp}".encode()).hexdigest()[:8]
    return f"{prefix}_{int(timestamp)}_{random_suffix}"

def format_timestamp(timestamp: Union[str, datetime, float]) -> str:
    """Format timestamp to human-readable string"""
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        elif isinstance(timestamp, float):
            dt = datetime.fromtimestamp(timestamp)
        else:
            dt = timestamp
        
        return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
    except Exception as e:
        logger.warning(f"Error formatting timestamp {timestamp}: {e}")
        return str(timestamp)

def format_duration(seconds: Union[int, float]) -> str:
    """Format duration in seconds to human-readable string"""
    try:
        seconds = int(seconds)
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            minutes = seconds // 60
            remaining_seconds = seconds % 60
            return f"{minutes}m {remaining_seconds}s"
        elif seconds < 86400:
            hours = seconds // 3600
            remaining_minutes = (seconds % 3600) // 60
            return f"{hours}h {remaining_minutes}m"
        else:
            days = seconds // 86400
            remaining_hours = (seconds % 86400) // 3600
            return f"{days}d {remaining_hours}h"
    except Exception as e:
        logger.warning(f"Error formatting duration {seconds}: {e}")
        return str(seconds)

def format_bytes(bytes_value: Union[int, float]) -> str:
    """Format bytes to human-readable string"""
    try:
        bytes_value = float(bytes_value)
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"
    except Exception as e:
        logger.warning(f"Error formatting bytes {bytes_value}: {e}")
        return str(bytes_value)

def format_percentage(value: Union[int, float], total: Union[int, float] = 100) -> str:
    """Format value as percentage"""
    try:
        if total == 0:
            return "0%"
        percentage = (value / total) * 100
        return f"{percentage:.1f}%"
    except Exception as e:
        logger.warning(f"Error formatting percentage {value}/{total}: {e}")
        return "0%"

def validate_email(email: str) -> bool:
    """Validate email format"""
    try:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    except Exception:
        return False

def validate_url(url: str) -> bool:
    """Validate URL format"""
    try:
        pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return bool(re.match(pattern, url))
    except Exception:
        return False

def sanitize_filename(filename: str) -> str:
    """Sanitize filename by removing/replacing invalid characters"""
    try:
        # Remove or replace invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # Remove leading/trailing spaces and dots
        sanitized = sanitized.strip(' .')
        # Ensure filename is not empty
        if not sanitized:
            sanitized = "unnamed_file"
        return sanitized
    except Exception as e:
        logger.warning(f"Error sanitizing filename {filename}: {e}")
        return "unnamed_file"

def deep_merge(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge two dictionaries"""
    try:
        result = dict1.copy()
        for key, value in dict2.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = deep_merge(result[key], value)
            else:
                result[key] = value
        return result
    except Exception as e:
        logger.warning(f"Error merging dictionaries: {e}")
        return dict1

def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """Flatten a nested dictionary"""
    try:
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
    except Exception as e:
        logger.warning(f"Error flattening dictionary: {e}")
        return d

def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split a list into chunks of specified size"""
    try:
        return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]
    except Exception as e:
        logger.warning(f"Error chunking list: {e}")
        return [lst]

def retry_with_backoff(func, max_retries: int = 3, base_delay: float = 1.0):
    """Retry function with exponential backoff"""
    def wrapper(*args, **kwargs):
        last_exception = None
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed, retrying in {delay}s: {e}")
                    import time
                    time.sleep(delay)
        
        logger.error(f"All {max_retries} attempts failed")
        raise last_exception
    
    return wrapper

def calculate_rate_limit(requests: int, time_window: int) -> float:
    """Calculate rate limit (requests per second)"""
    try:
        return requests / time_window if time_window > 0 else 0
    except Exception as e:
        logger.warning(f"Error calculating rate limit: {e}")
        return 0

def parse_time_range(time_range: str) -> tuple:
    """Parse time range string to start and end timestamps"""
    try:
        now = datetime.utcnow()
        
        if time_range == "1h":
            start = now - timedelta(hours=1)
        elif time_range == "6h":
            start = now - timedelta(hours=6)
        elif time_range == "24h":
            start = now - timedelta(days=1)
        elif time_range == "7d":
            start = now - timedelta(days=7)
        elif time_range == "30d":
            start = now - timedelta(days=30)
        else:
            # Default to 1 hour
            start = now - timedelta(hours=1)
        
        return start.isoformat(), now.isoformat()
        
    except Exception as e:
        logger.warning(f"Error parsing time range {time_range}: {e}")
        # Default fallback
        now = datetime.utcnow()
        start = now - timedelta(hours=1)
        return start.isoformat(), now.isoformat()

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely parse JSON string with fallback"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError) as e:
        logger.warning(f"Error parsing JSON: {e}")
        return default

def safe_json_dumps(obj: Any, default: str = "{}") -> str:
    """Safely serialize object to JSON string with fallback"""
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError) as e:
        logger.warning(f"Error serializing to JSON: {e}")
        return default

def mask_sensitive_data(data: Dict[str, Any], sensitive_keys: List[str] = None) -> Dict[str, Any]:
    """Mask sensitive data in dictionary"""
    try:
        if sensitive_keys is None:
            sensitive_keys = ['password', 'token', 'secret', 'key', 'api_key']
        
        masked_data = data.copy()
        for key, value in masked_data.items():
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                if isinstance(value, str):
                    masked_data[key] = '*' * min(len(value), 8) + '...'
                else:
                    masked_data[key] = '***'
        
        return masked_data
        
    except Exception as e:
        logger.warning(f"Error masking sensitive data: {e}")
        return data

def get_memory_usage() -> Dict[str, float]:
    """Get current memory usage information"""
    try:
        import psutil
        memory = psutil.virtual_memory()
        return {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "free": memory.free,
            "percent": memory.percent
        }
    except ImportError:
        return {"error": "psutil not available"}
    except Exception as e:
        logger.warning(f"Error getting memory usage: {e}")
        return {"error": str(e)}

def get_disk_usage(path: str = "/") -> Dict[str, Any]:
    """Get disk usage information for a path"""
    try:
        import psutil
        disk = psutil.disk_usage(path)
        return {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        }
    except ImportError:
        return {"error": "psutil not available"}
    except Exception as e:
        logger.warning(f"Error getting disk usage for {path}: {e}")
        return {"error": str(e)}
