import React from 'react';
import { User, Menu, Bell, Settings } from 'lucide-react';
import { format } from 'date-fns';
import NotificationsDropdown from './NotificationsDropdown';
import LanguageSelector from './LanguageSelector';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../utils/languageContext';

interface HeaderProps {
  title?: string;
  toggleSidebar?: () => void;
  sidebarVisible?: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ title, toggleSidebar, sidebarVisible, userName = 'Admin' }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const { t } = useLanguage();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex sticky top-0 z-40 justify-between items-center px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
        >
          <Menu size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        {title && (
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
        )}
        <div className="hidden md:block text-secondary-700 dark:text-secondary-300 font-medium">
          {t('welcomeBack').replace('{name}', user?.name || userName)}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {format(currentTime, 'EEEE, MMMM d, yyyy h:mm:ss a')}
        </div>

        <LanguageSelector />

        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-500 dark:text-gray-400" />
            <span className="inline-block absolute top-0 right-0 w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-500"></span>
          </button>
          {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
        </div>

        {isAuthenticated && (
          <div className="relative flex items-center space-x-3 group">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <User size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
            </div>
            <div className="absolute right-0 top-12 z-50 hidden group-hover:flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg animate-slideUp min-w-[160px]">
              <button
                onClick={() => logout(navigate)}
                className="px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;