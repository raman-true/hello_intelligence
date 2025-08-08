import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Bell, CheckCircle, XCircle, Info, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const OfficerNotifications: React.FC = () => {
  const { isDark } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotification();

  useEffect(() => {
    // Mark all notifications as read when the page is viewed
    markAllAsRead();
  }, [markAllAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your recent activity and updates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="bg-electric-blue/20 text-electric-blue px-4 py-2 rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={clearNotifications}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className={`border border-cyber-teal/20 rounded-lg p-8 text-center ${
            isDark ? 'bg-muted-graphite' : 'bg-white'
          }`}>
            <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No New Notifications
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              You're all caught up!
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border border-cyber-teal/20 rounded-lg p-4 flex items-start space-x-4 transition-all duration-200 ${
                isDark ? 'bg-muted-graphite' : 'bg-white'
              } ${!notif.read ? (isDark ? 'border-electric-blue/50 shadow-electric' : 'border-electric-blue/50 shadow-md') : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {notif.title}
                  </h3>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {format(new Date(notif.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {notif.message}
                </p>
                {notif.link && (
                  <Link
                    to={notif.link}
                    onClick={() => markAsRead(notif.id)}
                    className="text-cyber-teal hover:text-electric-blue text-sm mt-2 inline-block"
                  >
                    View Details
                  </Link>
                )}
              </div>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className={`flex-shrink-0 p-1 rounded-full ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Mark as Read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
