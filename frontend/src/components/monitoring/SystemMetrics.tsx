import React from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { ChartWidget } from '../dashboard/ChartWidget';
import { formatBytes, formatPercentage } from '../../utils/formatters';
import { Activity, HardDrive, Wifi, Server } from 'lucide-react';

interface SystemMetricsProps {
  data: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    timestamp: string;
  };
  historicalData: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  }>;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ data, historicalData }) => {
  const chartData = historicalData.map(item => ({
    name: new Date(item.timestamp).toLocaleTimeString(),
    cpu: item.cpu,
    memory: item.memory,
    network: item.network
  }));

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400">
                CPU Usage
              </p>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {formatPercentage(data.cpu)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.cpu}%` }}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400">
                Memory Usage
              </p>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {formatPercentage(data.memory)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
              <HardDrive className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.memory}%` }}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400">
                Disk Usage
              </p>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {formatPercentage(data.disk)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
              <Server className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.disk}%` }}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400">
                Network I/O
              </p>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {formatBytes(data.network)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
              <Wifi className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
              Active connections
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard>
          <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
            Resource Usage Over Time
          </h3>
          <ChartWidget
            data={chartData.map(item => ({ ...item, value: item.cpu }))}
            title="CPU & Memory Trends"
            type="line"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="value"
          />
        </DashboardCard>

        <DashboardCard>
          <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
            Network Performance
          </h3>
          <ChartWidget
            data={chartData.map(item => ({ ...item, value: item.network }))}
            title="Network I/O Over Time"
            type="line"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="value"
          />
        </DashboardCard>
      </div>

      {/* Metrics Summary */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Peak CPU</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {formatPercentage(Math.max(...historicalData.map(d => d.cpu)))}
            </p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Peak Memory</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {formatPercentage(Math.max(...historicalData.map(d => d.memory)))}
            </p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Peak Network</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {formatBytes(Math.max(...historicalData.map(d => d.network)))}
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
