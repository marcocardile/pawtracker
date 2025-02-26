// src/pages/DogDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';

// Dati fittizi per i cani
const MOCK_DOGS = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    birthdate: '2020-03-15',
    gender: 'male',
    weight: 28,
    height: 56,
    microchip: '123456789012345',
    photo: null,
    notes: 'Likes to swim and play fetch. Allergic to chicken.'
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Beagle',
    birthdate: '2021-06-10',
    gender: 'female',
    weight: 12,
    height: 35,
    microchip: '987654321098765',
    photo: null,
    notes: 'Very curious and energetic. Loves to sniff everything.'
  }
];

// Dati fittizi per le vaccinazioni
const MOCK_VACCINES = [
  {
    id: '1',
    dogId: '1',
    name: 'Rabies',
    date: '2023-04-10',
    expiryDate: '2024-04-10',
    notes: 'Annual vaccination'
  },
  {
    id: '2',
    dogId: '1',
    name: 'DHPP',
    date: '2023-01-15',
    expiryDate: '2024-01-15',
    notes: 'Distemper, Hepatitis, Parainfluenza, Parvovirus'
  },
  {
    id: '3',
    dogId: '2',
    name: 'Rabies',
    date: '2023-08-05',
    expiryDate: '2024-08-05',
    notes: 'Annual vaccination'
  }
];

function DogDetail() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [dog, setDog] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Carica i dati del cane
  useEffect(() => {
    // Simulazione di caricamento dati
    setTimeout(() => {
      const foundDog = MOCK_DOGS.find(d => d.id === dogId);
      const dogVaccines = MOCK_VACCINES.filter(v => v.dogId === dogId);
      
      if (foundDog) {
        setDog(foundDog);
        setVaccines(dogVaccines);
      }
      
      setLoading(false);
    }, 500);
  }, [dogId]);
  
  // Calcola l'età in anni e mesi
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    
    const birth = new Date(birthdate);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'} and ${months} ${months === 1 ? 'month' : 'months'}`;
  };
  
  // Calcola giorni rimanenti alla scadenza
  const daysUntilExpiry = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Se è in caricamento o non è stato trovato il cane
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  if (!dog) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Dog not found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the dog you're looking for</p>
          <button
            onClick={() => navigate('/dogs')}
            className="bg-primary text-white py-2 px-4 rounded-lg"
          >
            Back to My Dogs
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/dogs')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <h1 className="text-2xl font-bold">{dog.name}</h1>
      </div>
      
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-4xl mr-4">
            🐕
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{dog.name}</h2>
            <p className="text-gray-600">{dog.breed}, {dog.gender === 'male' ? 'Male' : 'Female'}</p>
            <div className="flex space-x-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {calculateAge(dog.birthdate)}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {dog.weight} kg
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/dogs/${dogId}/edit`)}
            className="p-2 bg-gray-100 rounded-full"
          >
            ✏️
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'health' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('health')}
          >
            Health
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'activities' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* Info tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Breed</span>
                  <span>{dog.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Birth Date</span>
                  <span>{format(new Date(dog.birthdate), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age</span>
                  <span>{calculateAge(dog.birthdate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender</span>
                  <span>{dog.gender === 'male' ? 'Male' : 'Female'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-500 mb-2">Physical Characteristics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span>{dog.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height</span>
                  <span>{dog.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Microchip</span>
                  <span>{dog.microchip}</span>
                </div>
              </div>
            </div>
            
            {dog.notes && (
              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-700">{dog.notes}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Health tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-500">Vaccinations</h3>
              <button className="text-primary text-sm">+ Add Vaccine</button>
            </div>
            
            {vaccines.length > 0 ? (
              <div className="space-y-3">
                {vaccines.map(vaccine => {
                  const daysLeft = daysUntilExpiry(vaccine.expiryDate);
                  let statusColor = 'green';
                  if (daysLeft < 0) statusColor = 'red';
                  else if (daysLeft < 30) statusColor = 'yellow';
                  
                  return (
                    <div key={vaccine.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{vaccine.name}</h4>
                          <p className="text-sm text-gray-500">{vaccine.notes}</p>
                        </div>
                        <span className={`text-xs bg-${statusColor}-100 text-${statusColor}-800 px-2 py-0.5 rounded-full`}>
                          {daysLeft < 0 ? 'Expired' : daysLeft < 30 ? `Expires in ${daysLeft} days` : 'Valid'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 text-gray-500">
                        <span>Date: {format(new Date(vaccine.date), 'MMM d, yyyy')}</span>
                        <span>Expires: {format(new Date(vaccine.expiryDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                <p>No vaccinations recorded yet</p>
                <button className="mt-2 text-primary">Add first vaccination</button>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-500">Weight History</h3>
                <button className="text-primary text-sm">+ Add Weight</button>
              </div>
              <div className="text-center p-4 text-gray-500">
                <p>No weight records yet</p>
                <button className="mt-2 text-primary">Add first weight record</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Activities tab */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-500">Recent Activities</h3>
              <button 
                className="text-primary text-sm"
                onClick={() => navigate('/add')}
              >
                + Add Activity
              </button>
            </div>
            
            <div className="text-center p-4 text-gray-500">
              <p>No activities recorded for {dog.name} yet</p>
              <button 
                className="mt-2 text-primary"
                onClick={() => navigate('/add')}
              >
                Add first activity
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DogDetail;