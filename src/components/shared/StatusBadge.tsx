import React from 'react';

type StatusType =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'LONG TERM'
  | 'SHORT TERM';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  customClassName?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  customClassName
}: StatusBadgeProps) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'AVAILABLE':
        return 'border-0 bg-[#388e3c] text-white'; // #green
      case 'ACTIVE':
        return 'border-0 bg-[#0dcfda] text-white'; // #turquoise
      case 'OCCUPIED':
        return 'border-0 bg-[#c1bec1] text-white'; // #clooney
      case 'RESERVED':
        return 'border-0 bg-[#f69833] text-white'; // #orange
      case 'PENDING':
        return 'border-0 bg-[#fecf33] text-white'; // #yellow
      case 'EXPIRED':
        return 'border-0 bg-[#554d56] text-white'; // #teflon
      case 'MAINTENANCE':
        return 'border-0 bg-[#979197] text-white'; // #gandalf
      case 'TERMINATED':
        return 'border-0 bg-[#ee6723] text-white'; // #peach
      case 'INACTIVE':
        return 'border-0 bg-[#c1bec1] text-white'; // #clooney
      case 'LONG TERM':
        return 'border-0 bg-[#419bf9] text-white'; // #cornflower-blue
      case 'SHORT TERM':
        return 'border-0 bg-[#fdbd39] text-white'; // #light-orange
      default:
        return 'border-0 bg-[#f7f7f7] text-gray-700'; // #whitey
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-0.5 text-[10px] rounded-2xl'
    : 'px-4 py-1 text-xs rounded-2xl';

  const getDisplayLabel = () => {
    return status.toUpperCase();
  };

  return (
    <span
      className={
        customClassName
          ? customClassName
          : `inline-flex items-center font-bold tracking-wide uppercase border ${getStatusStyle()} ${sizeClasses}`
      }
    >
      {getDisplayLabel()}
    </span>
  );
};

export default StatusBadge;