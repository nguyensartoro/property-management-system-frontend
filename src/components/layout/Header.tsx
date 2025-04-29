import React, { useState, useEffect } from 'react';
import { Bell, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import NotificationsDropdown from './NotificationsDropdown';
import CalendarDropdown from './CalendarDropdown';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-secondary-600">
          {format(currentTime, 'EEEE, MMMM d, yyyy h:mm:ss a')}
        </div>

        <LanguageSelector />
        
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={20} className="text-secondary-500" />
          </button>
          {showCalendar && <CalendarDropdown onClose={() => setShowCalendar(false)} />}
        </div>
        
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-secondary-500" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-primary-400 rounded-full"></span>
          </button>
          {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Header;