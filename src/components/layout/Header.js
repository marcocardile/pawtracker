// src/components/layout/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications } from '../../services/notificationService';
import NotificationsPanel from '../notifications/NotificationsPanel';

function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  // Funzione per ottenere le iniziali dell'utente
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    
    const nameParts = currentUser.displayName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    // Se c'è solo un nome, prendi la prima lettera
    return nameParts[0][0].toUpperCase();
  };

  // Gestisci l'apertura/chiusura del pannello notifiche
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  return (
    <>
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/logo192.png" 
                alt="PawTracker Logo" 
                className="w-8 h-8 object-contain" 
              />
            </div>
            <span className="font-bold text-xl">PawTracker</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 relative" 
              onClick={toggleNotifications}
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <Link 
              to="/profile" 
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary cursor-pointer hover:bg-gray-100"
            >
              <span>{getUserInitials()}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Pannello Notifiche */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={closeNotifications} 
      />
    </>
  );
}

export default Header;