// src/components/layout/Layout.js
import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-light">
      <Header />
      <main className="container mx-auto p-4 pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  );
}

export default Layout;