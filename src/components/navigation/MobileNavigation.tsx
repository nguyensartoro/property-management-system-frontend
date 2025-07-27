import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Building, 
  Users, 
  CreditCard, 
  Settings, 
  Bell,
  MessageCircle,
  Calendar,
  FileText,
  BarChart3,
  LogOut,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  children?: NavigationItem[];
  badge?: number;
}

interface MobileNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onLogout?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building,
      children: [
        { id: 'properties-list', label: 'All Properties', icon: Building, path: '/properties' },
        { id: 'rooms', label: 'Rooms', icon: Building, path: '/rooms' },
        { id: 'maintenance', label: 'Maintenance', icon: Settings, path: '/maintenance' },
      ],
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: Users,
      children: [
        { id: 'tenants-list', label: 'All Tenants', icon: Users, path: '/tenants' },
        { id: 'contracts', label: 'Contracts', icon: FileText, path: '/contracts' },
        { id: 'onboarding', label: 'Onboarding', icon: User, path: '/onboarding' },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      children: [
        { id: 'payments-list', label: 'All Payments', icon: CreditCard, path: '/payments' },
        { id: 'rent-collection', label: 'Rent Collection', icon: CreditCard, path: '/rent-collection' },
        { id: 'refunds', label: 'Refunds', icon: CreditCard, path: '/refunds' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageCircle,
      children: [
        { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
        { id: 'announcements', label: 'Announcements', icon: Bell, path: '/announcements' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: '/documents',
    },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.mobile-nav-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = item.path ? isActiveRoute(item.path) : false;

    return (
      <div key={item.id} className="w-full">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 text-left
              transition-colors duration-200 touch-target
              ${level > 0 ? 'pl-8' : ''}
              ${isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ) : (
          <Link
            to={item.path || '#'}
            className={`
              w-full flex items-center gap-3 px-4 py-3
              transition-colors duration-200 touch-target
              ${level > 0 ? 'pl-8' : ''}
              ${isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ml-auto">
                {item.badge}
              </span>
            )}
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 touch-target"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Property Manager
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 relative touch-target">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 mobile-nav-container">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Navigation Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl animate-slide-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 safe-area-top">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.role || 'Admin'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 touch-target"
                  aria-label="Close navigation menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto">
                <div className="py-2">
                  {navigationItems.map(item => renderNavigationItem(item))}
                </div>
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 safe-area-bottom">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 touch-target"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 touch-target mt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile (Alternative/Additional) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
        <div className="grid grid-cols-5 gap-1">
          {[
            { icon: Home, label: 'Home', path: '/dashboard' },
            { icon: Building, label: 'Properties', path: '/properties' },
            { icon: Users, label: 'Tenants', path: '/tenants' },
            { icon: CreditCard, label: 'Payments', path: '/payments' },
            { icon: MessageCircle, label: 'Messages', path: '/messages' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-2 px-1 text-xs
                transition-colors duration-200 touch-target-comfortable
                ${isActiveRoute(item.path) 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

// Animation styles for slide-right
const slideRightStyles = `
@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-slide-right {
  animation: slideRight 0.3s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = slideRightStyles;
  document.head.appendChild(styleSheet);
}