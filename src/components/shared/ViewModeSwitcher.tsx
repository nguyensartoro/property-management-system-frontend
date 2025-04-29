import React from 'react';
import { Grid, List } from 'lucide-react';

interface ViewModeSwitcherProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  onViewModeChange,
  className = '',
}: ViewModeSwitcherProps) => {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-500' : 'text-secondary-500 hover:bg-gray-100'}`}
        aria-label="Grid view"
      >
        <Grid size={20} />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-500' : 'text-secondary-500 hover:bg-gray-100'}`}
        aria-label="List view"
      >
        <List size={20} />
      </button>
    </div>
  );
};

export default ViewModeSwitcher; 