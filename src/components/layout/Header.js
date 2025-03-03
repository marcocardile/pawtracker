import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsPanel from '../notifications/NotificationsPanel';

const hasNotch = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const screenRatio = window.innerHeight / window.innerWidth;
  return isIOS && screenRatio > 2;
};

function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const [notchPadding, setNotchPadding] = useState('');

  useEffect(() => {
    setNotchPadding(hasNotch() ? "pt-4" : "pt-4"); // RIDOTTO rispetto a prima
  }, []);
  console.log("Is Notch Device:", hasNotch); // Aggiungi un log per vedere se la condizione viene rispettata


  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    const nameParts = currentUser.displayName.split(' ');
    return nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nameParts[0][0].toUpperCase();
  };

  return (
    <>
      <header className={`bg-primary text-white ${notchPadding} pb-4 px-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <img src="/logo192.png" alt="Puppy Planner Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-xl">Puppy Planner</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary cursor-pointer hover:bg-gray-100">
              <span>{getUserInitials()}</span>
            </Link>
          </div>
        </div>
      </header>
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}

export default Header;
