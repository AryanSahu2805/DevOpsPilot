// src/components/common/Header.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/monitoring':
        return 'System Monitoring';
      case '/alerts':
        return 'Alert Management';
      case '/deployments':
        return 'Deployment Pipeline';
      case '/settings':
        return 'Settings';
      default:
        return 'DevOps Pilot';
    }
  };

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleProfileAction = (action: string) => {
    setIsProfileOpen(false);
    switch (action) {
      case 'profile':
        navigate('/settings');
        break;
      case 'account':
        navigate('/settings');
        break;
      case 'help':
        // Could navigate to help page or show help modal
        console.log('Help & Support clicked');
        break;
      case 'logout':
        logout();
        navigate('/');
        break;
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'High CPU Usage Detected',
      message: 'Production server CPU usage is above 85%',
      time: '2 min ago',
      type: 'warning',
      read: false,
    },
    {
      id: 2,
      title: 'Deployment Successful',
      message: 'Version 1.2.3 deployed successfully to staging',
      time: '15 min ago',
      type: 'success',
      read: false,
    },
    {
      id: 3,
      title: 'Database Connection Error',
      message: 'Connection timeout to primary database',
      time: '1 hour ago',
      type: 'error',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-background-secondary border-b border-background-tertiary px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{getPageTitle()}</h1>
            <p className="text-sm text-text-tertiary">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Search metrics, alerts, deployments..."
              className="w-full bg-background-primary border border-background-tertiary rounded-lg pl-10 pr-4 py-2.5 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-background-tertiary hover:bg-background-primary transition-colors text-text-secondary hover:text-text-primary"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-lg bg-background-tertiary hover:bg-background-primary transition-colors text-text-secondary hover:text-text-primary relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-error-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-background-secondary border border-background-tertiary rounded-lg shadow-card-hover z-50">
                <div className="p-4 border-b border-background-tertiary">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
                    <span className="text-sm text-text-tertiary">{unreadCount} unread</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={clsx(
                        'p-4 border-b border-background-tertiary hover:bg-background-tertiary transition-colors',
                        !notification.read && 'bg-background-tertiary/50'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={clsx(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            notification.type === 'success' && 'bg-success-500',
                            notification.type === 'warning' && 'bg-warning-500',
                            notification.type === 'error' && 'bg-error-500'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                          <p className="text-sm text-text-tertiary mt-1">{notification.message}</p>
                          <p className="text-xs text-text-muted mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-background-tertiary">
                  <button className="text-sm text-primary-500 hover:text-primary-400 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-3 p-2 rounded-lg bg-background-tertiary hover:bg-background-primary transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-gradient rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user?.full_name || 'John Doe'}</p>
                <p className="text-xs text-text-tertiary">{user?.role || 'DevOps Engineer'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-secondary border border-background-tertiary rounded-lg shadow-card-hover z-50">
                <div className="p-4 border-b border-background-tertiary">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-gradient rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{user?.full_name || 'John Doe'}</p>
                      <p className="text-xs text-text-tertiary">{user?.email || 'john.doe@company.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => handleProfileAction('account')}
                    className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => handleProfileAction('help')}
                    className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help & Support
                  </button>
                </div>
                <div className="border-t border-background-tertiary py-2">
                  <button 
                    onClick={() => handleProfileAction('logout')}
                    className="flex items-center w-full px-4 py-2 text-sm text-error-500 hover:text-error-400 hover:bg-background-tertiary transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
