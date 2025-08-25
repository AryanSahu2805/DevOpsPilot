from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"
    DEVELOPER = "developer"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class UserPreferences(BaseModel):
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"
    notifications: dict = Field(default_factory=dict)
    dashboard_layout: dict = Field(default_factory=dict)

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_verified: bool = False
    permissions: List[str] = Field(default_factory=list)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.VIEWER
    department: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    preferences: Optional[UserPreferences] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    permissions: Optional[List[str]] = None

class UserLogin(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus
    preferences: UserPreferences
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_verified: bool
    permissions: List[str]

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
