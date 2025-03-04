import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
// import { db } from './firebase';
import notificationManager from './services/notificationManager';

// Pagine principali
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AnalyticsPage from './pages/AnalyticsPage';
import DeleteAccount from './pages/DeleteAccount';

// Pagine per attività
import Calendar from './pages/Calendar';
import AddActivity from './pages/AddActivity';
import EditActivity from './pages/EditActivity';
import CustomActivityTypes from './pages/CustomActivityTypes';
import DayView from './pages/DayView';
import VaccinationRecords from './pages/VaccinationRecords';
import HealthRecordScanner from './components/health/HealthRecordScanner';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ConnectionStatus from './components/ui/ConnectionStatus';

// Pagine per cani
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import AddDog from './pages/AddDog';
import DogWeightChart from './components/health/DogWeightChart';

// Contesto di autenticazione
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Componente per rotte non autenticate
function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/signup" />} />
    </Routes>
  );
}

// Componente per rotte autenticate
function AuthenticatedRoutes() {
  const { currentUser } = useAuth();
  
  // Utilizziamo useState per gestire in modo più sicuro il flag di onboarding
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  
  // Controlliamo il flag solo al mount del componente
  useEffect(() => {
    const needsOnboarding = localStorage.getItem('requiresOnboarding') === 'true';
    setRequiresOnboarding(needsOnboarding);
    
    if (needsOnboarding) {
      console.log("Utente richiede onboarding, controllo effettuato");
    }
  }, []);
  
  // Rendiamo il componente Onboarding separato dal Layout per evitare problemi
  if (requiresOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Rotte principali */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics/:dogId?" element={<AnalyticsPage />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

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

        {/* Accessibile anche dopo aver completato l'onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Reindirizza alla home se rotta non trovata */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();

  // Inizializza il gestore delle notifiche quando l'utente è loggato
  useEffect(() => {
    if (currentUser) {
      // Inizializza il gestore delle notifiche con l'ID dell'utente corrente
      notificationManager.initialize(currentUser.uid);
    } else {
      // Ferma il gestore delle notifiche quando l'utente si disconnette
      notificationManager.stop();
    }
    
    // Cleanup function
    return () => {
      notificationManager.stop();
    };
  }, [currentUser]);

  // Schermo di caricamento iniziale
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Health Record Scanner per i promemoria automatici */}
      <HealthRecordScanner />
      
      {/* Connection status indicator */}
      <ConnectionStatus />
      
      {/* Routing condizionale basato sull'autenticazione */}
      {currentUser ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;