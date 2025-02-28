// src/pages/AddActivity.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { fetchDogs, addActivity } from '../services/firebaseService';

// Tipi di attività predefiniti
const PREDEFINED_ACTIVITY_TYPES = [
  { id: 'walk', label: 'Walk', icon: '🚶' },
  { id: 'food', label: 'Food', icon: '🍖' },
  { id: 'play', label: 'Play', icon: '🎾' },
  { id: 'vet', label: 'Vet Visit', icon: '💉' },
  { id: 'medicine', label: 'Medicine', icon: '💊' },
  { id: 'groom', label: 'Grooming', icon: '✂️' },
  { id: 'training', label: 'Training', icon: '🏋️' }
];

function AddActivity() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customTypes, setCustomTypes] = useState([]);
  
  const [form, setForm] = useState({
    title: '',
    type: 'walk',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    notes: '',
    priority: 'normal',
    notification: true,
    dogId: '' // This will hold the selected dog's ID
  });

  // Fetch user's dogs from Firebase
  useEffect(() => {
    async function loadDogs() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const dogsData = await fetchDogs(currentUser.uid);
        setDogs(dogsData);
        
        // Set the default dog if there are any
        if (dogsData.length > 0) {
          setForm(prev => ({
            ...prev,
            dogId: dogsData[0].id
          }));
        }
      } catch (error) {
        console.error("Error loading dogs:", error);
      }
    }

    async function loadCustomTypes() {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'customActivityTypes'), 
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const types = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isCustom: true
        }));
        setCustomTypes(types);
      } catch (err) {
        console.error('Error fetching custom activity types:', err);
      }
    }
    
    loadDogs();
    loadCustomTypes();
    setLoading(false);
  }, [currentUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle activity type selection
  const handleTypeChange = (typeId) => {
    if (typeId === 'custom') {
      navigate('/activity-types');
      return;
    }
    
    setForm(prev => ({
      ...prev,
      type: typeId
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      // Prepare the activity data
      const activityData = {
        ...form,
        userId: currentUser.uid,
        completed: false
      };
      
      // Add the activity to Firebase
      await addActivity(activityData);
      
      // Navigate back to calendar
      navigate('/calendar');
    } catch (error) {
      console.error("Error saving activity:", error);
      // You could add error handling here (e.g., show an error message)
    }
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no dogs, show add dog prompt
  if (dogs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">🐕</div>
        <h2 className="text-xl font-bold mb-2">No dogs yet</h2>
        <p className="text-gray-600 mb-4">Add a dog first to start tracking activities</p>
        <button
          onClick={() => navigate('/dogs/new')}
          className="bg-primary text-white py-2 px-4 rounded-lg"
        >
          Add Your First Dog
        </button>
      </div>
    );
  }

  // Combine predefined and custom types, add custom button
  const activityTypesWithCustom = [
    ...PREDEFINED_ACTIVITY_TYPES,
    { id: 'custom', label: 'Custom', icon: '🌟' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dog Selection */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dog
        </label>
        <select
          name="dogId"
          value={form.dogId}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          required
        >
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          placeholder="What activity are you planning?"
          required
        />
      </div>
      
      {/* Activity Type */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Activity Type
        </label>
        <div className="grid grid-cols-4 gap-3">
          {activityTypesWithCustom.map(type => (
            <button
              key={type.id}
              type="button"
              className={`flex flex-col items-center p-3 rounded-lg ${
                form.type === type.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTypeChange(type.id)}
            >
              <span 
                className="text-2xl mb-1"
                style={type.isCustom ? { color: type.color } : {}}
              >
                {type.icon}
              </span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Rest of the form remains the same */}
      {/* Date and Time */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>
      
      {/* Notes */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          placeholder="Add any additional details..."
        />
      </div>
      
      {/* Options */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <h3 className="font-medium">Options</h3>
        
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        
        {/* Notification */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notification"
            name="notification"
            checked={form.notification}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="notification" className="ml-2 block text-sm text-gray-700">
            Send notification reminder
          </label>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="flex-1 py-3 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-primary text-white rounded-lg font-medium"
        >
          Save Activity
        </button>
      </div>
    </form>
  );
}

export default AddActivity;