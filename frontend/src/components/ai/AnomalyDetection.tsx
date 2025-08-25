import React, { useState } from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { ChartWidget } from '../dashboard/ChartWidget';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, HardDrive, Wifi } from 'lucide-react';
import { formatDateTime, formatPercentage } from '../../utils/formatters';

interface Anomaly {
  id: string;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'trend_change' | 'seasonal_break';
  timestamp: string;
  value: number;
  expected_value: number;
  deviation: number;
  confidence: number;
  description: string;
  recommendations: string[];
}

interface AnomalyDetectionProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Mock data will be replaced with real-time API calls
const mockAnomalies: Anomaly[] = [];

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  anomalies = mockAnomalies,
  isLoading = false,
  onRefresh
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAnomalies = severityFilter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.severity === severityFilter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-800 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-800 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-4 h-4" />;
      case 'drop':
        return <TrendingDown className="w-4 h-4" />;
      case 'trend_change':
        return <Activity className="w-4 h-4" />;
      case 'seasonal_break':
        return <HardDrive className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    const name = metric.toLowerCase();
    if (name.includes('cpu')) {
      return <Activity className="w-4 h-4" />;
    } else if (name.includes('memory')) {
      return <HardDrive className="w-4 h-4" />;
    } else if (name.includes('network')) {
      return <Wifi className="w-4 h-4" />;
    } else {
      return <Activity className="w-4 h-4" />;
    }
  };

  const anomalyStats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length
  };

  const chartData = anomalies.slice(-10).map(anomaly => ({
    name: new Date(anomaly.timestamp).toLocaleTimeString(),
    value: anomaly.value,
    expected: anomaly.expected_value,
    deviation: anomaly.deviation
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">
            Anomaly Detection
          </h2>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            AI-powered detection of unusual patterns and anomalies in system metrics
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Analysis
        </button>
      </div>

      {/* Anomaly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Total Anomalies</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{anomalyStats.total}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Critical</p>
            <p className="text-2xl font-bold text-red-600">{anomalyStats.critical}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">High</p>
            <p className="text-2xl font-bold text-orange-600">{anomalyStats.high}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Medium</p>
            <p className="text-2xl font-bold text-yellow-600">{anomalyStats.medium}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Low</p>
            <p className="text-2xl font-bold text-blue-600">{anomalyStats.low}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Anomaly Trends Chart */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Anomaly Trends
        </h3>
        <ChartWidget
          data={chartData}
          title="Recent Anomalies vs Expected Values"
          type="bar"
          height={300}
          xAxisDataKey="name"
          yAxisDataKey="value"
        />
      </DashboardCard>

      {/* Filters */}
      <DashboardCard>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Filter by Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </DashboardCard>

      {/* Anomalies List */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Detected Anomalies ({filteredAnomalies.length})
        </h3>
        
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg border border-charcoal-200 dark:border-charcoal-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors cursor-pointer"
              onClick={() => setSelectedAnomaly(anomaly)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(anomaly.severity)}
                  {getTypeIcon(anomaly.type)}
                  {getMetricIcon(anomaly.metric)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-charcoal-900 dark:text-white">
                      {anomaly.metric}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-charcoal-500">
                      {anomaly.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                    {anomaly.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal-500">Current Value:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {anomaly.value}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Expected:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {anomaly.expected_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Deviation:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {formatPercentage(anomaly.deviation)}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Confidence:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {formatPercentage(anomaly.confidence * 100)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-charcoal-500">
                    Detected: {formatDateTime(anomaly.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAnomalies.length === 0 && (
            <div className="text-center py-8 text-charcoal-500">
              No anomalies found matching the current filters.
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Anomaly Detail Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
                Anomaly Details
              </h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Metric</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">{selectedAnomaly.metric}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Severity</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedAnomaly.severity)}`}>
                    {selectedAnomaly.severity.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Type</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400 capitalize">
                    {selectedAnomaly.type.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Confidence</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">
                    {formatPercentage(selectedAnomaly.confidence * 100)}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Description</h4>
                <p className="text-charcoal-600 dark:text-charcoal-400">{selectedAnomaly.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 dark:text-charcoal-400">
                  {selectedAnomaly.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="text-xs text-charcoal-500">
                Detected at: {formatDateTime(selectedAnomaly.timestamp)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
