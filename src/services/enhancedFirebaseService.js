// Path: src/services/enhancedFirebaseService.js

import * as firebaseService from './firebaseService';
import { enhanceServiceWithOfflineSupport } from './offlineService';
import { enhanceServiceWithCache } from './cacheService';

// Online status tracking
let _onlineStatus = navigator.onLine;
let _onlineStatusChangeCallbacks = [];

// Function to notify online status change
const notifyOnlineStatusChange = (isOnline) => {
  _onlineStatusChangeCallbacks.forEach(callback => callback(isOnline));
};

// Subscribe to online status changes
export const subscribeToOnlineStatus = (callback) => {
  _onlineStatusChangeCallbacks.push(callback);
  return () => {
    _onlineStatusChangeCallbacks = _onlineStatusChangeCallbacks.filter(cb => cb !== callback);
  };
};

// Set up online/offline listeners
window.addEventListener('online', () => {
  _onlineStatus = true;
  notifyOnlineStatusChange(true);
});

window.addEventListener('offline', () => {
  _onlineStatus = false;
  notifyOnlineStatusChange(false);
});

// Function to check online status
export const isOnline = () => _onlineStatus;

// Enhanced service with both offline support and caching
const enhancedService = enhanceServiceWithCache(
  enhanceServiceWithOfflineSupport(firebaseService)
);

// Initialize offline functionality
const initializeOfflineSupport = () => {
  // Set up online/offline event listeners for sync
  window.addEventListener('online', async () => {
    console.log('Back online! Syncing data...');
    if (enhancedService.syncAllData) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.uid) {
        await enhancedService.syncAllData(user.uid);
      }
    }
  });
  
  // Check for and process pending operations on startup
  const checkPendingOperations = async () => {
    if (isOnline() && enhancedService.syncAllData) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.uid) {
        await enhancedService.syncAllData(user.uid);
      }
    }
  };
  
  // Run initial check
  checkPendingOperations();
};

// Handler for errors with retry
export const handleServiceError = async (operation, maxRetries = 3, delay = 1000) => {
  let retries = 0;
  let result = null;
  let error = null;
  
  const executeWithRetry = async () => {
    try {
      result = await operation();
      return true;
    } catch (err) {
      error = err;
      console.warn(`Operation failed (attempt ${retries + 1}/${maxRetries}):`, err);
      
      if (retries < maxRetries - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, delay * retries));
        return await executeWithRetry();
      }
      
      return false;
    }
  };
  
  const success = await executeWithRetry();
  
  if (success) {
    return result;
  } else {
    throw error;
  }
};

// Initialize offline support
initializeOfflineSupport();

// Export the enhanced service along with utility functions
export default {
  ...enhancedService,
  handleServiceError,
  subscribeToOnlineStatus,
  isOnline
};