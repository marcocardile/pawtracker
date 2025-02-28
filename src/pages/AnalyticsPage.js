// src/pages/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchDogs } from '../services/firebaseService';
import DogActivityAnalytics from '../components/analytics/DogActivityAnalytics';
import DogHealthAnalytics from '../components/analytics/DogHealthAnalytics';
import CareRoutineTracking from '../components/analytics/CareRoutineTracking';

function AnalyticsPage() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState(dogId || null);
  const [activeView, setActiveView] = useState('activity'); // 'activity', 'health', 'routine'
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDogs = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const fetchedDogs = await fetchDogs(currentUser.uid);
        setDogs(fetchedDogs);
        
        // If no dogId provided or invalid dogId, default to first dog
        if (!dogId && fetchedDogs.length > 0) {
          setSelectedDogId(fetchedDogs[0].id);
          navigate(`/analytics/${fetchedDogs[0].id}`, { replace: true });
        } else if (dogId && !fetchedDogs.some(dog => dog.id === dogId)) {
          // If invalid dogId provided
          if (fetchedDogs.length > 0) {
            setSelectedDogId(fetchedDogs[0].id);
            navigate(`/analytics/${fetchedDogs[0].id}`, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error loading dogs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDogs();
  }, [currentUser, dogId, navigate]);

  // Handle dog selection change
  const handleDogChange = (e) => {
    const newDogId = e.target.value;
    setSelectedDogId(newDogId);
    navigate(`/analytics/${newDogId}`);
  };

  // Get currently selected dog
  const selectedDog = dogs.find(dog => dog.id === selectedDogId);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-bold mb-2">No dogs found</h2>
        <p className="text-gray-600 mb-4">Add a dog first to view analytics</p>
        <button
          onClick={() => navigate('/dogs/new')}
          className="bg-primary text-white py-2 px-4 rounded-lg"
        >
          Add Your First Dog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        
        {/* Dog Selector */}
        <select
          value={selectedDogId}
          onChange={handleDogChange}
          className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Dog Info Panel */}
      {selectedDog && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl mr-4">
            🐕
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{selectedDog.name}'s Analytics</h2>
            <p className="text-gray-600">{selectedDog.breed}, {selectedDog.gender === 'male' ? 'Male' : 'Female'}</p>
          </div>
        </div>
      )}
      
      {/* View Selector Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 text-center ${activeView === 'activity' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveView('activity')}
          >
            Activity
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeView === 'health' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveView('health')}
          >
            Health
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeView === 'routine' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveView('routine')}
          >
            Care Routine
          </button>
        </div>
      </div>
      
      {/* Time Range Selector (only for activity view) */}
      {activeView === 'activity' && (
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-full ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 rounded-full ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 rounded-full ${timeRange === 'year' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      )}
      
      {/* Analytics Content */}
      {selectedDogId && (
        <div>
          {activeView === 'activity' && (
            <DogActivityAnalytics dogId={selectedDogId} timeRange={timeRange} />
          )}
          
          {activeView === 'health' && (
            <DogHealthAnalytics dogId={selectedDogId} />
          )}
          
          {activeView === 'routine' && (
            <CareRoutineTracking dogId={selectedDogId} />
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;