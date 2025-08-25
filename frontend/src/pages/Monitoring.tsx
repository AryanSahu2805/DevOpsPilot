import React, { useState, useEffect } from 'react';
import { ChartWidget } from '../components/dashboard/ChartWidget';
import { 
  Clock, 
  Activity, 
  HardDrive, 
  Wifi, 
  Server, 
  Cpu,
  HardDriveIcon,
  Database,
  Network
} from 'lucide-react';

export const Monitoring: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState('30s');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time monitoring data
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    activeConnections: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        cpu: Math.floor(Math.random() * 40) + 15, // 15-55%
        memory: Math.floor(Math.random() * 35) + 40, // 40-75%
        disk: Math.floor(Math.random() * 25) + 35, // 35-60%
        network: Math.floor(Math.random() * 50) + 20, // 20-70%
        uptime: Math.floor(Math.random() * 20) + 90, // 90-110%
        activeConnections: Math.floor(Math.random() * 100) + 50 // 50-150
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const chartData = [
    { name: '00:00', cpu: 25, memory: 60, network: 15 },
    { name: '04:00', cpu: 30, memory: 65, network: 20 },
    { name: '08:00', cpu: 45, memory: 70, network: 35 },
    { name: '12:00', cpu: 55, memory: 75, network: 45 },
    { name: '16:00', cpu: 50, memory: 72, network: 40 },
    { name: '20:00', cpu: 35, memory: 68, network: 25 },
    { name: '24:00', cpu: 28, memory: 62, network: 18 }
  ];

  const networkData = [
    { name: '00:00', value: 15 },
    { name: '04:00', value: 20 },
    { name: '08:00', value: 35 },
    { name: '12:00', value: 45 },
    { name: '16:00', value: 40 },
    { name: '20:00', value: 25 },
    { name: '24:00', value: 18 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system performance and resource monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Refresh Interval Selector */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="15s">15s</option>
              <option value="30s">30s</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center space-x-2"
          >
            <Activity className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU Usage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current load</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.cpu}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <HardDriveIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory Usage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">RAM utilization</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.memory}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Disk Usage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage capacity</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.disk}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Network className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network I/O</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data transfer</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.network} MB/s</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.network, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <Server className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uptime</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">System availability</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.uptime}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.uptime}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <Wifi className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Connections</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Network connections</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.activeConnections}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Peak: {Math.floor(metrics.activeConnections * 1.2)} connections
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Usage Over Time</h3>
          <ChartWidget
            type="line"
            data={chartData}
            title="CPU, Memory & Network Trends"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="cpu"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Performance</h3>
          <ChartWidget
            type="bar"
            data={networkData}
            title="Network I/O Over Time"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="value"
          />
        </div>
      </div>
    </div>
  );
};
