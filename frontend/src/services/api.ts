// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Configuration
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = (error as any).response?.data?.error || (error as any).message || 'An error occurred';
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// API Service Classes
export class AuthService {
  static async login(email: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    user: any;
  }> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  static async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
}

export class MetricsService {
  static async getDashboardMetrics(): Promise<any> {
    const response = await apiClient.get('/metrics/dashboard');
    return response.data;
  }

  static async getSystemMetrics(timeRange: string = '1h'): Promise<any> {
    const response = await apiClient.get(`/metrics/system?range=${timeRange}`);
    return response.data;
  }

  static async getServiceHealth(): Promise<any> {
    const response = await apiClient.get('/metrics/health');
    return response.data;
  }

  static async getResourceUsage(): Promise<any> {
    const response = await apiClient.get('/metrics/resources');
    return response.data;
  }
}

export class AlertsService {
  static async getAlerts(page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get(`/alerts?page=${page}&limit=${limit}`);
    return response.data;
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    await apiClient.post(`/alerts/${alertId}/acknowledge`);
  }

  static async createAlertRule(rule: any): Promise<any> {
    const response = await apiClient.post('/alerts/rules', rule);
    return response.data;
  }

  static async getAlertRules(): Promise<any[]> {
    const response = await apiClient.get('/alerts/rules');
    return response.data;
  }
}

export class DeploymentsService {
  static async getDeployments(): Promise<any[]> {
    const response = await apiClient.get('/deployments');
    return response.data;
  }

  static async getDeploymentStatus(deploymentId: string): Promise<any> {
    const response = await apiClient.get(`/deployments/${deploymentId}/status`);
    return response.data;
  }

  static async triggerDeployment(config: any): Promise<any> {
    const response = await apiClient.post('/deployments/trigger', config);
    return response.data;
  }

  static async rollbackDeployment(deploymentId: string): Promise<any> {
    const response = await apiClient.post(`/deployments/${deploymentId}/rollback`);
    return response.data;
  }
}

export class AIService {
  static async getInsights(): Promise<any> {
    const response = await apiClient.get('/ai/insights');
    return response.data;
  }

  static async getPredictions(): Promise<any> {
    const response = await apiClient.get('/ai/predictions');
    return response.data;
  }

  static async getAnomalies(): Promise<any> {
    const response = await apiClient.get('/ai/anomalies');
    return response.data;
  }
}

// Main dashboard data fetcher
export const fetchDashboardData = async (): Promise<any> => {
  try {
    const [metrics, alerts, deployments] = await Promise.all([
      MetricsService.getDashboardMetrics(),
      AlertsService.getAlerts(1, 5),
      DeploymentsService.getDeployments(),
    ]);

    return {
      metrics,
      alerts: alerts.data,
      deployments,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Export the axios instance for custom requests
export { apiClient };

// Utility functions
export const handleApiError = (error: AxiosError): string => {
  if ((error as any).response?.data?.error) {
    return (error as any).response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const formatApiDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
