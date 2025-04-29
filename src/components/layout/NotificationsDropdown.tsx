import React, { useEffect, useRef } from 'react';
import { notifications } from '../../data/mockData';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div 
      ref={dropdownRef} 
      className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown"
      style={{
        transformOrigin: 'top right',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold text-secondary-900">Notifications</h3>
          <span className="text-xs text-primary-400 cursor-pointer">Mark all as read</span>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0
              ${notification.type === 'info' ? 'bg-primary-100 text-primary-600' : 
                notification.type === 'success' ? 'bg-success-400/10 text-success-500' : 
                notification.type === 'error' ? 'bg-danger-400/10 text-danger-400' : 
                'bg-warning-400/10 text-warning-400'}`}>
              <span className="text-lg font-bold">
                {notification.type === 'info' ? 'i' : 
                  notification.type === 'success' ? '✓' : 
                  notification.type === 'error' ? '!' : '⚠'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="text-sm font-semibold text-secondary-900">{notification.title}</h4>
                <span className="text-xs text-secondary-500">{notification.time}</span>
              </div>
              <p className="text-sm text-secondary-600 mt-1">{notification.description}</p>
            </div>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button 
          className="w-full py-2 text-sm text-center text-primary-500 hover:text-primary-600 font-medium"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;