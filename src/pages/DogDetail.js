// src/pages/DogDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchActivities, 
  fetchVaccines,
  fetchHealthRecords, 
  addHealthRecord, 
  deleteHealthRecord,
  updateDog
} from '../services/firebaseService';
import DogWeightChart from '../components/health/DogWeightChart';

function DogDetail() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [dog, setDog] = useState(null);
  const [dogActivities, setDogActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vaccines, setVaccines] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [medRecords, setMedRecords] = useState([]);
  const [vetRecords, setVetRecords] = useState([]);
  
  // Modal states
  const [showAddWeightModal, setShowAddWeightModal] = useState(false);
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  
  // Form states
  const [newWeightRecord, setNewWeightRecord] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    notes: ''
  });
  
  const [newVaccineRecord, setNewVaccineRecord] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: '',
    notes: ''
  });
  
  const [newMedicationRecord, setNewMedicationRecord] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    dosage: '',
    frequency: 'daily',
    notes: ''
  });
  
  const [newVetRecord, setNewVetRecord] = useState({
    reason: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    veterinarian: '',
    location: '',
    notes: ''
  });

  // Carica i dati del cane
  useEffect(() => {
    const fetchDogData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Carica i dati del cane
        const dogDoc = await getDoc(doc(db, "dogs", dogId));
        
        if (dogDoc.exists()) {
          setDog({ id: dogDoc.id, ...dogDoc.data() });
          
          // Carica le attività del cane
          const activities = await fetchActivities(currentUser.uid);
          setDogActivities(activities.filter(a => a.dogId === dogId));
          
          // Carica le vaccinazioni
          try {
            const fetchedVaccines = await fetchVaccines(dogId);
            setVaccines(fetchedVaccines);
          } catch (error) {
            console.error("Error loading vaccines:", error);
          }

          // Fetch health records
          try {
            const records = await fetchHealthRecords(dogId);
            setHealthRecords(records);
            
            // Sort records by type
            const weightRecs = records.filter(record => record.type === 'weight')
              .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setWeightRecords(weightRecs);
            
            // Create initial weight record if none exists and dog has weight property
            if (weightRecs.length === 0 && dogDoc.exists() && dogDoc.data().weight) {
              const initialWeight = {
                type: 'weight',
                dogId,
                userId: currentUser.uid,
                date: format(new Date(dogDoc.data().birthdate || new Date()), 'yyyy-MM-dd'),
                weight: parseFloat(dogDoc.data().weight),
                notes: 'Initial weight'
              };
              
              try {
                const docRef = await addHealthRecord(initialWeight);
                
                // Add to local state with the real ID
                setWeightRecords([{
                  id: docRef.id,
                  ...initialWeight
                }]);
              } catch (error) {
                console.error("Error creating initial weight record:", error);
              }
            }
              
            setVaccineRecords(records.filter(record => record.type === 'vaccine')
              .sort((a, b) => new Date(b.date) - new Date(a.date)));
              
            setMedRecords(records.filter(record => record.type === 'medication')
              .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
              
            setVetRecords(records.filter(record => record.type === 'vet')
              .sort((a, b) => new Date(b.date) - new Date(a.date)));
          } catch (error) {
            console.error("Error loading health records:", error);
          }
        }
      } catch (error) {
        console.error("Error loading dog:", error);
      }
      setLoading(false);
    };
    
    fetchDogData();
  }, [dogId, currentUser]);
  
  // Calcola l'età in anni e mesi
  function calculateAge(birthdate) {
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
  }
  
  // Calcola giorni rimanenti alla scadenza
  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    return differenceInDays(expiry, now);
  };

  // Handle adding a new weight record
  const handleAddWeight = async (e) => {
    e.preventDefault();
    
    try {
      const weightData = {
        type: 'weight',
        dogId,
        userId: currentUser.uid,
        date: newWeightRecord.date,
        weight: parseFloat(newWeightRecord.weight),
        notes: newWeightRecord.notes
      };
      
      await addHealthRecord(weightData);
      
      // Add to local state
      const newRecord = {
        id: Date.now().toString(), // Temporary ID until refresh
        ...weightData
      };
      
      // Update weight records list
      setWeightRecords([newRecord, ...weightRecords]);
      
      // Also update the main dog weight property
      await updateDog(dogId, { weight: parseFloat(newWeightRecord.weight) });
      
      // Update local dog state
      setDog(prevDog => ({
        ...prevDog,
        weight: parseFloat(newWeightRecord.weight)
      }));
      
      setShowAddWeightModal(false);
      
      // Reset form
      setNewWeightRecord({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding weight record:', error);
    }
  };

  // Handle adding a new vaccine record
  const handleAddVaccine = async (e) => {
    e.preventDefault();
    
    try {
      const vaccineData = {
        type: 'vaccine',
        dogId,
        userId: currentUser.uid,
        name: newVaccineRecord.name,
        date: newVaccineRecord.date,
        expiryDate: newVaccineRecord.expiryDate || null,
        notes: newVaccineRecord.notes
      };
      
      const docRef = await addHealthRecord(vaccineData);
      
      // Add to local state
      const newRecord = {
        id: docRef.id,
        ...vaccineData
      };
      
      setVaccineRecords([newRecord, ...vaccineRecords]);
      setShowAddVaccineModal(false);
      
      // Reset form
      setNewVaccineRecord({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        expiryDate: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding vaccine record:', error);
    }
  };

  // Handle adding a new medication record
  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    try {
      const medicationData = {
        type: 'medication',
        dogId,
        userId: currentUser.uid,
        name: newMedicationRecord.name,
        startDate: newMedicationRecord.startDate,
        endDate: newMedicationRecord.endDate || null,
        dosage: newMedicationRecord.dosage,
        frequency: newMedicationRecord.frequency,
        notes: newMedicationRecord.notes
      };
      
      await addHealthRecord(medicationData);
      
      // Add to local state
      const newRecord = {
        id: Date.now().toString(), // Temporary ID until refresh
        ...medicationData
      };
      
      setMedRecords([newRecord, ...medRecords]);
      setShowAddMedicationModal(false);
      
      // Reset form
      setNewMedicationRecord({
        name: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        dosage: '',
        frequency: 'daily',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding medication record:', error);
    }
  };

  // Handle adding a new vet appointment
  const handleAddVetAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const vetData = {
        type: 'vet',
        dogId,
        userId: currentUser.uid,
        reason: newVetRecord.reason,
        date: newVetRecord.date,
        time: newVetRecord.time,
        veterinarian: newVetRecord.veterinarian,
        location: newVetRecord.location,
        notes: newVetRecord.notes
      };
      
      await addHealthRecord(vetData);
      
      // Add to local state
      const newRecord = {
        id: Date.now().toString(), // Temporary ID until refresh
        ...vetData
      };
      
      setVetRecords([newRecord, ...vetRecords]);
      setShowAddVetModal(false);
      
      // Reset form
      setNewVetRecord({
        reason: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        veterinarian: '',
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding vet appointment:', error);
    }
  };

  // Delete health record
  const deleteRecord = async (recordId, recordType) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await deleteHealthRecord(recordId);
      
      // Update state based on record type
      if (recordType === 'weight') {
        setWeightRecords(weightRecords.filter(r => r.id !== recordId));
      } else if (recordType === 'vaccine') {
        setVaccineRecords(vaccineRecords.filter(r => r.id !== recordId));
      } else if (recordType === 'medication') {
        setMedRecords(medRecords.filter(r => r.id !== recordId));
      } else if (recordType === 'vet') {
        setVetRecords(vetRecords.filter(r => r.id !== recordId));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  // Generate weight chart data (will be used with a chart library)
  const generateWeightChartData = () => {
    return weightRecords.map(record => ({
      date: record.date,
      weight: record.weight
    })).reverse(); // Reverse to show chronological order
  };
  
  // Se è in caricamento o non è stato trovato il cane
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!dog) {
    return (
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
    );
  }
  
  return (
    <>
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
                {dog.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height</span>
                    <span>{dog.height} cm</span>
                  </div>
                )}
                {dog.microchip && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Microchip</span>
                    <span>{dog.microchip}</span>
                  </div>
                )}
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
        
        {/* Health tab - Enhanced version with comprehensive records */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* Weight Records */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Weight History</h3>
                <button 
                  className="text-primary text-sm"
                  onClick={() => setShowAddWeightModal(true)}
                >
                  + Add Weight
                </button>
              </div>
              
              {weightRecords.length > 0 ? (
                <div>
                  {/* Weight Chart will go here - for now just a placeholder */}
                  <div className="border rounded-lg p-3 bg-gray-50 mb-3">
                  <DogWeightChart weightRecords={weightRecords} />
                </div>
                  
                  {/* Weight Records Table */}
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {weightRecords.map(record => (
                          <tr key={record.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{record.weight} kg</td>
                            <td className="px-4 py-3 text-sm">{record.notes}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteRecord(record.id, 'weight')}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500 border rounded-lg">
                  <p>No weight records yet</p>
                  <button 
                    className="mt-2 text-primary"
                    onClick={() => setShowAddWeightModal(true)}
                  >
                    Add first weight record
                  </button>
                </div>
              )}
            </div>
            
            {/* Vaccinations */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Vaccinations</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-primary text-sm"
                    onClick={() => setShowAddVaccineModal(true)}
                  >
                    + Add Vaccine
                  </button>
                  <button 
                    className="text-primary text-sm"
                    onClick={() => navigate(`/dogs/${dogId}/vaccinations`)}
                  >
                    Manage Vaccinations
                  </button>
                </div>
              </div>
              
              {vaccineRecords.length > 0 ? (
                <div className="space-y-3">
                  {vaccineRecords.map(vaccine => {
                    const daysLeft = vaccine.expiryDate ? daysUntilExpiry(vaccine.expiryDate) : null;
                    let statusColor = 'green';
                    let statusText = 'Valid';
                    
                    if (daysLeft !== null) {
                      if (daysLeft < 0) {
                        statusColor = 'red';
                        statusText = 'Expired';
                      } else if (daysLeft < 30) {
                        statusColor = 'yellow';
                        statusText = `Expires in ${daysLeft} days`;
                      }
                    }
                    
                    return (
                      <div key={vaccine.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{vaccine.name}</h4>
                            <p className="text-sm text-gray-500">{vaccine.notes}</p>
                          </div>
                          {daysLeft !== null && (
                            <span className={`text-xs bg-${statusColor}-100 text-${statusColor}-800 px-2 py-0.5 rounded-full`}>
                              {statusText}
                            </span>
                          )}
                          <button 
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => deleteRecord(vaccine.id, 'vaccine')}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex justify-between text-sm mt-2 text-gray-500">
                          <span>Date: {format(new Date(vaccine.date), 'MMM d, yyyy')}</span>
                          {vaccine.expiryDate && (
                            <span>Expires: {format(new Date(vaccine.expiryDate), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500 border rounded-lg">
                  <p>No vaccinations recorded yet</p>
                  <button 
                    className="mt-2 text-primary"
                    onClick={() => setShowAddVaccineModal(true)}
                  >
                    Add first vaccination
                  </button>
                </div>
              )}
            </div>
            
            {/* Medications */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Medications</h3>
                <button 
                  className="text-primary text-sm"
                  onClick={() => setShowAddMedicationModal(true)}
                >
                  + Add Medication
                </button>
              </div>
              
              {medRecords.length > 0 ? (
                <div className="space-y-3">
                  {medRecords.map(medication => {
                    const isActive = !medication.endDate || new Date(medication.endDate) >= new Date();
                    
                    return (
                      <div key={medication.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-gray-500">
                              {medication.dosage}, {medication.frequency}
                            </p>
                            <p className="text-sm text-gray-500">{medication.notes}</p>
                          </div>
                          <span className={`text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-2 py-0.5 rounded-full`}>
                            {isActive ? 'Active' : 'Completed'}
                          </span>
                          <button 
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => deleteRecord(medication.id, 'medication')}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex justify-between text-sm mt-2 text-gray-500">
                          <span>Start: {format(new Date(medication.startDate), 'MMM d, yyyy')}</span>
                          {medication.endDate && (
                            <span>End: {format(new Date(medication.endDate), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500 border rounded-lg">
                  <p>No medications recorded yet</p>
                  <button 
                    className="mt-2 text-primary"
                    onClick={() => setShowAddMedicationModal(true)}
                  >
                    Add first medication
                  </button>
                </div>
              )}
            </div>
            
            {/* Vet Visits */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Veterinary Visits</h3>
                <button 
                  className="text-primary text-sm"
                  onClick={() => setShowAddVetModal(true)}
                >
                  + Add Vet Visit
                </button>
              </div>
              
              {vetRecords.length > 0 ? (
                <div className="space-y-3">
                  {vetRecords.map(visit => {
                    const isPast = new Date(`${visit.date}T${visit.time}`) < new Date();
                    
                    return (
                      <div key={visit.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{visit.reason}</h4>
                            {visit.veterinarian && (
                              <p className="text-sm text-gray-500">Dr. {visit.veterinarian}</p>
                            )}
                            {visit.location && (
                              <p className="text-sm text-gray-500">{visit.location}</p>
                            )}
                            <p className="text-sm text-gray-500">{visit.notes}</p>
                          </div>
                          <span className={`text-xs ${isPast ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'} px-2 py-0.5 rounded-full`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                          <button 
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => deleteRecord(visit.id, 'vet')}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex text-sm mt-2 text-gray-500">
                          <span>{format(new Date(visit.date), 'MMM d, yyyy')} at {visit.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500 border rounded-lg">
                  <p>No vet visits recorded yet</p>
                  <button 
                    className="mt-2 text-primary"
                    onClick={() => setShowAddVetModal(true)}
                  >
                    Add first vet visit
                  </button>
                </div>
              )}
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
            
            {dogActivities && dogActivities.length > 0 ? (
              <div className="space-y-3">
                {dogActivities.map(activity => (
                  <div key={activity.id} className="bg-white rounded-lg shadow p-3 flex items-center">
                    {/* Activity content */}
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{activity.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                <p>No activities recorded for {dog.name} yet</p>
                <button 
                  className="mt-2 text-primary"
                  onClick={() => navigate('/add')}
                >
                  Add first activity
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Weight Modal */}
      {showAddWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Weight Record</h3>
            <form onSubmit={handleAddWeight}>
              {/* Form fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newWeightRecord.date}
                  onChange={(e) => setNewWeightRecord({...newWeightRecord, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightRecord.weight}
                  onChange={(e) => setNewWeightRecord({...newWeightRecord, weight: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newWeightRecord.notes}
                  onChange={(e) => setNewWeightRecord({...newWeightRecord, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddWeightModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Vaccine Modal */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Vaccination Record</h3>
            <form onSubmit={handleAddVaccine}>
              {/* Form fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={newVaccineRecord.name}
                  onChange={(e) => setNewVaccineRecord({...newVaccineRecord, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newVaccineRecord.date}
                  onChange={(e) => setNewVaccineRecord({...newVaccineRecord, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newVaccineRecord.expiryDate}
                  onChange={(e) => setNewVaccineRecord({...newVaccineRecord, expiryDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newVaccineRecord.notes}
                  onChange={(e) => setNewVaccineRecord({...newVaccineRecord, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVaccineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Medication Modal */}
      {showAddMedicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Medication Record</h3>
            <form onSubmit={handleAddMedication}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={newMedicationRecord.name}
                  onChange={(e) => setNewMedicationRecord({...newMedicationRecord, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newMedicationRecord.startDate}
                    onChange={(e) => setNewMedicationRecord({...newMedicationRecord, startDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={newMedicationRecord.endDate}
                    onChange={(e) => setNewMedicationRecord({...newMedicationRecord, endDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newMedicationRecord.dosage}
                    onChange={(e) => setNewMedicationRecord({...newMedicationRecord, dosage: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={newMedicationRecord.frequency}
                    onChange={(e) => setNewMedicationRecord({...newMedicationRecord, frequency: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newMedicationRecord.notes}
                  onChange={(e) => setNewMedicationRecord({...newMedicationRecord, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedicationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Vet Visit Modal */}
      {showAddVetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Veterinary Visit</h3>
            <form onSubmit={handleAddVetAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={newVetRecord.reason}
                  onChange={(e) => setNewVetRecord({...newVetRecord, reason: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newVetRecord.date}
                    onChange={(e) => setNewVetRecord({...newVetRecord, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newVetRecord.time}
                    onChange={(e) => setNewVetRecord({...newVetRecord, time: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian</label>
                  <input
                    type="text"
                    value={newVetRecord.veterinarian}
                    onChange={(e) => setNewVetRecord({...newVetRecord, veterinarian: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newVetRecord.location}
                    onChange={(e) => setNewVetRecord({...newVetRecord, location: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newVetRecord.notes}
                  onChange={(e) => setNewVetRecord({...newVetRecord, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVetModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
          <div className="mt-4">
  <button
    onClick={() => navigate(`/analytics/${dogId}`)}
    className="w-full bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center"
  >
    <span className="mr-2">📊</span> View Dog Analytics
  </button>
</div>
        </div>
      )}
    </>
  );
}

export default DogDetail;