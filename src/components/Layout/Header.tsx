import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, User, Menu } from 'lucide-react'; // Import Menu icon
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseData } from '../../hooks/useSupabaseData';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { registrations, manualRequests } = useSupabaseData(); // Access manualRequests
  
  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending').length;
  const pendingManualRequests = manualRequests.filter(req => req.status === 'pending').length; // Calculate pending manual requests
  const totalPendingNotifications = pendingRegistrations + pendingManualRequests; // Combine counts

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
          Admin Control Panel
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
          to="/admin/registrations" // Keep linking to registrations for now, as it's the existing notification hub
          className={`relative p-2 transition-colors ${
          isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
        }`}>
          <Bell className="w-5 h-5" />
          {totalPendingNotifications > 0 && ( // Use combined count for badge display
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-neon-magenta text-white text-xs rounded-full flex items-center justify-center font-bold">
              {totalPendingNotifications}
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

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-cyber-teal/20">
          <div className="w-8 h-8 bg-cyber-gradient rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block"> {/* Hide on extra small screens */}
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.name}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
