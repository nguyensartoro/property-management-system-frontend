import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/rooms': 'Rooms',
  '/renters': 'Renters',
  '/analytics': 'Analytics',
  '/services': 'Services',
  '/messages': 'Messages',
  '/settings': 'Settings',
  '/contracts': 'Contracts',
};

const Layout: React.FC = () => {
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const { user } = useAuthStore();

  const toggleSidebar = (): void => {
    setSidebarVisible((prev: boolean) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isVisible={sidebarVisible} />
      <div className="flex flex-col flex-1">
        <Header 
          title={title}
          toggleSidebar={toggleSidebar}
          sidebarVisible={sidebarVisible}
          userName={user?.name || 'User'}
        />
        <main className="overflow-auto flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;