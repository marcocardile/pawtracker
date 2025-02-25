// src/components/ui/LoadingSpinner.js
import React from 'react';

function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin`}>
      </div>
    </div>
  );
}

export default LoadingSpinner;