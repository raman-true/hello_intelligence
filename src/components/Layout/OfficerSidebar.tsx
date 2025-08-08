import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Database, 
  Link as LinkIcon, 
  Clock, 
  User,
  LogOut,
  Zap,
  FileText,
  Bell
} from 'lucide-react';
import { useOfficerAuth } from '../../contexts/OfficerAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

const navigation = [
  { name: 'Dashboard', href: '/officer/dashboard/home', icon: Shield },
  { name: 'Free Lookups', href: '/officer/dashboard/free-lookups', icon: Search },
  { name: 'PRO Lookups', href: '/officer/dashboard/pro-lookups', icon: Database },
  { name: 'PRO Lookups V1', href: '/officer/dashboard/pro-lookups-v1', icon: Database },
  { name: 'OSINT PRO', href: '/officer/dashboard/osint-pro', icon: Search },
  { name: 'TrackLink', href: '/officer/dashboard/tracklink', icon: LinkIcon },
  { name: 'History', href: '/officer/dashboard/history', icon: Clock },
  { name: 'Account', href: '/officer/dashboard/account', icon: User },
  { name: 'Manual Request', href: '/officer/dashboard/manual-request', icon: FileText },
  { name: 'Notifications', href: '/officer/dashboard/notifications', icon: Bell },
];

export const OfficerSidebar: React.FC = () => {
  const location = useLocation();
  const { officer, logout } = useOfficerAuth();
  const { isDark } = useTheme();
  const { unreadCount } = useNotification();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!officer) return null;

  return (
    <div className={`min-h-screen w-64 border-r border-cyber-teal/20 flex flex-col ${
      isDark ? 'bg-muted-graphite' : 'bg-white'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-cyber-teal/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyber-teal">PickMe</h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Officer Portal</p>
          </div>
        </div>
      </div>

      

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30 shadow-cyber'
                  : `${isDark ? 'text-gray-300 hover:bg-cyber-teal/10' : 'text-gray-700 hover:bg-cyber-teal/10'} hover:text-cyber-teal`
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-neon-magenta text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-cyber-teal/20">
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isDark ? 'text-gray-300 hover:bg-red-500/10' : 'text-gray-700 hover:bg-red-500/10'
          } hover:text-red-400`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};