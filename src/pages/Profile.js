// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDocument } from '../services/firebaseService';
import NotificationSettings from '../components/profile/NotificationSettings';

function Profile() {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const userData = await getUserDocument(currentUser.uid);
        setUserData(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {/* User Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl mr-4">
            {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userData?.displayName || 'User'}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'account' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={userData?.displayName || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={currentUser.email}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}
                  readOnly
                />
              </div>
            </div>
            
            <button
              className="mt-4 bg-primary text-white py-2 px-4 rounded-lg"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </button>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <NotificationSettings />
        )}
        
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Password</h3>
                <button
                  className="text-primary"
                  onClick={() => navigate('/reset-password')}
                >
                  Change Password
                </button>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Data Management</h3>
                <div className="space-y-2">
                  <button
                    className="block text-primary"
                    onClick={() => navigate('/data-export')}
                  >
                    Export Data
                  </button>
                  <button
                    className="block text-red-500"
                    onClick={() => navigate('/delete-account')}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <button
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;