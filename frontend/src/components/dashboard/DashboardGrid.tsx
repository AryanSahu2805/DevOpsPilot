import React from 'react';
import { clsx } from 'clsx';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div
      className={clsx(
        'grid',
        gridClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  onClick,
  clickable = false
}) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-charcoal-800 rounded-lg shadow-sm border border-charcoal-200 dark:border-charcoal-700',
        'p-6 transition-all duration-200',
        clickable && 'hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
