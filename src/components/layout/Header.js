// src/components/layout/Header.js (versione aggiornata)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications } from '../../services/notificationService';
import NotificationsPanel from '../notifications/NotificationsPanel';

function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // Check for unread notifications
      const checkUnreadNotifications = async () => {
        try {
          const notifications = await fetchNotifications(currentUser.uid, { unreadOnly: true });
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      checkUnreadNotifications();

      // Set up a timer to check for new notifications periodically
      const timer = setInterval(checkUnreadNotifications, 5 * 60 * 1000); // every 5 minutes

      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    
    const nameParts = currentUser.displayName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <>
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary text-lg">🐾</span>
            </div>
            <span className="font-bold text-xl">PawTracker</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 relative" onClick={toggleNotifications}>
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary">
              <span>{getUserInitials()}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={closeNotifications} 
      />
    </>
  );
}

export default Header;