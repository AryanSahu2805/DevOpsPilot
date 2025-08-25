// src/components/dashboard/AlertsPanel.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Clock, Check, X } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  status: 'active' | 'resolved';
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityConfig = {
  high: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  }
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set(prev).add(alertId));
  };

  const handleResolve = (alertId: string) => {
    // In a real app, this would call an API to resolve the alert
    console.log(`Resolving alert: ${alertId}`);
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Alerts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeAlerts.length} active, {resolvedAlerts.length} resolved
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {activeAlerts.filter(a => a.severity === 'high').length} Critical
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            {activeAlerts.filter(a => a.severity === 'medium').length} Warning
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Systems Operational</h4>
            <p className="text-gray-600 dark:text-gray-400">No active alerts at this time.</p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const isAcknowledged = acknowledgedAlerts.has(alert.id);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} transition-all duration-200 ${
                  isAcknowledged ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </span>
                        {isAcknowledged && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.time}</span>
                        </span>
                        <span className={`capitalize px-2 py-0.5 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          alert.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Acknowledge Alert"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Resolve Alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {resolvedAlerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recently Resolved</h4>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 3).map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              
              return (
                <div key={alert.id} className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="flex-1">{alert.message}</span>
                  <span className="text-xs">{alert.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
