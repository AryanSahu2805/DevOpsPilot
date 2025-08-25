from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    CLOSED = "closed"
    EXPIRED = "expired"

class AlertType(str, Enum):
    SYSTEM = "system"
    APPLICATION = "application"
    DATABASE = "database"
    NETWORK = "network"
    SECURITY = "security"
    PERFORMANCE = "performance"
    AVAILABILITY = "availability"
    CUSTOM = "custom"

class AlertRule(BaseModel):
    id: str
    name: str
    description: str
    alert_type: AlertType
    severity: AlertSeverity
    conditions: Dict[str, Any]
    threshold: float
    operator: str  # >, <, >=, <=, ==, !=
    duration: int  # seconds
    enabled: bool = True
    created_at: datetime
    updated_at: datetime
    created_by: str
    tags: List[str] = Field(default_factory=list)
    notification_channels: List[str] = Field(default_factory=list)
    escalation_policy: Optional[str] = None
    auto_resolve: bool = False
    auto_resolve_after: Optional[int] = None  # seconds

class Alert(BaseModel):
    id: str
    rule_id: str
    alert_type: AlertType
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: str
    message: str
    source: str
    service: Optional[str] = None
    environment: Optional[str] = None
    triggered_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    closed_by: Optional[str] = None
    labels: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    incident_id: Optional[str] = None
    correlation_id: Optional[str] = None
    parent_alert_id: Optional[str] = None
    child_alerts: List[str] = Field(default_factory=list)

class AlertHistory(BaseModel):
    id: str
    alert_id: str
    action: str
    user_id: str
    timestamp: datetime
    comment: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlertNotification(BaseModel):
    id: str
    alert_id: str
    channel: str
    recipient: str
    message: str
    sent_at: datetime
    status: str  # sent, failed, pending
    retry_count: int = 0
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlertEscalation(BaseModel):
    id: str
    alert_id: str
    level: int
    escalation_time: datetime
    assigned_to: str
    status: str  # pending, in_progress, completed
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class AlertRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    alert_type: AlertType
    severity: AlertSeverity
    conditions: Dict[str, Any]
    threshold: float
    operator: str
    duration: int = Field(..., ge=1)
    tags: List[str] = Field(default_factory=list)
    notification_channels: List[str] = Field(default_factory=list)
    escalation_policy: Optional[str] = None
    auto_resolve: bool = False
    auto_resolve_after: Optional[int] = None

class AlertRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    alert_type: Optional[AlertType] = None
    severity: Optional[AlertSeverity] = None
    conditions: Optional[Dict[str, Any]] = None
    threshold: Optional[float] = None
    operator: Optional[str] = None
    duration: Optional[int] = Field(None, ge=1)
    enabled: Optional[bool] = None
    tags: Optional[List[str]] = None
    notification_channels: Optional[List[str]] = None
    escalation_policy: Optional[str] = None
    auto_resolve: Optional[bool] = None
    auto_resolve_after: Optional[int] = None

class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    closed_by: Optional[str] = None
    labels: Optional[Dict[str, str]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    incident_id: Optional[str] = None
    correlation_id: Optional[str] = None

class AlertQuery(BaseModel):
    status: Optional[AlertStatus] = None
    severity: Optional[AlertSeverity] = None
    alert_type: Optional[AlertType] = None
    source: Optional[str] = None
    service: Optional[str] = None
    environment: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    tags: Optional[List[str]] = None
    limit: Optional[int] = Field(None, ge=1, le=1000)
    offset: Optional[int] = Field(None, ge=0)
    sort_by: Optional[str] = "triggered_at"
    sort_order: Optional[str] = "desc"

class AlertStats(BaseModel):
    total_alerts: int
    active_alerts: int
    acknowledged_alerts: int
    resolved_alerts: int
    closed_alerts: int
    alerts_by_severity: Dict[AlertSeverity, int]
    alerts_by_type: Dict[AlertType, int]
    alerts_by_status: Dict[AlertStatus, int]
    average_resolution_time: Optional[float] = None
    alerts_today: int
    alerts_this_week: int
    alerts_this_month: int

class AlertAction(BaseModel):
    action: str
    alert_id: str
    user_id: str
    comment: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlertCorrelation(BaseModel):
    id: str
    correlation_key: str
    alert_ids: List[str]
    created_at: datetime
    status: str
    pattern: Dict[str, Any]
    confidence: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
