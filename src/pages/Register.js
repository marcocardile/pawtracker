// src/pages/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Verifica la lunghezza della password quando cambia
  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Verifica se le password corrispondono
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [password, confirmPassword]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Controllo duplicato qui per sicurezza
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      // Combinare first name e last name per il displayName
      const fullName = `${firstName} ${lastName}`;
      await register(email, password, fullName, firstName, lastName);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create an account');
      }
      console.error(error);
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">PawTracker</h1>
          <p className="text-gray-600">Your dog's life, organized</p>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Name fields side by side */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary`}
              required
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border ${passwordMatchError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary`}
              required
            />
            {passwordMatchError && <p className="text-red-500 text-xs mt-1">{passwordMatchError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={loading || passwordError || passwordMatchError}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-medium">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;