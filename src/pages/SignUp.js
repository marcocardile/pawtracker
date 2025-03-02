// src/pages/SignUp.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { createUserDocument } from '../services/firebaseService';

function SignUp() {
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Verifica se è un nuovo utente confrontando creationTime e lastSignInTime
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      // Crea il documento utente se non esiste
      await createUserDocument(result.user, {
        name: result.user.displayName || '',
        email: result.user.email
      });

      // Imposta il flag per l'onboarding per i nuovi utenti
      if (isNewUser) {
        localStorage.setItem('requiresOnboarding', 'true');
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      
      // Gestione degli errori
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('An account already exists with a different credential. Please try another method.');
      } else {
        alert('Sign up failed. Please try again.');
      }
    }
  };

  const handleAppleSignUp = () => {
    // Implementazione Apple Sign-In da aggiungere
    console.log('Apple Sign-Up not implemented yet');
    alert('Apple Sign-Up is not available yet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full overflow-hidden mb-4">
            <img 
              src="/logo192.png" 
              alt="PawTracker Logo" 
              className="w-16 h-16 object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold">PawTracker</h1>
          <p className="text-gray-600">Your dog's life, organized</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="w-5 h-5 mr-2"
            >
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.75c-.99.67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.38-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.07z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.29-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
          
          <button 
            onClick={handleAppleSignUp}
            className="w-full flex items-center justify-center bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="w-5 h-5 mr-2 fill-white"
            >
              <path d="M17.05 20.28c-.98.95-2.05.94-3.08.45-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.23 14.73 3.14 7.63 8.31 7.45c1.2.08 2.07.56 2.83.65 1.11-.3 2.17-.73 3.45-.51 1.46.12 2.55.72 3.25 1.78-2.99 1.89-2.13 5.55.63 6.82-.5 1.61-1.13 3.18-2.42 4.09zM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.37 2.5-1.88 4.32-3.74 4.25z"/>
            </svg>
            Sign up with Apple
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-gray-500">or</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90"
          >
            Sign up with Email
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-medium">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;