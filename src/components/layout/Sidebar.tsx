/** @jsxImportSource react */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Settings,
  FileText,
  List,
  Grid,
  Mail,
  Plus,
  ChevronUp,
  ChevronDown,
  X,
  Wallet
} from 'lucide-react';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { useLanguage } from '../../utils/languageContext';

interface NavigationItem {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

interface SidebarItemProps extends NavigationItem {
  isCollapsed: boolean;
}

interface SidebarProps {
  isVisible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible = true }) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Updated navigation items with translated labels and Property page removed
  const navigationItems: NavigationItem[] = [
    { href: '/', icon: Home, label: t('navigation.dashboard') },
    { href: '/rooms', icon: List, label: t('navigation.rooms') },
    { href: '/renters', icon: User, label: t('navigation.renters') },
    { href: '/contracts', icon: FileText, label: t('navigation.contracts') },
    { href: '/services', icon: Grid, label: t('navigation.services') },
    { href: '/analytics', icon: Grid, label: t('navigation.analytics') },
    { href: '/messages', icon: Mail, label: 'Messages' },
    { href: '/plans', icon: Plus, label: 'Plans' },
    { href: '/calendar', icon: FileText, label: 'Calendar' },
    { href: '/payments', icon: Wallet, label: 'Payments' },
    { href: '/settings', icon: Settings, label: t('navigation.settings') }
  ];

  // On mobile, hide completely if not visible
  if (!isVisible && window.innerWidth < 768) {
    return null;
  }

  return (
    <div className={`
      sticky top-0 h-screen flex flex-col
      bg-white dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-800
      ${isCollapsed ? 'w-16' : 'w-64'}
      transition-all duration-300
      ${!isVisible ? 'hidden md:flex' : 'flex'}
    `}>
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">PMS</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400
            hover:bg-gray-100 hover:text-gray-900
            dark:hover:bg-gray-800/50 dark:hover:text-gray-100
            transition-colors duration-200"
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>
      <nav className="overflow-y-auto flex-1 p-2 bg-white dark:bg-gray-900">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            isCollapsed={isCollapsed}
          />
        ))}
        {/* Mini calendar only on desktop */}
        <div className="mt-6 hidden md:block">
          <CalendarComponent />
        </div>
      </nav>
      <div className="p-2 bg-white border-t border-gray-200 dark:border-gray-800 dark:bg-gray-900 mt-auto">
        <button
          onClick={() => {
            // Handle logout here
          }}
          className="flex items-center px-4 py-3 w-full text-sm font-medium text-red-600 rounded-lg transition-colors duration-200 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <X className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ href, icon: Icon, label, isCollapsed }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  const [showCalendar, setShowCalendar] = React.useState(false);
  const isCalendar = label === 'Calendar';

  if (isCollapsed && isCalendar) {
    return (
      <div
        className="relative flex justify-center"
        onMouseEnter={() => setShowCalendar(true)}
        onMouseLeave={() => setShowCalendar(false)}
      >
        <Link
          to={href}
          className={`flex items-center py-3 px-4 text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800/50 dark:hover:text-gray-100 ${isActive ? 'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
        </Link>
        {showCalendar && (
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 animate-slideUp"
            style={{ minWidth: 260 }}
          >
            <div className="shadow-lg rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <CalendarComponent />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={`
        flex items-center py-3 px-4 text-sm font-medium rounded-lg
        transition-colors duration-200
        hover:bg-gray-100 hover:text-gray-900
        dark:hover:bg-gray-800/50 dark:hover:text-gray-100
        ${isActive
          ? 'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-100'
          : 'text-gray-600 dark:text-gray-400'
        }
      `}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default Sidebar;