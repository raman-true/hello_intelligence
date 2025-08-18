import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, Menu } from 'lucide-react'; // Import Menu icon
import { useTheme } from '../../contexts/ThemeContext';
import { useOfficerAuth } from '../../contexts/OfficerAuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface OfficerHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const OfficerHeader: React.FC<OfficerHeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { officer, logout } = useOfficerAuth();
  const { unreadCount } = useNotification();

  if (!officer) return null;

  return (
    <header className={`h-16 border-b border-cyber-teal/20 flex items-center justify-between px-4 md:px-6 ${
      isDark ? 'bg-muted-graphite' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-4">
        {/* Hamburger menu for mobile */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>

        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Officer Control Panel
        </h2>
        <div className="h-6 w-px bg-cyber-teal/30 hidden sm:block" /> {/* Hide on extra small screens */}
        <div className="flex items-center space-x-2 hidden sm:flex"> {/* Hide on extra small screens */}
          <div className="w-3 h-3 bg-electric-blue rounded-full animate-pulse" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            System Online
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Link 
          to="/officer/dashboard/notifications"
          className={`relative p-2 transition-colors ${
            isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
          }`}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-neon-magenta text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 transition-colors ${
            isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Officer Info */}
        <div className="flex items-center space-x-3 pl-4 border-l border-cyber-teal/20">
          <div className="w-10 h-10 bg-cyber-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {officer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 hidden sm:block"> {/* Hide on extra small screens */}
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {officer.name}
            </p>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {officer.rank}
            </p>
          </div>
          <div className="mt-3 hidden sm:block"> {/* Hide on extra small screens */}
            <div className="flex justify-between text-xs mb-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credits</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {officer.credits_remaining.toFixed(3)}/{officer.total_credits}
              </span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDark ? 'bg-crisp-black' : 'bg-gray-200'}`}>
              <div 
                className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                style={{ width: `${(officer.credits_remaining / officer.total_credits) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={`p-2 transition-colors ${
            isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
          }`}
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
