import React from 'react';
import { DashboardCard } from '../dashboard/DashboardGrid';
import { CheckCircle, XCircle, AlertTriangle, Clock, Activity, Database, Server, Globe } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  response_time: number;
  uptime: number;
  last_check: string;
  endpoint: string;
}

interface ApplicationHealthProps {
  services: ServiceHealth[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  healthScore: number;
}

export const ApplicationHealth: React.FC<ApplicationHealthProps> = ({ 
  services, 
  overallHealth, 
  healthScore 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getOverallHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('database') || name.includes('db')) {
      return <Database className="w-4 h-4" />;
    } else if (name.includes('api') || name.includes('backend')) {
      return <Server className="w-4 h-4" />;
    } else if (name.includes('frontend') || name.includes('web')) {
      return <Globe className="w-4 h-4" />;
    } else {
      return <Activity className="w-4 h-4" />;
    }
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
            Overall System Health
          </h3>
          <div className={`text-2xl font-bold ${getOverallHealthColor(overallHealth)}`}>
            {overallHealth.toUpperCase()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Health Score</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
              {healthScore}%
            </p>
            <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Healthy Services</p>
            <p className="text-2xl font-bold text-green-600">{healthyServices}</p>
            <p className="text-sm text-charcoal-500">of {totalServices}</p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Status</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getStatusIcon(overallHealth)}
              <span className="font-medium capitalize">{overallHealth}</span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Service Health Details */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Service Health Details
        </h3>
        
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg border border-charcoal-200 dark:border-charcoal-700"
            >
              <div className="flex items-center gap-3">
                {getServiceIcon(service.name)}
                <div>
                  <h4 className="font-medium text-charcoal-900 dark:text-white">
                    {service.name}
                  </h4>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    {service.endpoint}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Response Time</p>
                  <p className="font-medium text-charcoal-900 dark:text-white">
                    {service.response_time}ms
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Uptime</p>
                  <p className="font-medium text-charcoal-900 dark:text-white">
                    {formatDuration(service.uptime)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Last Check</p>
                  <p className="font-medium text-charcoal-900 dark:text-white">
                    {new Date(service.last_check).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Health Metrics */}
      <DashboardCard>
        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
          Health Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Avg Response Time</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {Math.round(services.reduce((acc, s) => acc + s.response_time, 0) / services.length)}ms
            </p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Min Uptime</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {formatDuration(Math.min(...services.map(s => s.uptime)))}
            </p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Max Uptime</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {formatDuration(Math.max(...services.map(s => s.uptime)))}
            </p>
          </div>
          
          <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Last Updated</p>
            <p className="text-lg font-semibold text-charcoal-900 dark:text-white">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
