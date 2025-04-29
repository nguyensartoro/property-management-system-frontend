import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  changePeriod?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changePeriod = 'from last week',
  trend
}) => {
  return (
    <div className="dashboard-card p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-secondary-500">{title}</h3>
        {icon && <div className="text-primary-400">{icon}</div>}
      </div>
      
      <div className="mb-2">
        <span className="text-2xl font-bold text-secondary-900">{value}</span>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center text-xs">
          <span 
            className={`inline-flex items-center gap-1 font-medium 
              ${trend === 'up' ? 'text-success-400' : trend === 'down' ? 'text-danger-400' : 'text-secondary-500'}`
            }
          >
            {trend === 'up' && <ArrowUp size={14} className="text-success-400" />}
            {trend === 'down' && <ArrowDown size={14} className="text-danger-400" />}
            {change}%
          </span>
          <span className="ml-1 text-secondary-400">{changePeriod}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;