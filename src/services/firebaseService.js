// src/services/firebaseService.js
import { setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Users
export const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    
    // Se l'utente non esiste già in Firestore, crealo
    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();
      
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email,
          displayName,
          photoURL,
          createdAt,
          ...additionalData
        });
      } catch (error) {
        console.error("Error creating user document", error);
      }
    }
    
    return userRef;
  };
  
  export const updateUserDocument = async (userId, userData) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const getUserDocument = async (userId) => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  };

// Dogs
export const fetchDogs = async (userId) => {
  const q = query(collection(db, "dogs"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addDog = async (dogData) => {
  return await addDoc(collection(db, "dogs"), {
    ...dogData,
    createdAt: serverTimestamp()
  });
};

export const updateDog = async (dogId, dogData) => {
  const dogRef = doc(db, "dogs", dogId);
  await updateDoc(dogRef, {
    ...dogData,
    updatedAt: serverTimestamp()
  });
};

export const deleteDog = async (dogId) => {
  await deleteDoc(doc(db, "dogs", dogId));
};

// Activities
export const fetchActivities = async (userId) => {
  const q = query(collection(db, "activities"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addActivity = async (activityData) => {
  return await addDoc(collection(db, "activities"), {
    ...activityData,
    createdAt: serverTimestamp()
  });
};

export const updateActivity = async (activityId, activityData) => {
  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, {
    ...activityData,
    updatedAt: serverTimestamp()
  });
};

export const deleteActivity = async (activityId) => {
  await deleteDoc(doc(db, "activities", activityId));
};

// Vaccinations
export const fetchVaccines = async (dogId, userId) => {
  const q = query(
    collection(db, "vaccinations"), 
    where("dogId", "==", dogId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addVaccination = async (vaccinationData) => {
  return await addDoc(collection(db, "vaccinations"), {
    ...vaccinationData,
    createdAt: serverTimestamp()
  });
};

export const updateVaccination = async (vaccinationId, vaccinationData) => {
  const vaccinationRef = doc(db, "vaccinations", vaccinationId);
  await updateDoc(vaccinationRef, {
    ...vaccinationData,
    updatedAt: serverTimestamp()
  });
};

export const deleteVaccination = async (vaccinationId) => {
  await deleteDoc(doc(db, "vaccinations", vaccinationId));
};