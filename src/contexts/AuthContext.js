// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUserDocument } from '../services/firebaseService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function register(email, password, name) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Aggiorna il profilo di Firebase Auth con il nome
        return updateProfile(userCredential.user, {
          displayName: name
        }).then(() => {
          // Ora crea anche un documento utente in Firestore
          return createUserDocument(userCredential.user, { name });
        }).then(() => {
          return userCredential.user;
        });
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth).then(() => {
      // Assicurati che currentUser venga impostato a null
      setCurrentUser(null);
    });
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      </AuthContext.Provider>
    );
  }
