// src/components/analytics/DogActivityAnalytics.js
import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { fetchActivities } from '../../services/firebaseService';

function DogActivityAnalytics({ dogId, timeRange = 'week' }) {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    completionRate: 0,
    activityTypes: {},
    weekdayDistribution: {},
    timeDistribution: {
      morning: 0,
      afternoon: 0,
      evening: 0
    }
  });

  useEffect(() => {
    const loadActivities = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all activities
        const allActivities = await fetchActivities(currentUser.uid);
        
        // Filter by dogId if provided
        const filteredActivities = dogId 
          ? allActivities.filter(a => a.dogId === dogId)
          : allActivities;
        
        // Apply time range filter
        const now = new Date();
        let filteredByDate = filteredActivities;
        
        if (timeRange === 'week') {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
          filteredByDate = filteredActivities.filter(a => 
            parseISO(a.date) >= weekStart && parseISO(a.date) <= now
          );
        } else if (timeRange === 'month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          filteredByDate = filteredActivities.filter(a => 
            parseISO(a.date) >= monthStart && parseISO(a.date) <= now
          );
        }
        
        setActivities(filteredByDate);
        
        // Calculate statistics
        calculateStatistics(filteredByDate);
      } catch (err) {
        console.error("Error loading activities for analytics:", err);
        setError("Failed to load activities. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [currentUser, dogId, timeRange]);

  // Calculate all statistics
  const calculateStatistics = (filteredActivities) => {
    // Total activities and completion rate
    const totalActivities = filteredActivities.length;
    const completedActivities = filteredActivities.filter(a => a.completed).length;
    const completionRate = totalActivities > 0 
      ? (completedActivities / totalActivities) * 100 
      : 0;
    
    // Activity types distribution
    const activityTypes = filteredActivities.reduce((acc, activity) => {
      const type = activity.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});
    
    // Weekday distribution
    const weekdayDistribution = filteredActivities.reduce((acc, activity) => {
      const date = parseISO(activity.date);
      const weekday = format(date, 'EEEE');
      if (!acc[weekday]) {
        acc[weekday] = 0;
      }
      acc[weekday]++;
      return acc;
    }, {});
    
    // Time of day distribution
    const timeDistribution = filteredActivities.reduce((acc, activity) => {
      const time = activity.time;
      const hour = parseInt(time.split(':')[0]);
      
      if (hour >= 5 && hour < 12) {
        acc.morning++;
      } else if (hour >= 12 && hour < 18) {
        acc.afternoon++;
      } else {
        acc.evening++;
      }
      
      return acc;
    }, { morning: 0, afternoon: 0, evening: 0 });
    
    setStats({
      totalActivities,
      completionRate,
      activityTypes,
      weekdayDistribution,
      timeDistribution
    });
  };

  // Activity type icons
  const activityIcons = {
    walk: '🚶',
    food: '🍖',
    vet: '💉',
    play: '🎾',
    water: '💧',
    medicine: '💊',
    groom: '✂️',
    training: '🏋️'
  };

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <p>No activities found for the selected period.</p>
        <p className="mt-2">Start tracking activities to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Activities</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalActivities}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="text-3xl font-bold text-primary">{stats.completionRate.toFixed(0)}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Most Common</h3>
          <p className="text-3xl font-bold text-primary">
            {Object.entries(stats.activityTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Activity Types Breakdown */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Activity Types</h3>
        <div className="space-y-3">
          {Object.entries(stats.activityTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{activityIcons[type] || '📋'}</span>
                <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
              <div className="text-lg font-semibold">{count}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Weekday Distribution */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Activity by Day of Week</h3>
        <div className="space-y-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const count = stats.weekdayDistribution[day] || 0;
            const maxCount = Math.max(...Object.values(stats.weekdayDistribution));
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={day} className="flex items-center">
                <div className="w-24 text-sm">{day.substring(0, 3)}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-6 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-right ml-2">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Time of Day Distribution */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Activity by Time of Day</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">🌅</div>
            <div className="font-medium">Morning</div>
            <div className="text-2xl font-bold text-blue-500">{stats.timeDistribution.morning}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">☀️</div>
            <div className="font-medium">Afternoon</div>
            <div className="text-2xl font-bold text-yellow-500">{stats.timeDistribution.afternoon}</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl mb-2">🌙</div>
            <div className="font-medium">Evening</div>
            <div className="text-2xl font-bold text-indigo-500">{stats.timeDistribution.evening}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DogActivityAnalytics;