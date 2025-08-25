import React, { useState } from 'react';
import { AnomalyDetection } from '../components/ai/AnomalyDetection';
import { PredictiveAnalysis } from '../components/ai/PredictiveAnalysis';
import { AIInsights } from '../components/ai/AIInsights';
import { Brain, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';

const AI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'anomalies' | 'predictions'>('insights');

  // Mock data for development
  const mockInsights = [
    {
      id: '1',
      title: 'Unusual CPU spike detected',
      description: 'CPU usage increased by 40% in the last 5 minutes',
      type: 'anomaly' as const,
      severity: 'warning' as const,
      confidence: 0.85,
      timestamp: '2024-01-15T10:30:00Z',
      impact: 'medium' as const,
      effort: 'low' as const,
      recommendations: ['Check for background processes', 'Monitor memory usage'],
      metrics_affected: ['CPU Usage', 'Response Time'],
      estimated_savings: '$50/month',
      priority_score: 75
    },
    {
      id: '2',
      title: 'Memory optimization opportunity',
      description: 'Memory usage can be reduced by 15% through configuration changes',
      type: 'optimization' as const,
      severity: 'info' as const,
      confidence: 0.92,
      timestamp: '2024-01-15T10:25:00Z',
      impact: 'low' as const,
      effort: 'medium' as const,
      recommendations: ['Adjust JVM heap size', 'Review cache settings'],
      metrics_affected: ['Memory Usage', 'Performance'],
      estimated_savings: '$30/month',
      priority_score: 65
    }
  ];

  const mockAnomalies = [
    {
      id: '1',
      metric: 'CPU Usage',
      severity: 'high' as const,
      type: 'spike' as const,
      timestamp: '2024-01-15T10:30:00Z',
      value: 85.2,
      expected_value: 45.0,
      deviation: 89.3,
      confidence: 0.89,
      description: 'Unusual CPU spike detected - 89% above expected value',
      recommendations: ['Check for runaway processes', 'Investigate recent deployments']
    },
    {
      id: '2',
      metric: 'Memory Usage',
      severity: 'critical' as const,
      type: 'trend_change' as const,
      timestamp: '2024-01-15T10:25:00Z',
      value: 92.1,
      expected_value: 68.0,
      deviation: 35.4,
      confidence: 0.92,
      description: 'Memory usage trend has changed significantly',
      recommendations: ['Monitor memory growth pattern', 'Check for memory leaks']
    }
  ];

  const mockPredictions = [
    {
      id: '1',
      metric: 'CPU Usage',
      current_value: 45.2,
      predicted_value: 78.5,
      confidence: 0.87,
      trend: 'increasing' as const,
      time_horizon: '1h',
      prediction_date: '2024-01-15T10:30:00Z',
      factors: ['Recent deployment increased load', 'User activity patterns show growth'],
      recommendations: ['Scale CPU resources proactively', 'Monitor deployment impact']
    },
    {
      id: '2',
      metric: 'Memory Usage',
      current_value: 68.1,
      predicted_value: 89.2,
      confidence: 0.92,
      trend: 'increasing' as const,
      time_horizon: '2h',
      prediction_date: '2024-01-15T10:25:00Z',
      factors: ['Gradual memory growth trend', 'New features consuming more memory'],
      recommendations: ['Monitor memory growth rate', 'Review memory allocation patterns']
    }
  ];

  const tabs = [
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Lightbulb,
      description: 'Intelligent recommendations and automated analysis'
    },
    {
      id: 'anomalies',
      label: 'Anomaly Detection',
      icon: AlertTriangle,
      description: 'AI-powered anomaly detection and alerting'
    },
    {
      id: 'predictions',
      label: 'Predictive Analysis',
      icon: TrendingUp,
      description: 'Forecast trends and predict future issues'
    }
  ];

  const handleInsightAction = (insightId: string, action: string) => {
    console.log(`Action ${action} on insight ${insightId}`);
    // TODO: Implement insight actions
  };

  const handleRefreshInsights = () => {
    console.log('Refreshing AI insights');
    // TODO: Implement refresh logic
  };

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
              <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white">
                AI & Machine Learning
              </h1>
              <p className="text-charcoal-600 dark:text-charcoal-400">
                Leverage artificial intelligence for proactive monitoring and intelligent insights
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-charcoal-200 dark:border-charcoal-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300 dark:text-charcoal-400 dark:hover:text-charcoal-300 dark:hover:border-charcoal-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'insights' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-white mb-2">
                  AI Insights Dashboard
                </h2>
                <p className="text-charcoal-600 dark:text-charcoal-400">
                  {tabs.find(t => t.id === 'insights')?.description}
                </p>
              </div>
              <AIInsights
                insights={mockInsights}
                onAction={handleInsightAction}
                onRefresh={handleRefreshInsights}
              />
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-white mb-2">
                  Anomaly Detection
                </h2>
                <p className="text-charcoal-600 dark:text-charcoal-400">
                  {tabs.find(t => t.id === 'anomalies')?.description}
                </p>
              </div>
              <AnomalyDetection anomalies={mockAnomalies} />
            </div>
          )}

          {activeTab === 'predictions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-white mb-2">
                  Predictive Analysis
                </h2>
                <p className="text-charcoal-600 dark:text-charcoal-400">
                  {tabs.find(t => t.id === 'predictions')?.description}
                </p>
              </div>
              <PredictiveAnalysis predictions={mockPredictions} />
            </div>
          )}
        </div>

        {/* AI Status Footer */}
        <div className="mt-12 pt-8 border-t border-charcoal-200 dark:border-charcoal-700">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                  AI Engine Status: Active
                </span>
              </div>
              <div className="text-sm text-charcoal-500 dark:text-charcoal-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-charcoal-500 dark:text-charcoal-400">Models Active:</span>
                <span className="ml-2 font-medium text-charcoal-900 dark:text-white">4/4</span>
              </div>
              <div>
                <span className="text-charcoal-500 dark:text-charcoal-400">Training Status:</span>
                <span className="ml-2 font-medium text-green-600">Up to date</span>
              </div>
              <div>
                <span className="text-charcoal-500 dark:text-charcoal-400">Accuracy:</span>
                <span className="ml-2 font-medium text-charcoal-900 dark:text-white">94.2%</span>
              </div>
              <div>
                <span className="text-charcoal-500 dark:text-charcoal-400">Response Time:</span>
                <span className="ml-2 font-medium text-charcoal-900 dark:text-white">~150ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
