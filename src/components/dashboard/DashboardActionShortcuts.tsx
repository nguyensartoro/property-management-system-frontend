import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ActionShortcutProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const ActionShortcut: React.FC<ActionShortcutProps> = ({ icon, label, onClick }) => {
  return (
    <button
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
};

interface DashboardActionShortcutsProps {
  onCreateProperty?: () => void;
  onCreateRoom?: () => void;
  onCreateRenter?: () => void;
  onCreateContract?: () => void;
  onMakePayment?: () => void;
  onRequestMaintenance?: () => void;
  onViewContract?: () => void;
  onContactManager?: () => void;
}

const DashboardActionShortcuts: React.FC<DashboardActionShortcutsProps> = ({
  onCreateProperty,
  onCreateRoom,
  onCreateRenter,
  onCreateContract,
  onMakePayment,
  onRequestMaintenance,
  onViewContract,
  onContactManager,
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'ADMIN';
  
  // Admin shortcuts
  const adminShortcuts = [
    {
      icon: '🏠',
      label: 'Add Property',
      onClick: onCreateProperty || (() => navigate('/properties/new')),
    },
    {
      icon: '🚪',
      label: 'Add Room',
      onClick: onCreateRoom || (() => navigate('/rooms/new')),
    },
    {
      icon: '👤',
      label: 'Add Renter',
      onClick: onCreateRenter || (() => navigate('/renters/new')),
    },
    {
      icon: '📝',
      label: 'Create Contract',
      onClick: onCreateContract || (() => navigate('/contracts/new')),
    },
  ];
  
  // Renter shortcuts
  const renterShortcuts = [
    {
      icon: '💰',
      label: 'Make Payment',
      onClick: onMakePayment || (() => navigate('/payments/new')),
    },
    {
      icon: '🔧',
      label: 'Request Maintenance',
      onClick: onRequestMaintenance || (() => navigate('/maintenance/new')),
    },
    {
      icon: '📄',
      label: 'View Contract',
      onClick: onViewContract || (() => navigate('/contracts/my')),
    },
    {
      icon: '📞',
      label: 'Contact Manager',
      onClick: onContactManager || (() => navigate('/contact')),
    },
  ];
  
  const shortcuts = isAdmin ? adminShortcuts : renterShortcuts;
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shortcuts.map((shortcut, index) => (
          <ActionShortcut
            key={index}
            icon={shortcut.icon}
            label={shortcut.label}
            onClick={shortcut.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardActionShortcuts;