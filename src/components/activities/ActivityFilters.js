// src/components/activities/ActivityFilters.js
import React from 'react';

function ActivityFilters({ filters, setFilters, onReset }) {
  // Tipi di attività
  const activityTypes = [
    { id: 'all', label: 'All', icon: '✦' },
    { id: 'walk', label: 'Walk', icon: '🚶' },
    { id: 'food', label: 'Food', icon: '🍖' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'play', label: 'Play', icon: '🎾' },
    { id: 'vet', label: 'Vet', icon: '💉' },
    { id: 'medicine', label: 'Medicine', icon: '💊' },
    { id: 'groom', label: 'Grooming', icon: '✂️' },
    { id: 'training', label: 'Training', icon: '🏋️' }
  ];
  
  // Stati possibili
  const statusOptions = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' }
  ];
  
  // Opzioni di ordinamento
  const sortOptions = [
    { id: 'time-asc', label: 'Time (earlier first)' },
    { id: 'time-desc', label: 'Time (later first)' },
    { id: 'type', label: 'Activity Type' },
    { id: 'priority', label: 'Priority' }
  ];
  
  // Gestisce il cambio del tipo di attività
  const handleTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      type: type
    }));
  };
  
  // Gestisce il cambio dello stato
  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: status
    }));
  };
  
  // Gestisce il cambio dell'ordinamento
  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sort: e.target.value
    }));
  };
  
  // Reimposta tutti i filtri
  const handleReset = () => {
    setFilters({
      type: 'all',
      status: 'all',
      sort: 'time-asc'
    });
    
    if (onReset) onReset();
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Filters</h3>
        <button 
          onClick={handleReset}
          className="text-sm text-primary"
        >
          Reset All
        </button>
      </div>
      
      {/* Activity Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Activity Type
        </label>
        <div className="flex overflow-x-auto pb-2 -mx-1">
          {activityTypes.map(type => (
            <button
              key={type.id}
              className={`flex flex-col items-center p-2 mx-1 rounded-lg min-w-[60px] ${
                filters.type === type.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleTypeChange(type.id)}
            >
              <span className="text-lg mb-1">{type.icon}</span>
              <span className="text-xs whitespace-nowrap">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex space-x-2">
          {statusOptions.map(option => (
            <button
              key={option.id}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.status === option.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleStatusChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          {sortOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ActivityFilters;