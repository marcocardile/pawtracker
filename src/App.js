// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pagine principali
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';

// Pagine per attività
import Calendar from './pages/Calendar';
import AddActivity from './pages/AddActivity';
import EditActivity from './pages/EditActivity';
import DayView from './pages/DayView';

// Pagine per cani
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import AddDog from './pages/AddDog';

// Contesto di autenticazione
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Rotte principali */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/register" element={<Register />} />

            {/* Rotte attività */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/day/:date" element={<DayView />} />
            <Route path="/add" element={<AddActivity />} />
            <Route path="/activity/edit/:activityId" element={<EditActivity />} />

            {/* Rotte cani */}
            <Route path="/dogs" element={<Dogs />} />
            <Route path="/dogs/:dogId" element={<DogDetail />} />
            <Route path="/dogs/new" element={<AddDog />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;