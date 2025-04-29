import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="overflow-auto flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;