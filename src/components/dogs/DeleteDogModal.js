// src/components/dogs/DeleteDogModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDog, deleteHealthRecord, deleteActivity } from '../../services/firebaseService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function DeleteDogModal({ dogId, dogName, isOpen, onClose }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // Handle deletion of all related records
  const handleDeleteDog = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Delete all health records associated with this dog
      const healthRecordsQuery = query(
        collection(db, 'healthRecords'),
        where('dogId', '==', dogId)
      );
      const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
      const healthRecordsPromises = healthRecordsSnapshot.docs.map(doc => 
        deleteHealthRecord(doc.id)
      );
      await Promise.all(healthRecordsPromises);

      // 2. Delete all vaccinations associated with this dog
      const vaccinationsQuery = query(
        collection(db, 'vaccinations'),
        where('dogId', '==', dogId)
      );
      const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
      const vaccinationsPromises = vaccinationsSnapshot.docs.map(doc => 
        deleteHealthRecord(doc.id)
      );
      await Promise.all(vaccinationsPromises);

      // 3. Delete all activities associated with this dog
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('dogId', '==', dogId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesPromises = activitiesSnapshot.docs.map(doc => 
        deleteActivity(doc.id)
      );
      await Promise.all(activitiesPromises);

      // 4. Finally, delete the dog itself
      await deleteDog(dogId);

      // 5. Navigate back to dogs list
      navigate('/dogs');
    } catch (err) {
      console.error('Error deleting dog:', err);
      setError('Failed to delete dog profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">Delete Dog Profile</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete {dogName}'s profile? This will also delete all activities, health records, and vaccinations associated with this dog.
        </p>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDog}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDogModal;