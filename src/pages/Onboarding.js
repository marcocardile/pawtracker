// src/pages/Onboarding.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDog } from '../services/firebaseService';
import { format, subYears } from 'date-fns';

function Onboarding() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    birthdate: format(new Date(), 'yyyy-MM-dd'),
    gender: '',
    weight: '',
    height: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Verifica che l'utente sia autenticato
  useEffect(() => {
    if (!currentUser) {
      // Se l'utente non è autenticato, reindirizza alla pagina di login
      localStorage.removeItem('requiresOnboarding');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Calcola la data minima per il calendario (20 anni fa)
  const minDate = format(subYears(new Date(), 20), 'yyyy-MM-dd');
  // Data massima è oggi
  const maxDate = format(new Date(), 'yyyy-MM-dd');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Rimuovi eventuali errori per questo campo
    if (errors[name]) {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Aggiorna il valore nel dogData
    setDogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    switch(step) {
      case 1:
        if (!dogData.name.trim()) {
          newErrors.name = 'Dog name is required';
        }
        break;
      case 2:
        if (!dogData.breed.trim()) {
          newErrors.breed = 'Dog breed is required';
        }
        break;
      case 3:
        const birthDate = new Date(dogData.birthdate);
        const today = new Date();
        
        if (birthDate > today) {
          newErrors.birthdate = 'Birth date cannot be in the future';
        }
        break;
      case 4:
        if (!dogData.gender) {
          newErrors.gender = 'Please select a gender';
        }
        break;
      case 5:
        const weight = parseFloat(dogData.weight);
        if (isNaN(weight) || weight <= 0 || weight > 100) {
          newErrors.weight = 'Please enter a valid weight between 0 and 100 kg';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      console.error("No authenticated user");
      return;
    }
    
    try {
      setLoading(true);
      
      // Validazione finale
      const weight = parseFloat(dogData.weight);
      const height = dogData.height ? parseFloat(dogData.height) : null;

      console.log("Adding dog to database...");
      // Aggiungi il cane al database
      await addDog({
        ...dogData,
        userId: currentUser.uid,
        weight: weight,
        ...(height ? { height } : {})
      });
      
      console.log("Dog added successfully, removing onboarding flag...");
      // Rimuovi il flag di onboarding
      localStorage.removeItem('requiresOnboarding');
      
      // Pausa breve per assicurarsi che il localStorage sia aggiornato
      setTimeout(() => {
        // Reindirizza alla home
        console.log("Redirecting to home...");
        window.location.href = '/'; // Usa window.location per un reload completo
      }, 500);
    } catch (error) {
      console.error('Error saving dog profile:', error);
      alert('Failed to save dog profile. Please try again.');
    } finally {
      setLoading(false);
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
              className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter your dog's name"
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
              className={`w-full p-3 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter breed"
              required
            />
            {errors.breed && <p className="text-red-500 text-sm">{errors.breed}</p>}
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
              min={minDate}
              max={maxDate}
              className={`w-full p-3 border ${errors.birthdate ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
            />
            {errors.birthdate && <p className="text-red-500 text-sm">{errors.birthdate}</p>}
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
            <h2 className="text-2xl font-bold mb-4">What's {dogData.name}'s gender?</h2>
            <div className="flex space-x-4">
              <button 
                type="button"
                onClick={() => {
                  setDogData(prev => ({...prev, gender: 'male'}));
                  setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors.gender;
                    return newErrors;
                  });
                }}
                className={`flex-1 p-4 border rounded-md ${dogData.gender === 'male' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
              >
                Male
              </button>
              <button 
                type="button"
                onClick={() => {
                  setDogData(prev => ({...prev, gender: 'female'}));
                  setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors.gender;
                    return newErrors;
                  });
                }}
                className={`flex-1 p-4 border rounded-md ${dogData.gender === 'female' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
              >
                Female
              </button>
            </div>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
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
            <div className="relative">
              <input
                type="number"
                name="weight"
                value={dogData.weight}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Enter weight in kg"
                min="0"
                max="100"
                step="0.1"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
            </div>
            {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
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
            <h2 className="text-2xl font-bold mb-4">Almost done!</h2>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold mb-2">{dogData.name}'s Profile</h3>
              <p><strong>Breed:</strong> {dogData.breed}</p>
              <p><strong>Birthdate:</strong> {format(new Date(dogData.birthdate), 'MMMM d, yyyy')}</p>
              <p><strong>Gender:</strong> {dogData.gender === 'male' ? 'Male' : 'Female'}</p>
              <p><strong>Weight:</strong> {dogData.weight} kg</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={prevStep}
                className="flex-1 border border-gray-300 py-3 rounded-md"
                disabled={loading}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 bg-primary text-white py-3 rounded-md"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save and Continue'}
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
          <h1 className="text-2xl font-bold">Puppy Planner</h1>
          <p className="text-gray-600">Let's set up your dog's profile</p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-right text-gray-500">Step {step} of 6</div>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
}

export default Onboarding;