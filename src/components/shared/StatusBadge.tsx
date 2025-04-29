import React from 'react';

type StatusType = 
  | 'Available' 
  | 'Occupied' 
  | 'Reserved' 
  | 'Maintenance' 
  | 'Active' 
  | 'Inactive' 
  | 'Pending'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'Long Term'
  | 'Short Term';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md'
}: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      // Room statuses
      case 'Available':
      case 'Active':
      case 'active':
        return 'bg-success-400/10 text-success-500';
      case 'Occupied':
      case 'Inactive':
      case 'terminated':
        return 'bg-danger-400/10 text-danger-500';
      case 'Reserved':
      case 'Pending':
      case 'expired':
        return 'bg-warning-400/10 text-warning-500';
      case 'Maintenance':
        return 'bg-gray-100 text-gray-500';
      
      // Contract types
      case 'Long Term':
        return 'bg-blue-100 text-blue-700';
      case 'Short Term':
        return 'bg-purple-100 text-purple-700';
      
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDotColor = () => {
    switch (status) {
      // Room statuses
      case 'Available':
      case 'Active':
      case 'active':
        return 'bg-success-500';
      case 'Occupied':
      case 'Inactive':
      case 'terminated':
        return 'bg-danger-500';
      case 'Reserved':
      case 'Pending':
      case 'expired':
        return 'bg-warning-500';
      case 'Maintenance':
        return 'bg-gray-500';
      
      // Contract types
      case 'Long Term':
        return 'bg-blue-500';
      case 'Short Term':
        return 'bg-purple-500';
      
      default:
        return 'bg-gray-500';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs';

  // Format status label
  const getDisplayLabel = () => {
    if (status === 'active' || status === 'expired' || status === 'terminated') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return status;
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor()} ${sizeClasses}`}>
      <span className={`rounded-full h-1.5 w-1.5 ${getDotColor()} mr-1.5`}></span>
      {getDisplayLabel()}
    </span>
  );
};

export default StatusBadge;