from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum

class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class MetricUnit(str, Enum):
    PERCENT = "percent"
    BYTES = "bytes"
    SECONDS = "seconds"
    COUNT = "count"
    REQUESTS_PER_SECOND = "requests_per_second"
    MILLISECONDS = "milliseconds"
    MEGABYTES = "megabytes"
    GIGABYTES = "gigabytes"
    UNITS = "units"

class SystemMetrics(BaseModel):
    timestamp: datetime
    cpu_usage: float = Field(..., ge=0, le=100)
    memory_usage: float = Field(..., ge=0, le=100)
    disk_usage: float = Field(..., ge=0, le=100)
    network_in: float = Field(..., ge=0)
    network_out: float = Field(..., ge=0)
    disk_io_read: float = Field(..., ge=0)
    disk_io_write: float = Field(..., ge=0)
    load_average_1m: float = Field(..., ge=0)
    load_average_5m: float = Field(..., ge=0)
    load_average_15m: float = Field(..., ge=0)
    uptime: float = Field(..., ge=0)
    temperature: Optional[float] = None
    power_consumption: Optional[float] = None

class ApplicationMetrics(BaseModel):
    timestamp: datetime
    service_name: str
    response_time: float = Field(..., ge=0)
    throughput: float = Field(..., ge=0)
    error_rate: float = Field(..., ge=0, le=100)
    active_connections: int = Field(..., ge=0)
    queue_length: int = Field(..., ge=0)
    memory_usage: float = Field(..., ge=0, le=100)
    cpu_usage: float = Field(..., ge=0, le=100)
    status: str = "healthy"
    version: Optional[str] = None
    environment: Optional[str] = None

class DatabaseMetrics(BaseModel):
    timestamp: datetime
    database_name: str
    active_connections: int = Field(..., ge=0)
    query_time: float = Field(..., ge=0)
    slow_queries: int = Field(..., ge=0)
    deadlocks: int = Field(..., ge=0)
    cache_hit_ratio: float = Field(..., ge=0, le=100)
    storage_used: float = Field(..., ge=0)
    storage_available: float = Field(..., ge=0)
    replication_lag: Optional[float] = None

class NetworkMetrics(BaseModel):
    timestamp: datetime
    interface: str
    bytes_in: float = Field(..., ge=0)
    bytes_out: float = Field(..., ge=0)
    packets_in: int = Field(..., ge=0)
    packets_out: int = Field(..., ge=0)
    errors_in: int = Field(..., ge=0)
    errors_out: int = Field(..., ge=0)
    dropped_in: int = Field(..., ge=0)
    dropped_out: int = Field(..., ge=0)
    bandwidth_utilization: float = Field(..., ge=0, le=100)

class MetricsData(BaseModel):
    id: str
    timestamp: datetime
    metric_type: MetricType
    metric_name: str
    value: float
    unit: MetricUnit
    labels: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    source: str
    service: Optional[str] = None
    environment: Optional[str] = None

class MetricsQuery(BaseModel):
    metric_name: Optional[str] = None
    metric_type: Optional[MetricType] = None
    service: Optional[str] = None
    environment: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    interval: Optional[str] = None
    limit: Optional[int] = Field(None, ge=1, le=10000)
    offset: Optional[int] = Field(None, ge=0)
    aggregation: Optional[str] = None
    group_by: Optional[List[str]] = None

class MetricsAggregation(BaseModel):
    metric_name: str
    aggregation_type: str
    value: float
    count: int
    min_value: float
    max_value: float
    avg_value: float
    timestamp: datetime
    labels: Dict[str, str] = Field(default_factory=dict)

class TimeSeriesData(BaseModel):
    metric_name: str
    timestamps: List[datetime]
    values: List[float]
    labels: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DashboardMetrics(BaseModel):
    system_overview: SystemMetrics
    application_metrics: List[ApplicationMetrics]
    database_metrics: List[DatabaseMetrics]
    network_metrics: List[NetworkMetrics]
    last_updated: datetime
    refresh_interval: int = 30

class MetricsHealth(BaseModel):
    overall_status: str
    critical_metrics: List[str]
    warning_metrics: List[str]
    healthy_metrics: List[str]
    last_check: datetime
    next_check: datetime
    issues_count: int
    recommendations: List[str] = Field(default_factory=list)

class MetricsExport(BaseModel):
    format: str = "json"
    metrics: List[MetricsData]
    export_timestamp: datetime
    query_parameters: MetricsQuery
    total_count: int
