import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  
// Funzione per determinare se un link è attivo
const isActive = (path) => {
  return location.pathname === path || location.pathname.startsWith(path + '/');
};
  
  return (
    <nav className="bg-white border-t fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto flex justify-around">
        <NavItem to="/" icon="🏠" label="Home" isActive={isActive('/')} />
        <NavItem to="/calendar" icon="📅" label="Calendar" isActive={isActive('/calendar')} />
        <NavItem to="/add" icon="➕" label="Add" isActive={isActive('/add')} />
        <NavItem to="/dogs" icon="🐕" label="Dogs" isActive={isActive('/dogs')} />
        <NavItem to="/analytics" icon="📊" label="Analytics" isActive={isActive('/analytics')} />
        <NavItem to="/profile" icon="⚙️" label="Settings" isActive={isActive('/profile')} />

      </div>
    </nav>
  );
}

// Componente di supporto per gli elementi della barra di navigazione
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