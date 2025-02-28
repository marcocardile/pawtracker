// src/components/ui/ConnectionStatus.js
import React, { useState, useEffect } from 'react';
import { isOnline, subscribeToOnlineStatus } from '../../services/enhancedFirebaseService';

function ConnectionStatus() {
  const [online, setOnline] = useState(isOnline());
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Subscribe to online status changes
  useEffect(() => {
    const unsubscribe = subscribeToOnlineStatus((isOnline) => {
      setOnline(isOnline);
      if (!isOnline) {
        setShowOfflineMessage(true);
      }
    });

    // Check for pending sync operations
    const checkPendingSync = async () => {
      try {
        // This would need to be implemented to check the sync queue
        // const count = await getPendingSyncCount();
        const count = 0; // Placeholder
        setPendingSyncCount(count);
      } catch (error) {
        console.error('Error checking pending sync count:', error);
      }
    };

    // Run initial checks
    setOnline(isOnline());
    checkPendingSync();

    // Set up periodic check for pending sync operations
    const intervalId = setInterval(checkPendingSync, 60000); // Every minute

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // Auto-hide the offline message after a while
  useEffect(() => {
    if (showOfflineMessage && !online) {
      const timerId = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [showOfflineMessage, online]);

  // Hide message when back online
  useEffect(() => {
    if (online && showOfflineMessage) {
      setShowOfflineMessage(false);
    }
  }, [online, showOfflineMessage]);

  const handleDismiss = () => {
    setShowOfflineMessage(false);
  };

  if (online && !pendingSyncCount) {
    return null; // Don't show anything when online and no pending syncs
  }

  return (
    <>
      {/* Fixed position offline indicator */}
      <div className={`fixed bottom-16 right-4 z-40 ${online ? 'bg-green-500' : 'bg-red-500'} text-white p-1 rounded-full w-3 h-3`}></div>

      {/* Offline message banner */}
      {showOfflineMessage && !online && (
        <div className="fixed bottom-20 inset-x-0 mx-auto max-w-md z-30 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">⚠️</span>
            <p className="text-sm text-yellow-700">
              You're offline. Changes will be saved and synced when you reconnect.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-500 hover:text-yellow-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Syncing message */}
      {online && pendingSyncCount > 0 && (
        <div className="fixed bottom-20 inset-x-0 mx-auto max-w-md z-30 bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-t-blue-500 border-r-blue-300 border-b-blue-100 border-l-blue-300 rounded-full animate-spin mr-2"></div>
            <p className="text-sm text-blue-700">
              Syncing changes ({pendingSyncCount} remaining)...
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectionStatus;