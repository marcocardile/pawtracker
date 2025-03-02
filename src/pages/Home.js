// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { fetchDogs, fetchActivities } from '../services/firebaseService';

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dog, setDog] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's dogs and activities from Firebase
  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get all dogs owned by the user
        const dogsData = await fetchDogs(currentUser.uid);
        
        // Set the first dog as active if available
        if (dogsData.length > 0) {
          setDog(dogsData[0]);
        }
        
        // Get all activities
        const activitiesData = await fetchActivities(currentUser.uid);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [currentUser]);

  // Today's activities
  const todayActivities = activities.filter(activity =>
    isToday(parseISO(activity.date))
  );

  // Upcoming activities (future or today's incomplete)
  const upcomingActivities = activities
    .filter(activity =>
      !isPast(parseISO(`${activity.date}T${activity.time}`)) ||
      (isToday(parseISO(activity.date)) && !activity.completed)
    )
    .sort((a, b) =>
      new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    )
    .slice(0, 3); // Show only the first 3

  // Recently completed activities
  const recentActivities = activities
    .filter(activity => activity.completed)
    .sort((a, b) =>
      new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
    )
    .slice(0, 3); // Show only the latest 3

  // Calculate statistics
  const stats = {
    todayTotal: todayActivities.length,
    todayCompleted: todayActivities.filter(a => a.completed).length,
    upcomingTotal: upcomingActivities.length,
    totalCompleted: activities.filter(a => a.completed).length
  };

  // Colors for activity types
  const activityColors = {
    walk: 'bg-blue-500',
    food: 'bg-orange-500',
    vet: 'bg-red-500',
    play: 'bg-green-500',
    medicine: 'bg-purple-500',
    groom: 'bg-yellow-500',
    training: 'bg-pink-500'
  };

  // Icons for activity types
  const activityIcons = {
    walk: '🚶',
    food: '🍖',
    vet: '💉',
    play: '🎾',
    medicine: '💊',
    groom: '✂️',
    training: '🏋️'
  };

  // Calculate dog's age
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    
    const birth = new Date(birthdate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    
    if (diffYears === 0) {
      const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
    }
    
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with your pup today</p>
      </div>
      
      {/* Dog profile preview */}
      {dog ? (
        <div
          className="bg-white rounded-lg shadow p-4 mb-6 flex items-center"
          onClick={() => navigate(`/dogs/${dog.id}`)}
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl mr-4">
            🐕
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{dog.name}</h2>
            <p className="text-gray-600">
              {dog.breed}, {calculateAge(dog.birthdate)}
            </p>
          </div>
          <div className="text-gray-600">
            {dog.gender === 'male' ? '♂️' : '♀️'}
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg shadow p-6 mb-6 text-center"
          onClick={() => navigate('/dogs/new')}
        >
          <div className="text-4xl mb-2">🐕</div>
          <h2 className="text-lg font-medium mb-2">Add your dog</h2>
          <p className="text-gray-500 text-sm mb-4">
            Start by adding your furry friend's profile
          </p>
          <button className="bg-primary text-white py-2 px-4 rounded-lg text-sm">
            Add Dog
          </button>
        </div>
      )}
      
      {/* Activity stats widgets */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Today's Activities</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold mr-2">{stats.todayCompleted}/{stats.todayTotal}</span>
            <span className="text-gray-500 text-sm mb-1">completed</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{
                width: `${stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Coming Up</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold mr-2">{stats.upcomingTotal}</span>
            <span className="text-gray-500 text-sm mb-1">activities</span>
          </div>
          <div className="flex space-x-1 mt-2">
            {upcomingActivities.slice(0, 4).map((activity, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full flex-1 ${activityColors[activity.type] || 'bg-gray-300'}`}
              ></div>
            ))}
            {[...Array(Math.max(0, 4 - upcomingActivities.length))].map((_, idx) => (
              <div key={`empty-${idx}`} className="h-2.5 rounded-full flex-1 bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick action buttons */}
      <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-2 mb-6">
        <button
          className="flex flex-col items-center bg-white rounded-lg shadow p-3"
          onClick={() => navigate('/add')}
        >
          <div className="text-2xl mb-1">🚶</div>
          <span className="text-xs">Walk</span>
        </button>
        <button
          className="flex flex-col items-center bg-white rounded-lg shadow p-3"
          onClick={() => navigate('/add')}
        >
          <div className="text-2xl mb-1">🍖</div>
          <span className="text-xs">Food</span>
        </button>
        <button
          className="flex flex-col items-center bg-white rounded-lg shadow p-3"
          onClick={() => navigate('/add')}
        >
          <div className="text-2xl mb-1">🎾</div>
          <span className="text-xs">Play</span>
        </button>
        <button
          className="flex flex-col items-center bg-white rounded-lg shadow p-3"
          onClick={() => navigate('/calendar')}
        >
          <div className="text-2xl mb-1">📅</div>
          <span className="text-xs">Calendar</span>
        </button>
      </div>
      
      {/* Upcoming activities */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Upcoming</h2>
          <button
            className="text-primary text-sm"
            onClick={() => navigate('/calendar')}
          >
            View All
          </button>
        </div>
        
        {upcomingActivities.length > 0 ? (
          <div className="space-y-3">
            {upcomingActivities.map(activity => (
              <div key={activity.id} className="bg-white rounded-lg shadow p-3 flex items-center">
                <div className={`w-10 h-10 rounded-full ${activityColors[activity.type] || 'bg-gray-300'} flex items-center justify-center text-white mr-3`}>
                  {activityIcons[activity.type] || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">
                    {isToday(parseISO(activity.date))
                      ? `Today at ${activity.time}`
                      : format(parseISO(activity.date), 'MMM d')} at {activity.time}
                  </p>
                </div>
                <div className="w-6 h-6">
                  {activity.completed ? (
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>No upcoming activities</p>
            <button
              className="mt-2 text-primary"
              onClick={() => navigate('/add')}
            >
              Add Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Recent activities */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Recent Activities</h2>
          <button
            className="text-primary text-sm"
            onClick={() => navigate('/calendar')}
          >
            View All
          </button>
        </div>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="bg-white rounded-lg shadow p-3 flex items-center opacity-80">
                <div className={`w-10 h-10 rounded-full ${activityColors[activity.type] || 'bg-gray-300'} flex items-center justify-center text-white mr-3`}>
                  {activityIcons[activity.type] || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">
                    {isToday(parseISO(activity.date))
                      ? `Today at ${activity.time}`
                      : format(parseISO(activity.date), 'MMM d')} at {activity.time}
                  </p>
                </div>
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>No completed activities yet</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;