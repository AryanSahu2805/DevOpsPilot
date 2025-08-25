// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ChartWidget } from '../components/dashboard/ChartWidget';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';
import { 
  Cpu,
  HardDrive,
  Network,
  Users,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time metrics data
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    alerts: 0,
    deployments: 0,
    uptime: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
        memory: Math.floor(Math.random() * 25) + 45, // 45-70%
        disk: Math.floor(Math.random() * 20) + 30, // 30-50%
        network: Math.floor(Math.random() * 40) + 10, // 10-50%
        activeUsers: Math.floor(Math.random() * 50) + 25, // 25-75
        alerts: Math.floor(Math.random() * 10) + 2, // 2-12
        deployments: Math.floor(Math.random() * 5) + 1, // 1-6
        uptime: Math.floor(Math.random() * 10) + 95 // 95-105%
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

  const alertsData = [
    { id: '1', severity: 'high' as const, message: 'CPU usage exceeded 80%', time: '2 min ago', status: 'active' as const },
    { id: '2', severity: 'medium' as const, message: 'Memory usage at 75%', time: '5 min ago', status: 'active' as const },
    { id: '3', severity: 'low' as const, message: 'Disk space at 85%', time: '10 min ago', status: 'resolved' as const },
    { id: '4', severity: 'high' as const, message: 'Service response time > 2s', time: '15 min ago', status: 'active' as const }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time system monitoring and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center space-x-2"
          >
            <Zap className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={`${metrics.cpu}%`}
          change="+2.5%"
          changeType="increase"
          icon={Cpu}
          color="emerald"
        />
        <MetricCard
          title="Memory Usage"
          value={`${metrics.memory}%`}
          change="+1.2%"
          changeType="increase"
          icon={HardDrive}
          color="blue"
        />
        <MetricCard
          title="Network I/O"
          value={`${metrics.network} MB/s`}
          change="-0.8%"
          changeType="decrease"
          icon={Network}
          color="purple"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change="+12"
          changeType="increase"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
          <ChartWidget
            type="line"
            data={chartData}
            title="Resource Usage Over Time"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="cpu"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deployment Status</h3>
          <ChartWidget
            type="bar"
            data={[
              { name: 'Production', value: 12, status: 'healthy' },
              { name: 'Staging', value: 8, status: 'warning' },
              { name: 'Development', value: 15, status: 'healthy' },
              { name: 'Testing', value: 6, status: 'error' }
            ]}
            title="Active Deployments"
            height={300}
            xAxisDataKey="name"
            yAxisDataKey="value"
          />
        </div>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsPanel alerts={alertsData} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Deploy New Version
            </button>
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Scale Services
            </button>
            <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              Run Health Check
            </button>
            <button className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
