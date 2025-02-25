// src/contexts/LoadingContext.js
import React, { createContext, useContext, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LoadingContext = createContext();

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const startLoading = (message = '') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };
  
  const value = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  };
  
  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="mb-4">
              <LoadingSpinner size="lg" />
            </div>
            {loadingMessage && <p className="text-gray-700">{loadingMessage}</p>}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}