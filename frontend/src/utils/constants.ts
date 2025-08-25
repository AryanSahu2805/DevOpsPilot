// API Configuration
export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const AUTH_TOKEN_KEY = 'devops_pilot_access_token';
export const REFRESH_TOKEN_KEY = 'devops_pilot_refresh_token';
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Time ranges for metrics
export const TIME_RANGES = {
  '1h': '1 Hour',
  '6h': '6 Hours',
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days'
} as const;

export type TimeRange = keyof typeof TIME_RANGES;

// Refresh intervals (in seconds)
export const REFRESH_INTERVALS = {
  '5s': 5,
  '15s': 15,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600
} as const;

export type RefreshInterval = keyof typeof REFRESH_INTERVALS;

// Severity levels
export const SEVERITY_LEVELS = {
  info: { label: 'Info', color: 'blue', icon: 'info' },
  warning: { label: 'Warning', color: 'yellow', icon: 'alert-triangle' },
  critical: { label: 'Critical', color: 'red', icon: 'alert-circle' }
} as const;

export type Severity = keyof typeof SEVERITY_LEVELS;

// Status types
export const STATUS_TYPES = {
  healthy: { label: 'Healthy', color: 'green', icon: 'check-circle' },
  warning: { label: 'Warning', color: 'yellow', icon: 'alert-triangle' },
  critical: { label: 'Critical', color: 'red', icon: 'x-circle' },
  unknown: { label: 'Unknown', color: 'gray', icon: 'help-circle' }
} as const;

export type Status = keyof typeof STATUS_TYPES;

// Chart colors
export const CHART_COLORS = {
  primary: '#10b981', // emerald-500
  secondary: '#6b7280', // gray-500
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  purple: '#8b5cf6', // violet-500
  orange: '#f97316', // orange-500
  teal: '#14b8a6', // teal-500
  pink: '#ec4899' // pink-500
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'devops_pilot_theme',
  LANGUAGE: 'devops_pilot_language',
  TIMEZONE: 'devops_pilot_timezone',
  DASHBOARD_LAYOUT: 'devops_pilot_dashboard_layout',
  USER_PREFERENCES: 'devops_pilot_user_preferences'
};

// Route paths
export const ROUTES = {
  DASHBOARD: '/',
  MONITORING: '/monitoring',
  ALERTS: '/alerts',
  DEPLOYMENTS: '/deployments',
  SETTINGS: '/settings',
  LOGIN: '/login',
  LOGOUT: '/logout'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.'
};

// Validation rules
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100
};

// Feature flags
export const FEATURE_FLAGS = {
  AI_INSIGHTS: true,
  REAL_TIME_MONITORING: true,
  ADVANCED_ALERTS: true,
  DEPLOYMENT_AUTOMATION: true,
  MULTI_TENANCY: false,
  SSO_INTEGRATION: false
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  CPU_WARNING: 80,
  CPU_CRITICAL: 95,
  MEMORY_WARNING: 85,
  MEMORY_CRITICAL: 95,
  DISK_WARNING: 80,
  DISK_CRITICAL: 90,
  RESPONSE_TIME_WARNING: 1000, // ms
  RESPONSE_TIME_CRITICAL: 5000 // ms
};
