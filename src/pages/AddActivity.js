// src/pages/AddActivity.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function AddActivity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    type: 'walk',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    notes: '',
    priority: 'normal',
    notification: true
  });
  
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
  
  // Gestisce l'invio del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In una versione reale qui salveresti l'attività nel database
    console.log('Activity to save:', form);
    
    // Per ora torniamo semplicemente alla pagina calendario
    // In un'app reale, aggiungeremmo l'attività al calendario prima di tornare
    navigate('/calendar');
  };
  
  return (
    <>
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/calendar')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <h1 className="text-2xl font-bold">Add Activity</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titolo */}
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
        
        {/* Tipo di attività */}
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
        
        {/* Data e ora */}
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
        
        {/* Note */}
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
        
        {/* Opzioni */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="font-medium">Options</h3>
          
          {/* Priorità */}
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
          
          {/* Notifica */}
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
        
        {/* Pulsanti */}
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
    </>
  );
}

export default AddActivity;