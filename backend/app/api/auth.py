# app/api/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from loguru import logger
from ..core.security import verify_password, create_access_token, get_current_user
from ..core.config import get_settings

settings = get_settings()
router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """User login endpoint"""
    try:
        # Mock user authentication - in production, fetch from database
        if form_data.username == "admin@devopspilot.com" and form_data.password == "admin123":
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": "admin", "email": "admin@devopspilot.com", "username": "admin", "roles": ["admin", "user"]},
                expires_delta=access_token_expires
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": {
                    "id": "admin",
                    "email": "admin@devopspilot.com",
                    "username": "admin",
                    "roles": ["admin", "user"]
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """User logout endpoint"""
    # In production, you might want to blacklist the token
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/refresh")
async def refresh_token():
    """Refresh access token"""
    # Implement token refresh logic
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token refresh not implemented yet"
    )
