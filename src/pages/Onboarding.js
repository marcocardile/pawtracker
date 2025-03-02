// src/pages/Onboarding.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDog } from '../services/firebaseService';
import { format } from 'date-fns';

function Onboarding() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    birthdate: format(new Date(), 'yyyy-MM-dd'), // Imposta data corrente come default
    gender: '',
    weight: '',
    height: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Validazioni specifiche per campo
    switch(name) {
      case 'birthdate':
        const selectedDate = new Date(value);
        const today = new Date();
        
        if (selectedDate > today) {
          // Se la data è nel futuro, imposta la data corrente
          processedValue = format(today, 'yyyy-MM-dd');
        }
        break;
      
      case 'weight':
        // Converti in numero e limita a 2 decimali
        const numericWeight = parseFloat(value);
        
        if (!isNaN(numericWeight) && numericWeight >= 0 && numericWeight <= 100) {
          processedValue = numericWeight.toFixed(1);
        } else {
          processedValue = '';
        }
        break;
    }

    setDogData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Rimuovi eventuali errori per questo campo
    if (errors[name]) {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validazione finale
      const weight = parseFloat(dogData.weight);
      const height = dogData.height ? parseFloat(dogData.height) : null;

      await addDog({
        ...dogData,
        userId: currentUser.uid,
        weight: weight,
        ...(height ? { height } : {}) // Aggiungi height solo se è un numero valido
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving dog profile:', error);
      alert('Failed to save dog profile. Please try again.');
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
      
      // Gli altri casi di step seguono la stessa logica di validazione
      // con aggiunti controlli di errore e stili condizionali
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">When was {dogData.name} born?</h2>
            <input
              type="date"
              name="birthdate"
              value={dogData.birthdate}
              onChange={handleChange}
              max={format(new Date(), 'yyyy-MM-dd')} // Impedisce date future
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
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">How much does {dogData.name} weigh?</h2>
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
      
      // Resto del codice rimane simile
      
      default:
        return null;
    }
  };

  // Resto del componente rimane invariato
}

export default Onboarding;