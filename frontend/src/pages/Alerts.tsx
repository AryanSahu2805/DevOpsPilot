import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Clock, 
  Filter, 
  Plus,
  Check,
  X
} from 'lucide-react';

interface Alert {
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
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'High CPU Usage',
    description: 'CPU usage has exceeded 85% for more than 5 minutes',
    severity: 'warning',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    last_triggered: '2024-01-15T10:30:00Z',
    trigger_count: 3,
    acknowledged: false,
    rule_id: 'cpu_rule_1'
  },
  {
    id: '2',
    name: 'Memory Usage Critical',
    description: 'Memory usage has reached 95%',
    severity: 'critical',
    status: 'active',
    created_at: '2024-01-15T09:15:00Z',
    last_triggered: '2024-01-15T09:15:00Z',
    trigger_count: 1,
    acknowledged: false,
    rule_id: 'memory_rule_1'
  },
  {
    id: '3',
    name: 'Disk Space Warning',
    description: 'Available disk space is below 20%',
    severity: 'warning',
    status: 'acknowledged',
    created_at: '2024-01-15T08:45:00Z',
    last_triggered: '2024-01-15T08:45:00Z',
    trigger_count: 2,
    acknowledged: true,
    acknowledged_at: '2024-01-15T09:00:00Z',
    rule_id: 'disk_rule_1'
  },
  {
    id: '4',
    name: 'Service Down',
    description: 'Database service is not responding',
    severity: 'critical',
    status: 'resolved',
    created_at: '2024-01-15T07:30:00Z',
    last_triggered: '2024-01-15T07:30:00Z',
    trigger_count: 1,
    acknowledged: true,
    acknowledged_at: '2024-01-15T07:45:00Z',
    resolved_at: '2024-01-15T08:00:00Z',
    rule_id: 'service_rule_1'
  }
];

export const Alerts: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all'
  });
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    return true;
  });

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledged_at: new Date().toISOString() }
        : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', resolved_at: new Date().toISOString() }
        : alert
    ));
  };

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    critical: alerts.filter(a => a.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage system alerts and notifications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Alert Rule</span>
        </button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Alerts</h3>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{alertStats.total}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active</h3>
            <p className="text-3xl font-bold text-orange-600">{alertStats.active}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{alertStats.acknowledged}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Critical</h3>
            <p className="text-3xl font-bold text-red-600">{alertStats.critical}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        
        <select
          value={filters.severity}
          onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
        
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {alert.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Triggered {new Date(alert.last_triggered).toLocaleString()}</span>
                    </span>
                    <span>Count: {alert.trigger_count}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
                
                {alert.status === 'active' && !alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Acknowledge Alert"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                {alert.status === 'active' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Resolve Alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
