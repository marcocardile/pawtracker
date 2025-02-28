// src/services/offlineService.js
import { openDB } from 'idb';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  writeBatch,
  increment,
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Define database name and version
const DB_NAME = 'pawtracker_offline';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('dogs')) {
        const dogStore = db.createObjectStore('dogs', { keyPath: 'id' });
        dogStore.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('activities')) {
        const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
        activityStore.createIndex('userId', 'userId', { unique: false });
        activityStore.createIndex('dogId', 'dogId', { unique: false });
        activityStore.createIndex('date', 'date', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('healthRecords')) {
        const healthStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
        healthStore.createIndex('userId', 'userId', { unique: false });
        healthStore.createIndex('dogId', 'dogId', { unique: false });
        healthStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('vaccinations')) {
        const vaccinationStore = db.createObjectStore('vaccinations', { keyPath: 'id' });
        vaccinationStore.createIndex('userId', 'userId', { unique: false });
        vaccinationStore.createIndex('dogId', 'dogId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

// Check if device is online
export const isOnline = () => {
  return navigator.onLine;
};

// Add a new sync task to the queue
export const addToSyncQueue = async (operation) => {
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  await tx.store.add({
    ...operation,
    timestamp: Date.now()
  });
  await tx.done;
};

// Process sync queue when back online
export const processSyncQueue = async (userId) => {
  if (!isOnline()) return false;
  
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  
  // Get all pending operations
  const operations = await tx.store.getAll();
  
  if (operations.length === 0) return true;
  
  try {
    // Group operations by collection for batch processing
    const batches = {};
    
    for (const op of operations) {
      if (!batches[op.collection]) {
        batches[op.collection] = writeBatch(db);
      }
      
      const batch = batches[op.collection];
      const docRef = doc(db, op.collection, op.docId);
      
      switch (op.type) {
        case 'add':
        case 'update':
          batch.set(docRef, {
            ...op.data,
            lastSyncedAt: serverTimestamp()
          }, { merge: true });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        case 'increment':
          batch.update(docRef, {
            [op.field]: increment(op.value),
            lastSyncedAt: serverTimestamp()
          });
          break;
        case 'arrayUnion':
          batch.update(docRef, {
            [op.field]: arrayUnion(...op.values),
            lastSyncedAt: serverTimestamp()
          });
          break;
        default:
          console.warn(`Unknown operation type: ${op.type}`);
      }
    }
    
    // Commit all batches
    await Promise.all(
      Object.values(batches).map(batch => batch.commit())
    );
    
    // Clear the sync queue
    await tx.store.clear();
    await tx.done;
    
    console.log(`Synced ${operations.length} operations`);
    return true;
  } catch (error) {
    console.error('Error processing sync queue:', error);
    return false;
  }
};

// Save data locally and queue for sync
export const saveDataLocally = async (collection, data, syncData = true) => {
  const db = await initDB();
  const tx = db.transaction(collection, 'readwrite');
  
  await tx.store.put(data);
  await tx.done;
  
  if (syncData && !isOnline()) {
    // Add to sync queue for later
    await addToSyncQueue({
      type: data.id ? 'update' : 'add',
      collection,
      docId: data.id,
      data
    });
  }
  
  return data;
};

// Delete data locally and queue for sync
export const deleteDataLocally = async (collection, id, syncData = true) => {
  const db = await initDB();
  const tx = db.transaction(collection, 'readwrite');
  
  await tx.store.delete(id);
  await tx.done;
  
  if (syncData && !isOnline()) {
    // Add to sync queue for later
    await addToSyncQueue({
      type: 'delete',
      collection,
      docId: id
    });
  }
  
  return id;
};

// Get data from local database
export const getLocalData = async (collection, id) => {
  const db = await initDB();
  return db.get(collection, id);
};

// Query local data
export const queryLocalData = async (collection, indexName, indexValue) => {
  const db = await initDB();
  const tx = db.transaction(collection, 'readonly');
  const index = tx.store.index(indexName);
  const results = await index.getAll(indexValue);
  await tx.done;
  return results;
};

// Sync data from Firestore to local database
export const syncFromFirestore = async (userId) => {
  if (!isOnline() || !userId) return false;
  
  try {
    const db = await initDB();
    
    // Sync dogs
    const dogsQuery = query(collection(db, 'dogs'), where('userId', '==', userId));
    const dogsSnapshot = await getDocs(dogsQuery);
    const dogs = dogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const dog of dogs) {
      await saveDataLocally('dogs', dog, false);
    }
    
    // Sync activities
    const activitiesQuery = query(collection(db, 'activities'), where('userId', '==', userId));
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const activities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const activity of activities) {
      await saveDataLocally('activities', activity, false);
    }
    
    // Sync health records
    const healthRecordsQuery = query(collection(db, 'healthRecords'), where('userId', '==', userId));
    const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
    const healthRecords = healthRecordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const record of healthRecords) {
      await saveDataLocally('healthRecords', record, false);
    }
    
    // Sync vaccinations
    const vaccinationsQuery = query(collection(db, 'vaccinations'), where('userId', '==', userId));
    const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
    const vaccinations = vaccinationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const vaccination of vaccinations) {
      await saveDataLocally('vaccinations', vaccination, false);
    }
    
    console.log('Synced data from Firestore to local database');
    return true;
  } catch (error) {
    console.error('Error syncing from Firestore:', error);
    return false;
  }
};

