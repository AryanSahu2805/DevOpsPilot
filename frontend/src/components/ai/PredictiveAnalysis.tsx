import React, { useState } from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { ChartWidget } from '../dashboard/ChartWidget';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TrendingUp, TrendingDown, Activity, HardDrive, Wifi, Calendar, BarChart3 } from 'lucide-react';
import { formatDateTime, formatPercentage } from '../../utils/formatters';

interface Prediction {
  id: string;
  metric: string;
  current_value: number;
  predicted_value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  time_horizon: string;
  prediction_date: string;
  factors: string[];
  recommendations: string[];
}

interface PredictiveAnalysisProps {
  predictions: Prediction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Mock data will be replaced with real-time API calls
const mockPredictions: Prediction[] = [];

export const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({
  predictions = mockPredictions,
  isLoading = false,
  onRefresh
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [timeHorizonFilter, setTimeHorizonFilter] = useState<string>('all');
  const [trendFilter, setTrendFilter] = useState<string>('all');

  const filteredPredictions = predictions.filter(prediction => {
    if (timeHorizonFilter !== 'all' && prediction.time_horizon !== timeHorizonFilter) return false;
    if (trendFilter !== 'all' && prediction.trend !== trendFilter) return false;
    return true;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'stable':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 bg-red-50 dark:bg-red-800 dark:text-red-300';
      case 'decreasing':
        return 'text-green-600 bg-green-50 dark:bg-green-800 dark:text-green-300';
      case 'stable':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-800 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300';
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
    } else if (name.includes('disk')) {
      return <HardDrive className="w-4 h-4" />;
    } else {
      return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const predictionStats = {
    total: predictions.length,
    increasing: predictions.filter(p => p.trend === 'increasing').length,
    decreasing: predictions.filter(p => p.trend === 'decreasing').length,
    stable: predictions.filter(p => p.trend === 'stable').length,
    high_confidence: predictions.filter(p => p.confidence >= 0.8).length
  };

  const chartData = predictions.slice(-10).map(prediction => ({
    name: prediction.metric,
    current: prediction.current_value,
    predicted: prediction.predicted_value,
    confidence: prediction.confidence * 100
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
            Predictive Analysis
          </h2>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            AI-powered predictions and forecasting for system metrics
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Predictions
        </button>
      </div>

      {/* Prediction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Total Predictions</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{predictionStats.total}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Increasing</p>
            <p className="text-2xl font-bold text-red-600">{predictionStats.increasing}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Decreasing</p>
            <p className="text-2xl font-bold text-green-600">{predictionStats.decreasing}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Stable</p>
            <p className="text-2xl font-bold text-blue-600">{predictionStats.stable}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="text-center">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">High Confidence</p>
            <p className="text-2xl font-bold text-emerald-600">{predictionStats.high_confidence}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Prediction Trends Chart */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Current vs Predicted Values
        </h3>
        <ChartWidget
          data={chartData.map(item => ({ ...item, value: item.predicted }))}
          title="Metric Predictions"
          type="line"
          height={300}
          xAxisDataKey="name"
          yAxisDataKey="value"
        />
      </DashboardCard>

      {/* Filters */}
      <DashboardCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-charcoal-500" />
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Time Horizon:</span>
            <select
              value={timeHorizonFilter}
              onChange={(e) => setTimeHorizonFilter(e.target.value)}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="all">All Horizons</option>
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-charcoal-500" />
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Trend:</span>
            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value)}
              className="px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
            >
              <option value="all">All Trends</option>
              <option value="increasing">Increasing</option>
              <option value="decreasing">Decreasing</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Predictions List */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Metric Predictions ({filteredPredictions.length})
        </h3>
        
        <div className="space-y-3">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className="p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg border border-charcoal-200 dark:border-charcoal-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors cursor-pointer"
              onClick={() => setSelectedPrediction(prediction)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {getMetricIcon(prediction.metric)}
                  {getTrendIcon(prediction.trend)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-charcoal-900 dark:text-white">
                      {prediction.metric}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendColor(prediction.trend)}`}>
                      {prediction.trend.toUpperCase()}
                    </span>
                    <span className="text-xs text-charcoal-500">
                      {prediction.time_horizon}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-charcoal-500">Current:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {prediction.current_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Predicted:</span>
                      <span className="ml-2 font-medium text-charcoal-900 dark:text-white">
                        {prediction.predicted_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Change:</span>
                      <span className={`ml-2 font-medium ${
                        prediction.predicted_value > prediction.current_value ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {prediction.predicted_value > prediction.current_value ? '+' : ''}
                        {((prediction.predicted_value - prediction.current_value) / prediction.current_value * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Confidence:</span>
                      <span className={`ml-2 font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {formatPercentage(prediction.confidence * 100)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-charcoal-500">
                    Predicted: {formatDateTime(prediction.prediction_date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPredictions.length === 0 && (
            <div className="text-center py-8 text-charcoal-500">
              No predictions found matching the current filters.
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Prediction Detail Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
                Prediction Details
              </h3>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Metric</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">{selectedPrediction.metric}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Trend</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendColor(selectedPrediction.trend)}`}>
                    {selectedPrediction.trend.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Time Horizon</h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">{selectedPrediction.time_horizon}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Confidence</h4>
                  <p className={`${getConfidenceColor(selectedPrediction.confidence)}`}>
                    {formatPercentage(selectedPrediction.confidence * 100)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Current Value</h4>
                  <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                    {selectedPrediction.current_value}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Predicted Value</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedPrediction.predicted_value}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Key Factors</h4>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 dark:text-charcoal-400">
                  {selectedPrediction.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 dark:text-charcoal-400">
                  {selectedPrediction.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="text-xs text-charcoal-500">
                Prediction made at: {formatDateTime(selectedPrediction.prediction_date)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
