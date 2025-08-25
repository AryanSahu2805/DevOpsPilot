import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw, 
  GitBranch, 
  Tag, 
  User,
  Plus,
  Filter
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  service: string;
  environment: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled_back';
  version: string;
  commit_hash: string;
  branch: string;
  deployed_by: string;
  started_at: string;
  completed_at?: string;
  duration?: number;
  rollback_version?: string;
}

const mockDeployments: Deployment[] = [
  {
    id: '1',
    name: 'Frontend v2.1.0',
    service: 'frontend',
    environment: 'production',
    status: 'success',
    version: '2.1.0',
    commit_hash: 'abc123',
    branch: 'main',
    deployed_by: 'John Doe',
    started_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:05:00Z',
    duration: 300
  },
  {
    id: '2',
    name: 'Backend v1.5.2',
    service: 'backend',
    environment: 'staging',
    status: 'running',
    version: '1.5.2',
    commit_hash: 'def456',
    branch: 'develop',
    deployed_by: 'Jane Smith',
    started_at: '2024-01-15T09:30:00Z'
  },
  {
    id: '3',
    name: 'API v1.3.1',
    service: 'api',
    environment: 'production',
    status: 'failed',
    version: '1.3.1',
    commit_hash: 'ghi789',
    branch: 'main',
    deployed_by: 'Bob Wilson',
    started_at: '2024-01-15T08:00:00Z',
    completed_at: '2024-01-15T08:02:00Z',
    duration: 120
  },
  {
    id: '4',
    name: 'Database v1.0.5',
    service: 'database',
    environment: 'production',
    status: 'rolled_back',
    version: '1.0.5',
    commit_hash: 'jkl012',
    branch: 'main',
    deployed_by: 'Alice Jones',
    started_at: '2024-01-15T07:00:00Z',
    completed_at: '2024-01-15T07:10:00Z',
    duration: 600,
    rollback_version: '1.0.4'
  }
];

export const Deployments: React.FC = () => {
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [filters, setFilters] = useState({
    environment: 'all',
    status: 'all',
    service: 'all'
  });

  const filteredDeployments = mockDeployments.filter((deployment) => {
    if (filters.environment !== 'all' && deployment.environment !== filters.environment) return false;
    if (filters.status !== 'all' && deployment.status !== filters.status) return false;
    if (filters.service !== 'all' && deployment.service !== filters.service) return false;
    return true;
  });

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rolled_back':
        return <RotateCcw className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rolled_back':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const deploymentStats = {
    total: mockDeployments.length,
    successful: mockDeployments.filter(d => d.status === 'success').length,
    failed: mockDeployments.filter(d => d.status === 'failed').length,
    running: mockDeployments.filter(d => d.status === 'running').length
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deployments</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage application deployments across environments</p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>New Deployment</span>
        </button>
      </div>

      {/* Deployment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Deployments</h3>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{deploymentStats.total}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Successful</h3>
            <p className="text-3xl font-bold text-green-600">{deploymentStats.successful}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed</h3>
            <p className="text-3xl font-bold text-red-600">{deploymentStats.failed}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Running</h3>
            <p className="text-3xl font-bold text-blue-600">{deploymentStats.running}</p>
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
          value={filters.environment}
          onChange={(e) => setFilters(prev => ({ ...prev, environment: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="rolled_back">Rolled Back</option>
        </select>
        
        <select
          value={filters.service}
          onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Services</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="api">API</option>
          <option value="database">Database</option>
        </select>
      </div>

      {/* Recent Deployments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Deployments</h3>
        
        <div className="space-y-4">
          {filteredDeployments.map((deployment) => (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="mt-1">
                  {getStatusIcon(deployment.status)}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {deployment.name}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <GitBranch className="w-3 h-3" />
                      <span>{deployment.branch}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>v{deployment.version}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{deployment.deployed_by}</span>
                    </span>
                    <span>Duration: {formatDuration(deployment.duration)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                  {deployment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
