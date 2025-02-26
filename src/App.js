// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Calendar from './pages/Calendar';
import AddActivity from './pages/AddActivity';

function Home() {
  return (
    <Layout>
      <div className="mt-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white text-2xl mb-4">
          🐾
        </div>
        <h1 className="text-3xl font-bold text-dark">PawTracker</h1>
        <p className="text-gray-600 mt-2">Your dog's life, organized</p>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-2">📅</div>
            <h2 className="font-bold">Calendar</h2>
            <p className="text-sm text-gray-600">Track daily activities</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-2">🐕</div>
            <h2 className="font-bold">Dog Profile</h2>
            <p className="text-sm text-gray-600">Manage your pet's info</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-2">💉</div>
            <h2 className="font-bold">Health</h2>
            <p className="text-sm text-gray-600">Track vaccinations & checkups</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-2">✨</div>
            <h2 className="font-bold">Assistant</h2>
            <p className="text-sm text-gray-600">Personalized advice</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/add" element={<AddActivity />} />
      </Routes>
    </Router>
  );
}

export default App;