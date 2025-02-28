// src/components/profile/NotificationSettings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function NotificationSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    healthReminders: true,
    activityReminders: true,
    emailNotifications: false,
    pushNotifications: true,
    vaccinationAlerts: true,
    medicationAlerts: true,
    vetAppointmentAlerts: true,
    dailyActivitySummary: false
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const settingsRef = doc(db, 'userSettings', currentUser.uid);
        const settingsSnapshot = await getDoc(settingsRef);
        
        if (settingsSnapshot.exists()) {
          const settingsData = settingsSnapshot.data();
          // Only update settings that exist in the document
          setSettings(prev => ({
            ...prev,
            ...settingsData.notifications
          }));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [currentUser]);

  // Handle toggle changes
  const handleToggleChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Reset any previous messages
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Save settings
  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const settingsRef = doc(db, 'userSettings', currentUser.uid);
      const settingsSnapshot = await getDoc(settingsRef);
      
      if (settingsSnapshot.exists()) {
        // Update existing document
        await updateDoc(settingsRef, {
          notifications: settings,
          updatedAt: new Date()
        });
      } else {
        // Create new document
        await setDoc(settingsRef, {
          userId: currentUser.uid,
          notifications: settings,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Notification Settings</h2>
      
      {saveSuccess && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}
      
      {saveError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {saveError}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="border-b pb-2 mb-2">
          <h3 className="font-medium text-gray-700 mb-2">Health Reminders</h3>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Vaccination Alerts</p>
              <p className="text-sm text-gray-500">Get notified before vaccines expire</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.vaccinationAlerts}
                onChange={() => handleToggleChange('vaccinationAlerts')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Medication Alerts</p>
              <p className="text-sm text-gray-500">Reminders for medication schedules</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.medicationAlerts}
                onChange={() => handleToggleChange('medicationAlerts')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Vet Appointment Alerts</p>
              <p className="text-sm text-gray-500">Reminders for upcoming vet visits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.vetAppointmentAlerts}
                onChange={() => handleToggleChange('vetAppointmentAlerts')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        <div className="border-b pb-2 mb-2">
          <h3 className="font-medium text-gray-700 mb-2">Activity Reminders</h3>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Activity Reminders</p>
              <p className="text-sm text-gray-500">Get reminders for upcoming activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.activityReminders}
                onChange={() => handleToggleChange('activityReminders')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Daily Activity Summary</p>
              <p className="text-sm text-gray-500">Receive a daily summary of completed activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.dailyActivitySummary}
                onChange={() => handleToggleChange('dailyActivitySummary')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        <div className="pb-2">
          <h3 className="font-medium text-gray-700 mb-2">Notification Methods</h3>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive push notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.pushNotifications}
                onChange={() => handleToggleChange('pushNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive important notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.emailNotifications}
                onChange={() => handleToggleChange('emailNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90"
        >
          Save Settings
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Note: Push notifications require permission from your browser</p>
      </div>
    </div>
  );
}

export default NotificationSettings;