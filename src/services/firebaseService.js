// src/services/firebaseService.js
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

// Vaccines
export const fetchVaccines = async (dogId) => {
    const q = query(collection(db, "vaccines"), where("dogId", "==", dogId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  export const addVaccine = async (vaccineData) => {
    return await addDoc(collection(db, "vaccines"), {
      ...vaccineData,
      createdAt: serverTimestamp()
    });
  };
  
  export const updateVaccine = async (vaccineId, vaccineData) => {
    const vaccineRef = doc(db, "vaccines", vaccineId);
    await updateDoc(vaccineRef, {
      ...vaccineData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const deleteVaccine = async (vaccineId) => {
    await deleteDoc(doc(db, "vaccines", vaccineId));
  };