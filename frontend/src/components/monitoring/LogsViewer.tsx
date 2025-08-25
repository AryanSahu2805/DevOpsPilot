import React, { useState, useRef, useEffect } from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Search, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

interface LogsViewerProps {
  logs: LogEntry[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onFilterChange?: (filters: LogFilters) => void;
}

interface LogFilters {
  level: string[];
  service: string[];
  search: string;
  timeRange: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    level: 'info',
    service: 'frontend',
    message: 'User authentication successful',
    metadata: { user_id: '123', ip: '192.168.1.1' }
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:29:55Z',
    level: 'warning',
    service: 'backend',
    message: 'High memory usage detected',
    metadata: { memory_usage: '85%', threshold: '80%' }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:29:50Z',
    level: 'error',
    service: 'database',
    message: 'Connection timeout to primary database',
    metadata: { retry_count: 3, timeout_ms: 5000 }
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:29:45Z',
    level: 'debug',
    service: 'api',
    message: 'Processing API request',
    metadata: { endpoint: '/api/users', method: 'GET' }
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:29:40Z',
    level: 'critical',
    service: 'monitoring',
    message: 'System health check failed',
    metadata: { health_score: 45, services_down: 2 }
  }
];

export const LogsViewer: React.FC<LogsViewerProps> = ({
  logs = mockLogs,
  isLoading = false,
  onRefresh,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<LogFilters>({
    level: [],
    service: [],
    search: '',
    timeRange: '1h'
  });
  const [showMetadata, setShowMetadata] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const availableLevels = ['debug', 'info', 'warning', 'error', 'critical'];
  const availableServices = Array.from(new Set(logs.map(log => log.service)));

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filters.level.length > 0 && !filters.level.includes(log.level)) return false;
    if (filters.service.length > 0 && !filters.service.includes(log.service)) return false;
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });



  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critical':
        return 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleLevel = (level: string) => {
    const newLevels = filters.level.includes(level)
      ? filters.level.filter(l => l !== level)
      : [...filters.level, level];
    handleFilterChange('level', newLevels);
  };

  const toggleService = (service: string) => {
    const newServices = filters.service.includes(service)
      ? filters.service.filter(s => s !== service)
      : [...filters.service, service];
    handleFilterChange('service', newServices);
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Service,Message',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.service}","${log.message}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <DashboardCard>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-2">
            <select
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="p-2 text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors"
              title={showMetadata ? 'Hide Metadata' : 'Show Metadata'}
            >
              {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 border rounded-lg transition-colors ${
                autoScroll 
                  ? 'bg-emerald-100 text-emerald-600 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-400 dark:border-emerald-600'
                  : 'text-charcoal-600 dark:text-charcoal-400 border-charcoal-300 dark:border-charcoal-600 hover:bg-charcoal-50 dark:hover:bg-charcoal-800'
              }`}
              title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportLogs}
              className="p-2 text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors"
              title="Export Logs"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </DashboardCard>

      {/* Filters */}
      <DashboardCard>
        <div className="space-y-4">
          {/* Level Filters */}
          <div>
            <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Log Levels</h4>
            <div className="flex flex-wrap gap-2">
              {availableLevels.map(level => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.level.includes(level)
                      ? getLevelBgColor(level)
                      : 'bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-400 hover:bg-charcoal-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Service Filters */}
          <div>
            <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Services</h4>
            <div className="flex flex-wrap gap-2">
              {availableServices.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.service.includes(service)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-400 hover:bg-charcoal-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Logs Display */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
            Log Entries ({filteredLogs.length})
          </h3>
          <div className="text-sm text-charcoal-600 dark:text-charcoal-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg border border-charcoal-200 dark:border-charcoal-700"
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelBgColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400 mb-1">
                      <span className="font-mono">{formatDateTime(log.timestamp)}</span>
                      <span className="text-charcoal-400">•</span>
                      <span className="font-medium">{log.service}</span>
                    </div>
                    
                    <p className="text-charcoal-900 dark:text-white">{log.message}</p>
                    
                    {showMetadata && log.metadata && (
                      <div className="mt-2 p-2 bg-charcoal-100 dark:bg-charcoal-700 rounded text-xs font-mono text-charcoal-700 dark:text-charcoal-300">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-charcoal-500">
                No logs found matching the current filters.
              </div>
            )}
            
            <div ref={logsEndRef} />
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
