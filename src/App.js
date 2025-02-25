import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white text-2xl mb-4">
          🐾
        </div>
        <h1 className="text-3xl font-bold text-dark">PawTracker</h1>
        <p className="text-gray-600 mt-2">Your dog's life, organized</p>
        
        {/* Demo buttons */}
        <div className="mt-8 flex space-x-4 justify-center">
          <button className="bg-primary hover:bg-primary/80 text-white font-medium py-2 px-6 rounded-lg">
            Login
          </button>
          <button className="bg-white border border-primary text-primary font-medium py-2 px-6 rounded-lg hover:bg-gray-50">
            Sign Up
          </button>
        </div>
        
        {/* Tailwind color check */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary"></div>
          <div className="w-8 h-8 rounded-full bg-secondary"></div>
          <div className="w-8 h-8 rounded-full bg-success"></div>
          <div className="w-8 h-8 rounded-full bg-warning"></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;