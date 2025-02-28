// src/components/analytics/CareRoutineTracking.js
import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, addWeeks, subWeeks } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { fetchActivities } from '../../services/firebaseService';

function CareRoutineTracking({ dogId }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routineData, setRoutineData] = useState({
    weeklyAdherence: 0,
    monthlyAdherence: 0,
    currentStreak: 0,
    longestStreak: 0,
    routineItems: [],
    dailyCompletion: []
  });
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    const loadRoutineData = async () => {
      if (!currentUser || !dogId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all activities for the dog
        const allActivities = await fetchActivities(currentUser.uid);
        const dogActivities = allActivities.filter(a => a.dogId === dogId);
        
        // Calculate routine statistics
        calculateRoutineStatistics(dogActivities);
      } catch (err) {
        console.error("Error loading routine data:", err);
        setError("Failed to load care routine data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadRoutineData();
  }, [currentUser, dogId, selectedWeek]);

  // Calculate routine statistics
  const calculateRoutineStatistics = (activities) => {
    // Define the time periods
    const today = new Date();
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    const currentWeekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Get routine activity types (activities that should be done regularly)
    const routineTypes = ['walk', 'food', 'water', 'medicine', 'play'];
    
    // Group activities by date and type
    const activitiesByDate = {};
    const activitiesByType = {};
    
    activities.forEach(activity => {
      const date = activity.date;
      const type = activity.type;
      
      // Initialize objects if needed
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      if (!activitiesByType[type]) {
        activitiesByType[type] = [];
      }
      
      // Add activity to collections
      activitiesByDate[date].push(activity);
      activitiesByType[type].push(activity);
    });
    
    // Calculate completion for current week
    const weeklyCompletions = {};
    let totalCompleted = 0;
    let totalPlanned = 0;
    
    routineTypes.forEach(type => {
      weeklyCompletions[type] = currentWeekDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayActivities = activitiesByDate[dateStr] || [];
        const typeActivities = dayActivities.filter(a => a.type === type);
        const completed = typeActivities.some(a => a.completed);
        
        // Only count if the day is not in the future
        if (day <= today) {
          if (typeActivities.length > 0) {
            totalPlanned++;
            if (completed) totalCompleted++;
          }
        }
        
        return {
          date: dateStr,
          completed,
          planned: typeActivities.length > 0
        };
      });
    });
    
    // Calculate weekly adherence
    const weeklyAdherence = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
    
    // Calculate monthly adherence (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let monthlyPlanned = 0;
    let monthlyCompleted = 0;
    
    activities.forEach(activity => {
      const activityDate = parseISO(activity.date);
      
      if (activityDate >= thirtyDaysAgo && activityDate <= today && routineTypes.includes(activity.type)) {
        monthlyPlanned++;
        if (activity.completed) monthlyCompleted++;
      }
    });
    
    const monthlyAdherence = monthlyPlanned > 0 ? (monthlyCompleted / monthlyPlanned) * 100 : 0;
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort all dates with activities
    const dates = Object.keys(activitiesByDate).sort();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = parseISO(dates[i]);
      const dateActivities = activitiesByDate[dates[i]];
      
      // Count the day in the streak if any routine activity is completed
      const hasCompletedRoutineActivity = dateActivities.some(
        a => routineTypes.includes(a.type) && a.completed
      );
      
      if (hasCompletedRoutineActivity) {
        tempStreak++;
        
        // Update current streak if we're looking at recent days
        if (i === dates.length - 1 || parseISO(dates[i + 1]).getDate() - date.getDate() === 1) {
          currentStreak = tempStreak;
        } else {
          currentStreak = 0;
        }
      } else {
        tempStreak = 0;
      }
      
      // Update longest streak
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Prepare routine items data
    const routineItems = routineTypes.map(type => {
      const typeActivities = activitiesByType[type] || [];
      const recentActivities = typeActivities.filter(a => {
        const activityDate = parseISO(a.date);
        return activityDate >= thirtyDaysAgo && activityDate <= today;
      });
      
      const completedCount = recentActivities.filter(a => a.completed).length;
      const adherenceRate = recentActivities.length > 0 ? (completedCount / recentActivities.length) * 100 : 0;
      
      return {
        type,
        total: recentActivities.length,
        completed: completedCount,
        adherenceRate
      };
    }).filter(item => item.total > 0);
    
    // Daily completion data for the selected week
    const dailyCompletion = currentWeekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayActivities = activitiesByDate[dateStr] || [];
      const routineActivities = dayActivities.filter(a => routineTypes.includes(a.type));
      const completedCount = routineActivities.filter(a => a.completed).length;
      
      return {
        date: dateStr,
        label: format(day, 'EEE'),
        fullDate: format(day, 'MMM d'),
        total: routineActivities.length,
        completed: completedCount,
        isFuture: day > today
      };
    });
    
    setRoutineData({
      weeklyAdherence,
      monthlyAdherence,
      currentStreak,
      longestStreak,
      routineItems,
      dailyCompletion
    });
  };

  // Get color based on completion percentage
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Navigation for week selection
  const previousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };
  
  const nextWeek = () => {
    const nextWeekDate = addWeeks(selectedWeek, 1);
    if (nextWeekDate <= new Date()) {
      setSelectedWeek(nextWeekDate);
    }
  };
  
  // Format week range for display
  const getWeekRange = () => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
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

  return (
    <div className="space-y-6">
      {/* Adherence Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Weekly Adherence</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              routineData.weeklyAdherence >= 80 ? 'bg-green-100 text-green-800' : 
              routineData.weeklyAdherence >= 50 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(routineData.weeklyAdherence)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full ${getCompletionColor(routineData.weeklyAdherence)}`} 
              style={{ width: `${routineData.weeklyAdherence}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Based on selected week's activities</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Monthly Adherence</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              routineData.monthlyAdherence >= 80 ? 'bg-green-100 text-green-800' : 
              routineData.monthlyAdherence >= 50 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(routineData.monthlyAdherence)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full ${getCompletionColor(routineData.monthlyAdherence)}`} 
              style={{ width: `${routineData.monthlyAdherence}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Based on last 30 days of care</p>
        </div>
      </div>
      
      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="p-3 bg-primary/10 rounded-full mr-3">
            <span className="text-xl text-primary">📅</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="text-2xl font-bold">
              {routineData.currentStreak} {routineData.currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="p-3 bg-primary/10 rounded-full mr-3">
            <span className="text-xl text-primary">🏆</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Longest Streak</p>
            <p className="text-2xl font-bold">
              {routineData.longestStreak} {routineData.longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Weekly View */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h3 className="text-lg font-medium">{getWeekRange()}</h3>
          <button 
            onClick={nextWeek}
            className={`p-2 hover:bg-gray-100 rounded-full ${
              addWeeks(selectedWeek, 1) > new Date() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={addWeeks(selectedWeek, 1) > new Date()}
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {routineData.dailyCompletion.map((day) => (
            <div 
              key={day.date} 
              className={`p-3 rounded-lg border ${
                day.isFuture ? 'bg-gray-50 border-gray-200' : 
                day.total === 0 ? 'bg-gray-50 border-gray-200' :
                day.completed === day.total ? 'bg-green-50 border-green-200' :
                day.completed > 0 ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}
            >
              <p className="text-center font-medium">{day.label}</p>
              <p className="text-center text-xs text-gray-500">{day.fullDate}</p>
              <div className="flex justify-center mt-2">
                {day.isFuture ? (
                  <span className="text-xs text-gray-400">Future</span>
                ) : day.total === 0 ? (
                  <span className="text-xs text-gray-400">No activities</span>
                ) : (
                  day.completed === day.total ? (
                    <span className="text-green-600 text-lg">✓</span>
                  ) : day.completed === 0 ? (
                    <span className="text-red-500 text-lg">✗</span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {day.completed}/{day.total}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Routine Items Breakdown */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Care Activities Breakdown</h3>
        <div className="space-y-4">
          {routineData.routineItems.map((item) => (
            <div key={item.type} className="border-b pb-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">
                    {item.type === 'walk' ? '🚶' :
                     item.type === 'food' ? '🍖' :
                     item.type === 'water' ? '💧' :
                     item.type === 'medicine' ? '💊' :
                     item.type === 'play' ? '🎾' : '📋'}
                  </span>
                  <p className="font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.adherenceRate >= 80 ? 'bg-green-100 text-green-800' : 
                  item.adherenceRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {Math.round(item.adherenceRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getCompletionColor(item.adherenceRate)}`} 
                  style={{ width: `${item.adherenceRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Completed {item.completed} out of {item.total} in the last 30 days
              </p>
            </div>
          ))}
          
          {routineData.routineItems.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <p>No routine care activities found.</p>
              <p className="mt-2">Start tracking regular activities like walks, feeding, and medicine.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Routine Recommendations</h3>
        <div className="space-y-3">
          {routineData.weeklyAdherence < 50 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-700">Improve Care Routine</p>
              <p className="text-sm text-red-600">
                Your weekly care routine adherence is low at {Math.round(routineData.weeklyAdherence)}%. 
                Try to complete more planned activities or adjust your routine to be more manageable.
              </p>
            </div>
          )}
          
          {routineData.routineItems.some(item => item.adherenceRate < 50) && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-700">Activity Type Needs Attention</p>
              <p className="text-sm text-yellow-600">
                Some activity types have low completion rates. Focus on improving:
                {routineData.routineItems
                  .filter(item => item.adherenceRate < 50)
                  .map(item => ` ${item.type}`)
                  .join(', ')}.
              </p>
            </div>
          )}
          
          {routineData.routineItems.length < 3 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">Expand Care Routine</p>
              <p className="text-sm text-blue-600">
                Consider adding more activity types to your dog's care routine for better overall health.
                Regular walks, feeding, and playtime are essential components.
              </p>
            </div>
          )}
          
          {routineData.currentStreak >= 5 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-700">Great Streak!</p>
              <p className="text-sm text-green-600">
                You're on a {routineData.currentStreak}-day streak! Keep up the good work with your dog's care routine.
              </p>
            </div>
          )}
          
          {routineData.routineItems.length >= 3 && routineData.monthlyAdherence >= 80 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-700">Excellent Routine Management</p>
              <p className="text-sm text-green-600">
                You're doing a great job maintaining your dog's care routine with {Math.round(routineData.monthlyAdherence)}% adherence.
                Consistent care leads to better health outcomes.
              </p>
            </div>
          )}
          
          {routineData.routineItems.length === 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">Start Tracking Care Activities</p>
              <p className="text-sm text-blue-600">
                Begin tracking regular care activities for your dog. This will help you maintain a consistent routine
                and identify areas for improvement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareRoutineTracking;