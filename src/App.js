// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

import Calendar from './pages/Calendar';
import AddActivity from './pages/AddActivity';
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import AddDog from './pages/AddDog';
import Home from './pages/Home';
import EditActivity from './pages/EditActivity';
import DayView from './pages/DayView';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/day/:date" element={<DayView />} />
          <Route path="/add" element={<AddActivity />} />
          <Route path="/activity/edit/:activityId" element={<EditActivity />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/dogs/:dogId" element={<DogDetail />} />
          <Route path="/dogs/new" element={<AddDog />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;