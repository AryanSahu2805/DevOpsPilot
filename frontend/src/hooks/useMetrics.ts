import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { apiClient } from '../services/api';
import { MetricsQuery } from '../types/metrics';
import { REFRESH_INTERVALS } from '../utils/constants';

export interface UseMetricsOptions {
  timeRange?: string;
  refreshInterval?: keyof typeof REFRESH_INTERVALS;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
}

export const useMetrics = (options: UseMetricsOptions = {}) => {
  const {
    timeRange = '24h',
    refreshInterval = '30s',
    autoRefresh = true,
    onError
  } = options;

  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Dashboard metrics query
  const dashboardQuery = useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: () => apiClient.get('/metrics/dashboard').then(res => res.data),
    refetchInterval: autoRefresh ? REFRESH_INTERVALS[refreshInterval] * 1000 : false,
    staleTime: 10000, // 10 seconds
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  // System metrics query
  const systemQuery = useQuery({
    queryKey: ['metrics', 'system', timeRange],
    queryFn: () => apiClient.get(`/metrics/system?timeRange=${timeRange}`).then(res => res.data),
    refetchInterval: autoRefresh ? REFRESH_INTERVALS[refreshInterval] * 1000 : false,
    staleTime: 5000, // 5 seconds
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  // Health check query
  const healthQuery = useQuery({
    queryKey: ['metrics', 'health'],
    queryFn: () => apiClient.get('/health').then(res => res.data),
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds
    staleTime: 15000, // 15 seconds
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  // Resource usage query
  const resourcesQuery = useQuery({
    queryKey: ['metrics', 'resources'],
    queryFn: () => apiClient.get('/metrics/resources').then(res => res.data),
    refetchInterval: autoRefresh ? 10000 : false, // 10 seconds
    staleTime: 5000, // 5 seconds
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  // Update last update timestamp when data changes
  useEffect(() => {
    if (dashboardQuery.data || systemQuery.data || resourcesQuery.data) {
      setLastUpdate(new Date());
    }
  }, [dashboardQuery.data, systemQuery.data, resourcesQuery.data]);

  // Manual refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  }, [queryClient]);

  // Refresh specific metric type
  const refreshMetric = useCallback((metricType: string) => {
    queryClient.invalidateQueries({ queryKey: ['metrics', metricType] });
  }, [queryClient]);

  // Get loading state
  const isLoading = dashboardQuery.isLoading || systemQuery.isLoading || healthQuery.isLoading || resourcesQuery.isLoading;

  // Get error state
  const error = dashboardQuery.error || systemQuery.error || healthQuery.error || resourcesQuery.error;

  // Get data
  const dashboardData = dashboardQuery.data;
  const systemData = systemQuery.data;
  const healthData = healthQuery.data;
  const resourcesData = resourcesQuery.data;

  // Check if any query is fetching
  const isFetching = dashboardQuery.isFetching || systemQuery.isFetching || healthQuery.isFetching || resourcesQuery.isFetching;

  // Check if any query is stale
  const isStale = dashboardQuery.isStale || systemQuery.isStale || healthQuery.isStale || resourcesQuery.isStale;

  return {
    // Data
    dashboardData,
    systemData,
    healthData,
    resourcesData,
    
    // State
    isLoading,
    isFetching,
    isStale,
    error,
    lastUpdate,
    
    // Actions
    refresh,
    refreshMetric,
    
    // Individual query states
    dashboardQuery: {
      isLoading: dashboardQuery.isLoading,
      isFetching: dashboardQuery.isFetching,
      error: dashboardQuery.error,
      data: dashboardQuery.data
    },
    systemQuery: {
      isLoading: systemQuery.isLoading,
      isFetching: systemQuery.isFetching,
      error: systemQuery.error,
      data: systemQuery.data
    },
    healthQuery: {
      isLoading: healthQuery.isLoading,
      isFetching: healthQuery.isFetching,
      error: healthQuery.error,
      data: healthQuery.data
    },
    resourcesQuery: {
      isLoading: resourcesQuery.isLoading,
      isFetching: resourcesQuery.isFetching,
      error: resourcesQuery.error,
      data: resourcesQuery.data
    }
  };
};

// Hook for specific metric queries
export const useMetricQuery = (query: MetricsQuery) => {
  return useQuery({
    queryKey: ['metrics', 'custom', query],
    queryFn: () => apiClient.get(`/metrics/custom?${new URLSearchParams(query as any)}`).then(res => res.data),
    staleTime: 10000,
    enabled: !!query.metric
  });
};

// Hook for real-time metrics updates
export const useRealTimeMetrics = (enabled: boolean = true) => {
  const [realTimeData, setRealTimeData] = useState<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiClient.get('/metrics/resources').then(res => res.data);
        setRealTimeData(data);
      } catch (error) {
        console.error('Error fetching real-time metrics:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  return realTimeData;
};
