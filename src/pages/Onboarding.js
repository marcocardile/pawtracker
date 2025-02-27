// src/pages/Onboarding.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDog } from '../services/firebaseService';

function Onboarding() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    birthdate: '',
    gender: '',
    weight: '',
    height: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aggiungi il cane con l'ID dell'utente corrente
      await addDog({
        ...dogData,
        userId: currentUser.uid,
        weight: parseFloat(dogData.weight),
        height: parseFloat(dogData.height)
      });
      
      // Dopo aver salvato il cane, vai alla home
      navigate('/');
    } catch (error) {
      console.error('Error saving dog profile:', error);
      // Gestisci l'errore (mostra un messaggio all'utente)
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">What's your dog's name?</h2>
            <input
              type="text"
              name="name"
              value={dogData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your dog's name"
              required
            />
            <button 
              onClick={nextStep}
              className="w-full bg-primary text-white py-3 rounded-md mt-4"
            >
              Next
            </button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">What breed is {dogData.name}?</h2>
            <input
              type="text"
              name="breed"
              value={dogData.breed}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter dog's breed"
              required
            />
            <div className="flex space-x-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-primary text-white py-3 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">When was {dogData.name} born?</h2>
            <input
              type="date"
              name="birthdate"
              value={dogData.birthdate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
            <div className="flex space-x-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-primary text-white py-3 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">What is {dogData.name}'s gender?</h2>
            <div className="flex space-x-4">
              <label className="flex-1 flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={dogData.gender === 'male'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span>Male</span>
              </label>
              <label className="flex-1 flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={dogData.gender === 'female'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span>Female</span>
              </label>
            </div>
            <div className="flex space-x-4 mt-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-primary text-white py-3 rounded-md"
                disabled={!dogData.gender}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">How much does {dogData.name} weigh?</h2>
            <input
              type="number"
              name="weight"
              value={dogData.weight}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter weight in kg"
              min="0"
              step="0.1"
              required
            />
            <div className="flex space-x-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-primary text-white py-3 rounded-md"
                disabled={!dogData.weight}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Additional Notes</h2>
            <textarea
              name="notes"
              value={dogData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Any special needs, allergies, or important information about your dog"
              rows="4"
            />
            <div className="flex space-x-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 bg-primary text-white py-3 rounded-md"
              >
                Complete Profile
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white text-2xl mb-4">
            🐾
          </div>
          <h1 className="text-2xl font-bold">PawTracker</h1>
          <p className="text-gray-600">Complete Your Dog's Profile</p>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ 
                width: `${(step / 6) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
}

export default Onboarding;