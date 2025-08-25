// src/components/common/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle, badge: 3 },
  { name: 'Deployments', href: '/deployments', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={clsx(
        'bg-background-secondary border-r border-background-tertiary transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-background-tertiary">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">DevOps Pilot</h1>
                <p className="text-xs text-text-tertiary">v1.0.0</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-background-tertiary transition-colors text-text-secondary hover:text-text-primary"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary-500 text-white shadow-emerald'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-text-tertiary group-hover:text-text-primary'
                    )}
                  />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-error-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded-full bg-error-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-background-tertiary">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-text-primary">System Status</p>
              <p className="text-xs text-success-500">All systems operational</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
