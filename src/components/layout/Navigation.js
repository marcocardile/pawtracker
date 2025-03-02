import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Funzione per rilevare notch dinamicamente
const hasNotch = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const screenRatio = window.innerHeight / window.innerWidth;
  return isIOS && screenRatio > 2;
};

function Navigation() {
  const location = useLocation();
  const [notchPadding, setNotchPadding] = useState('');

  useEffect(() => {
    setNotchPadding(hasNotch() ? "pb-6" : "pb-3");
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`bg-white border-t fixed bottom-0 left-0 right-0 z-10 pt-2 ${notchPadding}`}>
      <div className="container mx-auto flex justify-around">
        <NavItem to="/" icon="🏠" label="Home" isActive={isActive('/')} />
        <NavItem to="/calendar" icon="📅" label="Calendar" isActive={isActive('/calendar')} />
        <NavItem to="/add" icon="➕" label="Add" isActive={isActive('/add')} />
        <NavItem to="/dogs" icon="🐕" label="Dogs" isActive={isActive('/dogs')} />
        <NavItem to="/analytics" icon="📊" label="Analytics" isActive={isActive('/analytics')} />
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label, isActive }) {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center p-3 ${isActive ? 'text-primary' : 'text-gray-500'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

export default Navigation;
