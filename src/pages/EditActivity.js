// src/pages/EditActivity.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { fetchDogs, updateActivity, deleteActivity } from '../services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function EditActivity() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    type: 'walk',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    notes: '',
    priority: 'normal',
    notification: true,
    completed: false,
    dogId: ''
  });

  // Fetch user's dogs and the activity data
  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get all dogs owned by the user
        const dogsData = await fetchDogs(currentUser.uid);
        setDogs(dogsData);
        
        // Get the selected activity from Firestore
        const docRef = doc(db, "activities", activityId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const activityData = docSnap.data();
          setForm({
            title: activityData.title,
            type: activityData.type,
            date: activityData.date,
            time: activityData.time,
            notes: activityData.notes || '',
            priority: activityData.priority || 'normal',
            notification: activityData.notification !== false,
            completed: activityData.completed || false,
            dogId: activityData.dogId
          });
        } else {
          // Activity not found
          navigate('/calendar');
        }
      } catch (error) {
        console.error("Error loading data:", error);
        navigate('/calendar');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [currentUser, activityId, navigate]);

  // Array of activity types
  const activityTypes = [
    { id: 'walk', label: 'Walk', icon: '🚶' },
    { id: 'food', label: 'Food', icon: '🍖' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'play', label: 'Play', icon: '🎾' },
    { id: 'vet', label: 'Vet Visit', icon: '💉' },
    { id: 'medicine', label: 'Medicine', icon: '💊' },
    { id: 'groom', label: 'Grooming', icon: '✂️' },
    { id: 'training', label: 'Training', icon: '🏋️' }
  ];

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
    setForm(prev => ({
      ...prev,
      type: typeId
    }));
  };

  // Toggle completion status
  const toggleComplete = () => {
    setForm(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  // Handle activity deletion
  const handleDelete = async () => {
    try {
      await deleteActivity(activityId);
      navigate('/calendar');
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update the activity in Firebase
      await updateActivity(activityId, {
        ...form,
        userId: currentUser.uid
      });
      
      // Navigate back to calendar
      navigate('/calendar');
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // JSX is similar to AddActivity with a few additions
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/calendar')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h1 className="text-2xl font-bold">Edit Activity</h1>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
        >
          🗑️
        </button>
      </div>
      
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
        
        {/* Status */}
        {/* Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium">Status</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${form.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {form.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleComplete}
              className={`px-3 py-1 rounded-lg text-white text-sm ${form.completed ? 'bg-yellow-500' : 'bg-green-500'}`}
            >
              {form.completed ? 'Mark as Pending' : 'Mark as Completed'}
            </button>
          </div>
        </div>
        
        {/* Activity Type */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Activity Type
          </label>
          <div className="grid grid-cols-4 gap-3">
            {activityTypes.map(type => (
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
                <span className="text-2xl mb-1">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
        
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
            Save Changes
          </button>
        </div>
      </form>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Delete Activity</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditActivity;