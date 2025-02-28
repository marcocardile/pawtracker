// src/pages/VaccinationRecords.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isPast, formatDistance } from 'date-fns';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import Layout from '../components/layout/Layout';

// Elenco predefinito di vaccinazioni comuni per cani
const COMMON_VACCINATIONS = [
  { 
    id: 'rabies', 
    name: 'Rabies', 
    description: 'Vaccinazione contro la rabbia, obbligatoria per legge' 
  },
  { 
    id: 'dhpp', 
    name: 'DHPP', 
    description: 'Distemper, Epatite, Parainfluenza, Parvovirus' 
  },
  { 
    id: 'bordetella', 
    name: 'Bordetella', 
    description: 'Vaccinazione contro la tosse dei canili' 
  },
  { 
    id: 'leptospirosis', 
    name: 'Leptospirosis', 
    description: 'Prevenzione della leptospirosi' 
  }
];

function VaccinationRecords() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Stati per la gestione delle vaccinazioni
  const [vaccinations, setVaccinations] = useState([]);
  const [newVaccination, setNewVaccination] = useState({
    name: COMMON_VACCINATIONS[0].id,
    date: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Carica i record delle vaccinazioni al caricamento del componente
  useEffect(() => {
    const fetchVaccinations = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, 'vaccinations'), 
          where('dogId', '==', dogId),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const vaccinationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVaccinations(vaccinationsList);
      } catch (err) {
        console.error('Errore nel recuperare le vaccinazioni:', err);
        setError('Impossibile caricare i record delle vaccinazioni');
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [dogId, currentUser, navigate]);

  // Gestisce il cambio dei campi del form per nuova vaccinazione
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVaccination(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestisce l'aggiunta di una nuova vaccinazione
  const handleAddVaccination = async (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!newVaccination.date || !newVaccination.expiryDate) {
      setError('Data e data di scadenza sono obbligatorie');
      return;
    }

    // Controllo che la data di scadenza sia successiva alla data di somministrazione
    if (new Date(newVaccination.expiryDate) <= new Date(newVaccination.date)) {
      setError('La data di scadenza deve essere successiva alla data di somministrazione');
      return;
    }

    try {
      // Prepara i dati della vaccinazione
      const vaccinationToSave = {
        ...newVaccination,
        dogId,
        userId: currentUser.uid,
        createdAt: new Date()
      };

      // Salva nel database
      const docRef = await addDoc(collection(db, 'vaccinations'), vaccinationToSave);
      
      // Aggiorna lo stato locale
      setVaccinations([
        ...vaccinations, 
        { id: docRef.id, ...vaccinationToSave }
      ]);

      // Resetta il form
      setNewVaccination({
        name: COMMON_VACCINATIONS[0].id,
        date: format(new Date(), 'yyyy-MM-dd'),
        expiryDate: '',
        notes: ''
      });
      setError('');
    } catch (err) {
      console.error('Errore durante il salvataggio della vaccinazione:', err);
      setError('Impossibile salvare la vaccinazione');
    }
  };

  // Gestisce l'eliminazione di una vaccinazione
  const handleDeleteVaccination = async (vaccinationId) => {
    try {
      await deleteDoc(doc(db, 'vaccinations', vaccinationId));
      
      // Aggiorna lo stato locale
      setVaccinations(vaccinations.filter(v => v.id !== vaccinationId));
    } catch (err) {
      console.error('Errore durante l\'eliminazione della vaccinazione:', err);
      setError('Impossibile eliminare la vaccinazione');
    }
  };

  // Calcola lo stato della vaccinazione (scaduta, in scadenza, valida)
  const getVaccinationStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    if (isPast(expiry)) return 'Scaduta';
    
    const daysUntilExpiry = formatDistance(expiry, new Date(), { addSuffix: false });
    return daysUntilExpiry.includes('day') && parseInt(daysUntilExpiry) <= 30 
      ? 'In scadenza' 
      : 'Valida';
  };

  // Determina il colore del badge in base allo stato della vaccinazione
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scaduta': return 'bg-red-500';
      case 'In scadenza': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  // Render del componente
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(`/dogs/${dogId}`)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h1 className="text-2xl font-bold">Registri Vaccinazioni</h1>
        </div>

        {/* Form per aggiungere nuova vaccinazione */}
        <form 
          onSubmit={handleAddVaccination} 
          className="bg-white rounded-lg shadow p-4 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Aggiungi Nuova Vaccinazione</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Vaccinazione
              </label>
              <select
                name="name"
                value={newVaccination.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              >
                {COMMON_VACCINATIONS.map(vax => (
                  <option key={vax.id} value={vax.id}>
                    {vax.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Somministrazione
              </label>
              <input
                type="date"
                name="date"
                value={newVaccination.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Scadenza
              </label>
              <input
                type="date"
                name="expiryDate"
                value={newVaccination.expiryDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (opzionale)
              </label>
              <input
                type="text"
                name="notes"
                value={newVaccination.notes}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Eventuali dettagli aggiuntivi"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
          >
            Aggiungi Vaccinazione
          </button>
        </form>

        {/* Lista delle vaccinazioni */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Vaccinazioni Registrate</h2>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
            </div>
          ) : vaccinations.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Nessuna vaccinazione registrata
            </div>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vax) => {
                const status = getVaccinationStatus(vax.expiryDate);
                const statusColor = getStatusColor(status);

                return (
                  <div 
                    key={vax.id} 
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {COMMON_VACCINATIONS.find(v => v.id === vax.name)?.name || vax.name}
                        </h3>
                        <span 
                          className={`px-2 py-1 rounded-full text-white text-xs ${statusColor}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Somministrata: {format(new Date(vax.date), 'dd/MM/yyyy')}
                        {' '}
                        Scadenza: {format(new Date(vax.expiryDate), 'dd/MM/yyyy')}
                      </p>
                      {vax.notes && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          Note: {vax.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteVaccination(vax.id)}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                      title="Elimina vaccinazione"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default VaccinationRecords;