// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { db } from './firebase';


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
import CustomActivityTypes from './pages/CustomActivityTypes';
import DayView from './pages/DayView';
import VaccinationRecords from './pages/VaccinationRecords';

// Pagine per cani
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import AddDog from './pages/AddDog';
import WeightChart from './pages/WeightChart';

// Contesto di autenticazione
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
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
            <Route path="/activity-types" element={<CustomActivityTypes />} />
            <Route path="/dogs/:dogId/vaccinations" element={<VaccinationRecords />} />

            {/* Rotte cani */}
            <Route path="/dogs" element={<Dogs />} />
            <Route path="/dogs/:dogId" element={<DogDetail />} />
            <Route path="/dogs/new" element={<AddDog />} />
            <Route path="/dogs/weightchart" element={<WeightChart />} />

          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;