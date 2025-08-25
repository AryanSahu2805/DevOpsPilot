export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  last_triggered: string;
  trigger_count: number;
  acknowledged: boolean;
  acknowledged_at?: string;
  resolved_at?: string;
  rule_id: string;
  metrics?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
  threshold?: number;
  time_window?: number;
  notification_channels?: string[];
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
}

export interface AlertQuery {
  status?: string;
  severity?: string;
  timeRange?: string;
  limit?: number;
  offset?: number;
}

export interface AlertAction {
  id: string;
  alert_id: string;
  action_type: 'acknowledge' | 'resolve' | 'escalate';
  user_id: string;
  timestamp: string;
  notes?: string;
}
