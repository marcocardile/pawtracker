import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary text-lg">🐾</span>
          </div>
          <span className="font-bold text-xl">PawTracker</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <button className="p-2">
            <span className="text-xl">🔔</span>
          </button>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary">
            <span>U</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;