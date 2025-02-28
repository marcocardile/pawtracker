// src/pages/CustomActivityTypes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc 
} from 'firebase/firestore';

// Icone predefinite per i tipi di attività personalizzati
const PREDEFINED_ICONS = [
  '🌟', '🎨', '🏆', '🌈', '🚀', '🎉', '🌺', '🍄', 
  '🔬', '🎸', '🧩', '🌍', '🚲', '🍳', '🎳', '🏕️'
];

// Colori predefiniti per i tipi di attività
const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', 
  '#6C5CE7', '#A8E6CF', '#FF8ED4', '#FAD390', 
  '#55E6C1', '#5F27CD', '#48DBFB', '#FF6F61'
];

function CustomActivityTypes() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [customTypes, setCustomTypes] = useState([]);
  const [newType, setNewType] = useState({
    name: '',
    icon: '🌟',
    color: '#FF6B6B'
  });
  const [error, setError] = useState('');

  // Carica i tipi di attività personalizzati dell'utente
  useEffect(() => {
    const fetchCustomTypes = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const q = query(
          collection(db, 'customActivityTypes'), 
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const types = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomTypes(types);
      } catch (err) {
        console.error('Error fetching custom activity types:', err);
        setError('Could not load custom activity types');
      }
    };

    fetchCustomTypes();
  }, [currentUser, navigate]);

  // Gestisce la creazione di un nuovo tipo di attività personalizzato
  const handleCreateType = async (e) => {
    e.preventDefault();
    
    // Validazione
    if (!newType.name.trim()) {
      setError('Activity type name cannot be empty');
      return;
    }

    // Verifica che non esistano già tipi con lo stesso nome
    const duplicateType = customTypes.find(
      type => type.name.toLowerCase() === newType.name.toLowerCase()
    );
    if (duplicateType) {
      setError('An activity type with this name already exists');
      return;
    }

    try {
      // Salva nel database
      const typeToSave = {
        ...newType,
        userId: currentUser.uid,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'customActivityTypes'), typeToSave);
      
      // Aggiorna lo stato locale
      setCustomTypes([
        ...customTypes, 
        { id: docRef.id, ...typeToSave }
      ]);

      // Resetta il form
      setNewType({
        name: '',
        icon: '🌟',
        color: '#FF6B6B'
      });
      setError('');
    } catch (err) {
      console.error('Error creating custom activity type:', err);
      setError('Could not create activity type');
    }
  };

  // Elimina un tipo di attività personalizzato
  const handleDeleteType = async (typeId) => {
    try {
      await deleteDoc(doc(db, 'customActivityTypes', typeId));
      
      // Aggiorna lo stato locale
      setCustomTypes(customTypes.filter(type => type.id !== typeId));
    } catch (err) {
      console.error('Error deleting custom activity type:', err);
      setError('Could not delete activity type');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <h1 className="text-2xl font-bold">Custom Activity Types</h1>
      </div>

      {/* Form per aggiungere nuovo tipo di attività */}
      <form 
        onSubmit={handleCreateType} 
        className="bg-white rounded-lg shadow p-4 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Create New Activity Type</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={newType.name}
            onChange={(e) => setNewType({...newType, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Enter activity type name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {PREDEFINED_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewType({...newType, icon})}
                className={`text-3xl p-2 rounded-lg ${
                  newType.icon === icon 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewType({...newType, color})}
                style={{ backgroundColor: color }}
                className={`h-10 w-10 rounded-full ${
                  newType.color === color 
                    ? 'ring-4 ring-primary/50' 
                    : 'hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
        >
          Create Activity Type
        </button>
      </form>

      {/* Lista dei tipi di attività personalizzati */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Your Custom Activity Types</h2>
        
        {customTypes.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No custom activity types yet
          </div>
        ) : (
          <div className="space-y-3">
            {customTypes.map((type) => (
              <div 
                key={type.id} 
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="text-3xl"
                    style={{ color: type.color }}
                  >
                    {type.icon}
                  </div>
                  <span className="font-medium">{type.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteType(type.id)}
                  className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomActivityTypes;