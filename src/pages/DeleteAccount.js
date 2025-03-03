// src/pages/DeleteAccount.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, /*auth*/ } from '../firebase';

function DeleteAccount() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmStep, setConfirmStep] = useState(1);
  
  // Stato per la riautenticazione
  const [password, setPassword] = useState('');
  const [showReauthModal, setShowReauthModal] = useState(false);

  // Funzione per eliminare tutti i dati associati all'utente
  const deleteUserData = async (userId) => {
    const collections = [
      'dogs', 
      'activities', 
      'healthRecords', 
      'vaccinations', 
      'notifications', 
      'userSettings'
    ];

    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      // Elimina i documenti uno alla volta
      const deletePromises = querySnapshot.docs.map(document => 
        deleteDoc(doc(db, collectionName, document.id))
      );
      
      // Attendi che tutte le eliminazioni siano completate
      await Promise.all(deletePromises);
    }

    // Elimina il documento utente
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error("Errore durante l'eliminazione del documento utente:", error);
    }
  };

  // Funzione per riautenticare l'utente
  const reauthenticateUser = async () => {
    try {
      setLoading(true);
      
      // Assicurati che ci sia un utente corrente e una password
      if (!currentUser || !currentUser.email || !password) {
        setError('Credenziali mancanti. Inserisci la password.');
        return false;
      }
      
      // Crea le credenziali
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      
      // Riautentica l'utente
      await reauthenticateWithCredential(currentUser, credential);
      
      // Riautenticazione riuscita
      return true;
    } catch (error) {
      console.error('Errore durante la riautenticazione:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Password errata. Riprova.');
      } else {
        setError('Errore durante la riautenticazione. Riprova.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    // Prima chiediamo la riautenticazione
    setShowReauthModal(true);
  };
  
  const confirmDeletion = async () => {
    // Verifica che l'utente sia riautenticato
    const isReauthenticated = await reauthenticateUser();
    
    if (!isReauthenticated) {
      return;
    }
    
    // Nascondi il modal di riautenticazione
    setShowReauthModal(false);
    
    // Procedi con l'eliminazione dell'account
    setLoading(true);
    setError('');

    try {
      console.log("Inizio eliminazione dati utente...");
      // Elimina tutti i dati dell'utente
      await deleteUserData(currentUser.uid);
      
      console.log("Eliminazione account Firebase...");
      // Elimina l'account Firebase
      await deleteUser(currentUser);
      
      console.log("Logout...");
      // Logout
      await logout();
      
      // Reindirizza alla pagina di login
      navigate('/signup');
    } catch (err) {
      console.error('Errore durante l\'eliminazione dell\'account:', err);
      setError('Impossibile eliminare l\'account. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full text-white text-2xl mb-4">
            🗑️
          </div>
          <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
          <p className="text-gray-600 mt-2">This action cannot be undone</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Primo step: Conferma eliminazione */}
        {confirmStep === 1 && !showReauthModal && (
          <div>
            <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Warning: </strong>
              <span className="block sm:inline">
                Deleting your account will permanently remove all your data, including dogs, activities, and health records.
              </span>
            </div>
            
            <button
              onClick={() => setConfirmStep(2)}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              I Understand, Continue to Delete
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="w-full mt-4 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Secondo step: Conferma finale */}
        {confirmStep === 2 && !showReauthModal && (
          <div>
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Final Warning: </strong>
              <span className="block sm:inline">
                Are you absolutely sure you want to delete your account? This CANNOT be undone.
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfirmStep(1)}
                className="flex-1 py-3 border border-gray-300 rounded-lg"
              >
                Go Back
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        )}
        
        {/* Modal di riautenticazione */}
        {showReauthModal && (
          <div>
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Verification Required: </strong>
              <span className="block sm:inline">
                For security reasons, please enter your password to continue.
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowReauthModal(false);
                  setPassword('');
                  setError('');
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                disabled={loading || !password}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteAccount;