// src/pages/EditActivity.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

// Mock data solo per la demo
import { MOCK_ACTIVITIES } from '../data/mockData';

function EditActivity() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    type: 'walk',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    notes: '',
    priority: 'normal',
    notification: true,
    completed: false
  });
  
  // Find activity data
  useEffect(() => {
    // In a real app, this would be an API call
    const activity = MOCK_ACTIVITIES.find(a => a.id.toString() === activityId);
    
    if (activity) {
      setForm({
        title: activity.title,
        type: activity.type,
        date: activity.date,
        time: activity.time,
        notes: activity.notes || '',
        priority: activity.priority || 'normal',
        notification: activity.notification !== false,
        completed: activity.completed || false
      });
    } else {
      // Activity not found, go back to calendar
      navigate('/calendar');
    }
  }, [activityId, navigate]);
  
  // Array di tipi di attività
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
  
  // Gestisce il cambiamento dei campi del form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Gestisce il cambiamento del tipo di attività
  const handleTypeChange = (typeId) => {
    setForm(prev => ({
      ...prev,
      type: typeId
    }));
  };
  
  // Gestisce il toggle di completamento
  const toggleComplete = () => {
    setForm(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };
  
  // Gestisce l'eliminazione dell'attività
  const handleDelete = () => {
    // In a real app, this would be an API call
    console.log('Deleting activity:', activityId);
    // Redirect to calendar after deletion
    navigate('/calendar');
  };
  
  // Gestisce l'invio del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    console.log('Updated activity:', {
      id: activityId,
      ...form
    });
    
    // Redirect to calendar after update
    navigate('/calendar');
  };
  
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