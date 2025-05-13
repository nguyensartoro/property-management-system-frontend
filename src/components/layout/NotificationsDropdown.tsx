import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, MARK_ALL_AS_READ } from '../../providers/NotificationProvider';
import { Info, Check, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Fetch notifications from backend
  const { data, error } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'network-only',
    onCompleted: () => setLoading(false),
    onError: () => setLoading(false)
  });
  
  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ, {
    refetchQueries: [{ query: GET_NOTIFICATIONS }]
  });
  
  const notifications = data?.notifications || [];
  const hasUnread = notifications.some((notification: Notification) => !notification.read);
  
  // Mark all as read function
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };
  
  React.useEffect(() => {
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
  
  const getIconByType = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={16} />;
      case 'success':
        return <Check size={16} />;
      case 'warning':
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };
  
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
          {hasUnread && (
            <button 
              type="button"
              className="text-xs text-primary-400 cursor-pointer"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-danger-500">
            <p>Error loading notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-secondary-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <div key={notification.id} className="flex items-start p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                ${notification.type === 'info' ? 'bg-primary-100 text-primary-600' : 
                  notification.type === 'success' ? 'bg-success-400/10 text-success-500' : 
                  notification.type === 'error' ? 'bg-danger-400/10 text-danger-400' : 
                  'bg-warning-400/10 text-warning-400'}`}>
                {getIconByType(notification.type)}
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
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button 
          type="button"
          className="w-full py-2 text-sm text-center text-primary-500 hover:text-primary-600 font-medium"
          onClick={() => {
            // Navigate to all notifications page
            onClose();
          }}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;