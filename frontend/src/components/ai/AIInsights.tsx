import React, { useState } from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'anomaly' | 'trend' | 'optimization' | 'capacity' | 'security' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  timestamp: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  recommendations: string[];
  metrics_affected: string[];
  estimated_savings?: string;
  priority_score: number;
}

interface AIInsightsProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAction?: (insightId: string, action: string) => void;
}

// Mock data will be replaced with real-time API calls
const mockInsights: AIInsight[] = [];

export const AIInsights: React.FC<AIInsightsProps> = ({
  insights = mockInsights,
  isLoading = false,
  onRefresh,
  onAction
}) => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'timestamp' | 'confidence'>('priority');

  const filteredInsights = insights.filter(insight => {
    if (typeFilter !== 'all' && insight.type !== typeFilter) return false;
    if (severityFilter !== 'all' && insight.severity !== severityFilter) return false;
    return true;
  });

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.priority_score - a.priority_score;
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'confidence':
        return b.confidence - a.confidence;
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'optimization':
        return <Zap className="w-4 h-4" />;
      case 'capacity':
        return <Target className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'performance':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'anomaly':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'trend':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'optimization':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'capacity':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'security':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'performance':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const insightStats = {
    total: insights.length,
    critical: insights.filter(i => i.severity === 'critical').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    info: insights.filter(i => i.severity === 'info').length,
    high_impact: insights.filter(i => i.impact === 'high').length
  };

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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">
              AI Insights
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Intelligent recommendations and automated analysis
            </p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Insights
        </button>
      </div>

      {/* Insight Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Total Insights</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{insightStats.total}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Critical</p>
            <p className="text-2xl font-bold text-red-600">{insightStats.critical}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">High Impact</p>
            <p className="text-2xl font-bold text-orange-600">{insightStats.high_impact}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Optimization</p>
            <p className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'optimization').length}
            </p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Avg Confidence</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)}%
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Filters and Sorting */}
      <DashboardCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="anomaly">Anomaly</option>
              <option value="trend">Trend</option>
              <option value="optimization">Optimization</option>
              <option value="capacity">Capacity</option>
              <option value="security">Security</option>
              <option value="performance">Performance</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'timestamp' | 'confidence')}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="priority">Priority Score</option>
              <option value="timestamp">Timestamp</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Insights List */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          AI-Generated Insights ({sortedInsights.length})
        </h3>
        
        <div className="space-y-3">
          {sortedInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg border border-charcoal-200 dark:border-charcoal-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(insight.type)}
                  {getSeverityIcon(insight.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-charcoal-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(insight.type)}`}>
                      {insight.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                      {insight.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-charcoal-500">Priority:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {insight.priority_score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Confidence:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Impact:</span>
                      <span className={`ml-2 font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Effort:</span>
                      <span className={`ml-2 font-medium ${getEffortColor(insight.effort)}`}>
                        {insight.effort}
                      </span>
                    </div>
                    {insight.estimated_savings && (
                      <div>
                        <span className="text-charcoal-500">Savings:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {insight.estimated_savings}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-charcoal-500">
                    <span>Generated: {formatRelativeTime(insight.timestamp)}</span>
                    <span>Metrics: {insight.metrics_affected.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {sortedInsights.length === 0 && (
            <div className="text-center py-8 text-charcoal-500">
              No insights found matching the current filters.
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
                Insight Details
              </h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Type</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedInsight.type)}`}>
                    {selectedInsight.type}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Severity</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedInsight.severity)}`}>
                    {selectedInsight.severity}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Priority Score</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">{selectedInsight.priority_score}/100</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Confidence</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">{Math.round(selectedInsight.confidence * 100)}%</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Impact</h4>
                  <p className={`${getImpactColor(selectedInsight.impact)}`}>{selectedInsight.impact}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Effort</h4>
                  <p className={`${getEffortColor(selectedInsight.effort)}`}>{selectedInsight.effort}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Description</h4>
                <p className="text-charcoal-600 dark:text-charcoal-400">{selectedInsight.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Metrics Affected</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.metrics_affected.map((metric, index) => (
                    <span key={index} className="px-2 py-1 bg-charcoal-100 dark:bg-charcoal-700 rounded text-xs text-charcoal-700 dark:text-charcoal-300">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedInsight.estimated_savings && (
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Estimated Savings</h4>
                  <p className="text-green-600 font-medium">{selectedInsight.estimated_savings}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 dark:text-charcoal-400">
                  {selectedInsight.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="text-xs text-charcoal-500">
                Generated at: {formatDateTime(selectedInsight.timestamp)}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-charcoal-200 dark:border-charcoal-700">
                <button
                  onClick={() => onAction?.(selectedInsight.id, 'implement')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Implement
                </button>
                <button
                  onClick={() => onAction?.(selectedInsight.id, 'schedule')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Schedule
                </button>
                <button
                  onClick={() => onAction?.(selectedInsight.id, 'dismiss')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
