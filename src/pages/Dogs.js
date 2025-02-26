// src/pages/Dogs.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Dati fittizi per i cani
const MOCK_DOGS = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    birthdate: '2020-03-15',
    weight: 28,
    photo: null
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Beagle',
    birthdate: '2021-06-10',
    weight: 12,
    photo: null
  }
];

function Dogs() {
  const [dogs] = useState(MOCK_DOGS);
  const navigate = useNavigate();
  
  // Funzione per calcolare l'età in base alla data di nascita
  const calculateAge = (birthdate) => {
    const birth = new Date(birthdate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    
    if (diffYears === 0) {
      const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
    }
    
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`;
  };
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Dogs</h1>
        <button
          onClick={() => navigate('/dogs/new')}
          className="bg-primary text-white py-2 px-4 rounded-lg"
        >
          Add Dog
        </button>
      </div>
      
      <div className="space-y-4">
        {dogs.map(dog => (
          <div 
            key={dog.id}
            className="bg-white rounded-lg shadow p-4 flex items-center"
            onClick={() => navigate(`/dogs/${dog.id}`)}
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl mr-4">
              🐕
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{dog.name}</h2>
              <p className="text-gray-600">{dog.breed}, {calculateAge(dog.birthdate)}</p>
              <div className="flex space-x-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {dog.weight} kg
                </span>
              </div>
            </div>
            <div className="text-gray-400">
              &gt;
            </div>
          </div>
        ))}
      </div>
      
      {dogs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-5xl mb-4">🐕</div>
          <h2 className="text-xl font-bold mb-2">No dogs yet</h2>
          <p className="text-gray-600 mb-4">Add your furry friend to start tracking activities</p>
          <button
            onClick={() => navigate('/dogs/new')}
            className="bg-primary text-white py-2 px-4 rounded-lg"
          >
            Add Your First Dog
          </button>
        </div>
      )}
    </>
  );
}

export default Dogs;