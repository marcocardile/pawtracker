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
import Profile from './pages/Profile';

// Pagine per attività
import Calendar from './pages/Calendar';
import AddActivity from './pages/AddActivity';
import EditActivity from './pages/EditActivity';
import CustomActivityTypes from './pages/CustomActivityTypes';
import DayView from './pages/DayView';
import VaccinationRecords from './pages/VaccinationRecords';
import HealthRecordScanner from './components/health/HealthRecordScanner';
import { NotificationsProvider } from './contexts/NotificationsContext';

// Pagine per cani
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import AddDog from './pages/AddDog';
import DogWeightChart from './components/health/DogWeightChart';

// Contesto di autenticazione
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <LoadingProvider>
            {/* Health Record Scanner per i promemoria automatici */}
            <HealthRecordScanner />
            <Layout>
              <Routes>
                {/* Rotte principali */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />

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
                <Route path="/dogs/dogweightchart" element={<DogWeightChart />} />
              </Routes>
            </Layout>
          </LoadingProvider>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;