// Initialize sync listeners
export const initializeSyncListeners = () => {
  // Process sync queue when online
  window.addEventListener('online', async () => {
    console.log('Device is back online. Syncing data...');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.uid) {
      await processSyncQueue(currentUser.uid);
      await syncFromFirestore(currentUser.uid);
    }
  });
  
  // Save offline status when offline
  window.addEventListener('offline', () => {
    console.log('Device is offline. Changes will be synced when online.');
  });
};

// Update firebaseService methods to use offline capabilities
export const enhanceServiceWithOfflineSupport = (firebaseService) => {
  // Enhanced versions of firebaseService methods
  return {
    // Fetch dogs with offline support
    fetchDogs: async (userId) => {
      try {
        if (isOnline()) {
          // If online, get from Firebase and sync to local
          const dogs = await firebaseService.fetchDogs(userId);
          for (const dog of dogs) {
            await saveDataLocally('dogs', dog, false);
          }
          return dogs;
        } else {
          // If offline, get from local database
          console.log('Fetching dogs from local database...');
          return await queryLocalData('dogs', 'userId', userId);
        }
      } catch (error) {
        console.error('Error fetching dogs:', error);
        // Fallback to local data if available
        return await queryLocalData('dogs', 'userId', userId);
      }
    },

    // Add dog with offline support
    addDog: async (dogData) => {
      try {
        if (isOnline()) {
          // If online, add to Firebase and sync to local
          const docRef = await firebaseService.addDog(dogData);
          const newDog = { ...dogData, id: docRef.id };
          await saveDataLocally('dogs', newDog, false);
          return docRef;
        } else {
          // If offline, save locally with temporary ID and queue for sync
          const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newDog = { ...dogData, id: tempId };
          await saveDataLocally('dogs', newDog);
          return { id: tempId };
        }
      } catch (error) {
        console.error('Error adding dog:', error);
        // Save locally as fallback
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newDog = { ...dogData, id: tempId };
        await saveDataLocally('dogs', newDog);
        return { id: tempId };
      }
    },

    // Update dog with offline support
    updateDog: async (dogId, dogData) => {
      try {
        if (isOnline()) {
          // If online, update Firebase and sync to local
          await firebaseService.updateDog(dogId, dogData);
          const updatedDog = { ...dogData, id: dogId };
          await saveDataLocally('dogs', updatedDog, false);
        } else {
          // If offline, update locally and queue for sync
          const existingDog = await getLocalData('dogs', dogId);
          if (!existingDog) throw new Error(`Dog with ID ${dogId} not found locally`);
          
          const updatedDog = { ...existingDog, ...dogData, id: dogId };
          await saveDataLocally('dogs', updatedDog);
        }
      } catch (error) {
        console.error('Error updating dog:', error);
        // Update locally as fallback if dog exists
        try {
          const existingDog = await getLocalData('dogs', dogId);
          if (existingDog) {
            const updatedDog = { ...existingDog, ...dogData, id: dogId };
            await saveDataLocally('dogs', updatedDog);
          }
        } catch (localError) {
          console.error('Error updating dog locally:', localError);
        }
      }
    },

    // Delete dog with offline support
    deleteDog: async (dogId) => {
      try {
        if (isOnline()) {
          // If online, delete from Firebase and local
          await firebaseService.deleteDog(dogId);
          await deleteDataLocally('dogs', dogId, false);
        } else {
          // If offline, delete locally and queue for sync
          await deleteDataLocally('dogs', dogId);
        }
      } catch (error) {
        console.error('Error deleting dog:', error);
        // Delete locally as fallback
        await deleteDataLocally('dogs', dogId);
      }
    },

    // Fetch activities with offline support
    fetchActivities: async (userId) => {
      try {
        if (isOnline()) {
          // If online, get from Firebase and sync to local
          const activities = await firebaseService.fetchActivities(userId);
          for (const activity of activities) {
            await saveDataLocally('activities', activity, false);
          }
          return activities;
        } else {
          // If offline, get from local database
          console.log('Fetching activities from local database...');
          return await queryLocalData('activities', 'userId', userId);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to local data if available
        return await queryLocalData('activities', 'userId', userId);
      }
    },

    // Add activity with offline support
    addActivity: async (activityData) => {
      try {
        if (isOnline()) {
          // If online, add to Firebase and sync to local
          const docRef = await firebaseService.addActivity(activityData);
          const newActivity = { ...activityData, id: docRef.id };
          await saveDataLocally('activities', newActivity, false);
          return docRef;
        } else {
          // If offline, save locally with temporary ID and queue for sync
          const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newActivity = { ...activityData, id: tempId };
          await saveDataLocally('activities', newActivity);
          return { id: tempId };
        }
      } catch (error) {
        console.error('Error adding activity:', error);
        // Save locally as fallback
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newActivity = { ...activityData, id: tempId };
        await saveDataLocally('activities', newActivity);
        return { id: tempId };
      }
    },

    // Update activity with offline support
    updateActivity: async (activityId, activityData) => {
      try {
        if (isOnline()) {
          // If online, update Firebase and sync to local
          await firebaseService.updateActivity(activityId, activityData);
          // Get the existing activity to merge with updates
          const existingActivity = await getLocalData('activities', activityId) || 
                                  (await getDoc(doc(db, 'activities', activityId))).data();
          
          const updatedActivity = { ...existingActivity, ...activityData, id: activityId };
          await saveDataLocally('activities', updatedActivity, false);
        } else {
          // If offline, update locally and queue for sync
          const existingActivity = await getLocalData('activities', activityId);
          if (!existingActivity) throw new Error(`Activity with ID ${activityId} not found locally`);
          
          const updatedActivity = { ...existingActivity, ...activityData, id: activityId };
          await saveDataLocally('activities', updatedActivity);
        }
      } catch (error) {
        console.error('Error updating activity:', error);
        // Update locally as fallback if activity exists
        try {
          const existingActivity = await getLocalData('activities', activityId);
          if (existingActivity) {
            const updatedActivity = { ...existingActivity, ...activityData, id: activityId };
            await saveDataLocally('activities', updatedActivity);
          }
        } catch (localError) {
          console.error('Error updating activity locally:', localError);
        }
      }
    },

    // Delete activity with offline support
    deleteActivity: async (activityId) => {
      try {
        if (isOnline()) {
          // If online, delete from Firebase and local
          await firebaseService.deleteActivity(activityId);
          await deleteDataLocally('activities', activityId, false);
        } else {
          // If offline, delete locally and queue for sync
          await deleteDataLocally('activities', activityId);
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        // Delete locally as fallback
        await deleteDataLocally('activities', activityId);
      }
    },

    // Similar patterns for other methods like fetchHealthRecords, addHealthRecord, etc.
    // ...

    // Sync all data for a user
    syncAllData: async (userId) => {
      if (!userId) return false;
      
      try {
        // Process any pending sync operations
        await processSyncQueue(userId);
        
        // Sync down from Firestore
        await syncFromFirestore(userId);
        
        return true;
      } catch (error) {
        console.error('Error syncing all data:', error);
        return false;
      }
    }
  };
};