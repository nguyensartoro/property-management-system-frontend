import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  BarChart3,
  Package2,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Calendar as CalendarComponent } from '../ui/calendar';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 sticky top-0 left-0 z-50
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className={`flex items-center gap-2 font-bold text-xl text-secondary-900 ${isCollapsed ? 'hidden' : 'flex'}`}>
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-primary-400"></div>
            <div className="w-3 h-3 rounded-sm bg-primary-400"></div>
            <div className="w-3 h-3 rounded-sm bg-primary-400"></div>
            <div className="w-3 h-3 rounded-sm bg-primary-400"></div>
          </div>
          <span>Lodgify</span>
          <span className="text-xs bg-yellow-100 px-1.5 py-0.5 rounded-full text-yellow-800 font-normal ml-1">
            v1.0
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 text-secondary-500"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-3 items-center">
          <div className="overflow-hidden flex-shrink-0 w-10 h-10 rounded-full">
            <img
              src="https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="User avatar"
              className="object-cover w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-secondary-900">John Doe</p>
              <p className="text-xs text-secondary-500">User • Free Plan</p>
            </div>
          )}
        </div>
      </div>

      <nav className="overflow-y-auto flex-1 p-4 space-y-1">
        <NavLink to="/" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/rooms" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          {!isCollapsed && <span>Rooms</span>}
        </NavLink>

        <NavLink to="/renters" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          {!isCollapsed && <span>Renters</span>}
        </NavLink>

        <NavLink to="/services" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Package2 size={20} />
          {!isCollapsed && <span>Services</span>}
        </NavLink>

        <NavLink to="/contracts" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          {!isCollapsed && <span>Contracts</span>}
        </NavLink>

        <NavLink to="/plans" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          {!isCollapsed && <span>Plans</span>}
        </NavLink>

        <NavLink to="/analytics" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} />
          {!isCollapsed && <span>Analytics</span>}
        </NavLink>

        <NavLink to="/calendar-demo" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          {!isCollapsed && <span>Calendar</span>}
        </NavLink>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <NavLink to="/messages" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            {!isCollapsed && (
              <>
                <span>Messages</span>
                <span className="flex justify-center items-center ml-auto w-5 h-5 text-xs text-white rounded-full bg-primary-400">3</span>
              </>
            )}
          </NavLink>

          <NavLink to="/settings" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full rounded-md border"
            />
          </div>
        )}

        <button className="justify-start w-full sidebar-item text-danger-400 hover:text-danger-500 hover:bg-danger-400/10">
          <LogOut size={20} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;