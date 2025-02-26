// src/pages/AddDog.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddDog() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    breed: '',
    birthdate: '',
    gender: 'male',
    weight: '',
    height: '',
    microchip: '',
    notes: ''
  });
  
  // Gestisce il cambiamento dei campi del form
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };
  
  // Gestisce l'invio del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In una versione reale qui salveresti i dati del cane nel database
    console.log('Dog to save:', form);
    
    // Per ora torniamo semplicemente alla pagina cani
    navigate('/dogs');
  };
  
  return (
    <>
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/dogs')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <h1 className="text-2xl font-bold">Add New Dog</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium text-gray-700 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed*
              </label>
              <input
                type="text"
                name="breed"
                value={form.breed}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date*
              </label>
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === 'male'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === 'female'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Physical Characteristics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium text-gray-700 mb-4">Physical Characteristics</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microchip Number
              </label>
              <input
                type="text"
                name="microchip"
                value={form.microchip}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium text-gray-700 mb-4">Additional Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Any special needs, allergies, behavior traits, etc."
            />
          </div>
        </div>
        
        {/* Upload Photo (future implementation) */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium text-gray-700 mb-4">Photo</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Photo upload coming soon</p>
              <p className="text-xs mt-1">Supported formats: JPG, PNG</p>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dogs')}
            className="flex-1 py-3 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-white rounded-lg font-medium"
          >
            Save Dog
          </button>
        </div>
      </form>
    </>
  );
}

export default AddDog;