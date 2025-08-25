export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  response_time: number;
  timestamp: string;
}

export interface MetricsData {
  current: SystemMetrics;
  historical: SystemMetrics[];
  summary: {
    avg_cpu: number;
    avg_memory: number;
    avg_disk: number;
    peak_cpu: number;
    peak_memory: number;
    peak_disk: number;
  };
}

export interface DashboardMetrics {
  system_health: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    uptime: number;
  };
  resource_usage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  performance: {
    response_time: number;
    throughput: number;
    error_rate: number;
  };
  alerts: {
    active: number;
    critical: number;
    warning: number;
  };
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartData {
  name: string;
  data: TimeSeriesData[];
  color?: string;
}

export interface MetricsQuery {
  metric: string;
  timeRange: string;
  interval?: string;
  filters?: Record<string, any>;
}
