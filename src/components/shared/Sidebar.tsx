'use client'

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import useUIStore from '../../stores/uiStore'
import { getNavigationItems } from '../../utils/roleBasedAccess'

interface NavItemProps {
  to: string;
  label: string;
  iconClass: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, iconClass }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <i className={`material-icons-outlined ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
        {iconClass}
      </i>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// Map icon names to Material Icons
const getIconClass = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'Home': 'dashboard',
    'Building': 'apartment',
    'Door': 'meeting_room',
    'Users': 'people',
    'FileText': 'description',
    'CreditCard': 'payments',
    'Wrench': 'build',
    'Receipt': 'receipt',
    'BarChart': 'bar_chart'
  };
  
  return iconMap[iconName] || 'circle';
};

const Sidebar: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={`w-64 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <i className="material-icons-outlined text-blue-600">home</i>
          <span className="text-lg font-bold text-gray-800">Rental Rest</span>
        </Link>
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <i className="material-icons-outlined">menu_open</i>
        </button>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-blue-600 font-medium">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs font-medium text-blue-600">{isAdmin ? 'Administrator' : 'Renter'}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {getNavigationItems(user).map((item) => (
          <NavItem 
            key={item.href}
            to={item.href} 
            label={item.name} 
            iconClass={getIconClass(item.icon)} 
          />
        ))}
        
        {/* Common navigation items */}
        <NavItem to="/profile" label="Profile" iconClass="person" />
        <NavItem to="/settings" label="Settings" iconClass="settings" />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <i className="material-icons-outlined text-gray-500">logout</i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;