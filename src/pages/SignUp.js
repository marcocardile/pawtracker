// src/pages/SignUp.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

function SignUp() {
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Dopo registrazione con Google, vai all'onboarding
      navigate('/onboarding');
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
    }
  };

  const handleAppleSignUp = () => {
    // Implementazione Apple Sign-In da aggiungere
    console.log('Apple Sign-Up not implemented yet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white text-2xl mb-4">
            🐾
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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.85 0 3.48.63 4.81 1.68l-2.59 2.59C13.03 7.43 12.56 7.29 12 7.29c-2.39 0-4.33 1.95-4.33 4.33 0 2.39 1.95 4.33 4.33 4.33 1.86 0 3.4-1.16 3.97-2.73H12v-3.58h6.29c.14.77.22 1.56.22 2.42 0 3.96-2.79 6.77-6.51 6.77-3.95 0-7.18-3.18-7.18-7.18 0-3.95 3.23-7.18 7.18-7.18z"/>
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