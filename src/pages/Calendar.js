// src/pages/Calendar.js
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ActivityFilters from '../components/activities/ActivityFilters';
import { useAuth } from '../contexts/AuthContext';
import { fetchActivities, updateActivity } from '../services/firebaseService';

function Calendar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    sort: 'time-asc'
  });

  // Fetch activities from Firebase
  useEffect(() => {
    async function getActivities() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const activitiesData = await fetchActivities(currentUser.uid);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getActivities();
  }, [currentUser]);

  // Apply filters and sorting to activities
  useEffect(() => {
    // Filter by date
    let result = activities.filter(activity =>
      isSameDay(parseISO(activity.date), selectedDate)
    );
    
    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter(activity => activity.type === filters.type);
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      const isCompleted = filters.status === 'completed';
      result = result.filter(activity => activity.completed === isCompleted);
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      // Sort by time (earlier first)
      if (filters.sort === 'time-asc') {
        return a.time.localeCompare(b.time);
      }
      // Sort by time (later first)
      else if (filters.sort === 'time-desc') {
        return b.time.localeCompare(a.time);
      }
      // Sort by activity type
      else if (filters.sort === 'type') {
        return a.type.localeCompare(b.type);
      }
      // Sort by priority
      else if (filters.sort === 'priority') {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const aPriority = a.priority || 'normal';
        const bPriority = b.priority || 'normal';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      return 0;
    });
    
    setFilteredActivities(result);
  }, [selectedDate, activities, filters]);

  // Toggle completion status
  const handleToggleComplete = async (activityId) => {
    try {
      // Find the activity to toggle
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;
      
      // Update in state
      const updatedActivities = activities.map(a => 
        a.id === activityId ? {...a, completed: !a.completed} : a
      );
      setActivities(updatedActivities);
      
      // Update in Firebase
      await updateActivity(activityId, {
        completed: !activity.completed
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      // Revert changes in case of error
      setActivities([...activities]);
    }
  };

  // Month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Navigate to day view
  const goToDay = (date) => {
    navigate(`/day/${format(date, 'yyyy-MM-dd')}`);
  };

  // Check if a date has activities
  const hasActivities = (date) => {
    return activities.some(activity =>
      isSameDay(parseISO(activity.date), date)
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    // Calendar generation logic remains the same
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    // Empty spaces for days before the first of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const _isToday = isToday(date);
      const isSelected = isSameDay(date, selectedDate);
      const hasDayActivities = hasActivities(date);
      
      days.push(
        <div
          key={day}
          className={`p-2 text-center cursor-pointer relative ${
            _isToday ? 'font-bold' : ''
          } ${
            isSelected ? 'bg-primary text-white rounded-lg' : ''
          }`}
          onClick={() => {
            setSelectedDate(date);
            goToDay(date);
          }}
        >
          {day}
          {/* Activity indicators */}
          {hasDayActivities && !isSelected && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Activity type colors
  const activityColors = {
    walk: 'bg-blue-500',
    food: 'bg-orange-500',
    vet: 'bg-red-500',
    play: 'bg-green-500',
    water: 'bg-cyan-500',
    medicine: 'bg-purple-500',
    groom: 'bg-yellow-500',
    training: 'bg-pink-500'
  };

  // Activity icons
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

  // The rest of the JSX remains largely the same
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={`p-2 rounded-full ${filtersVisible ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            🔍
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      {filtersVisible && (
        <ActivityFilters
          filters={filters}
          setFilters={setFilters}
        />
      )}
      
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays()}
        </div>
      </div>
      
      {/* Activities List */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            Activities for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <button
            className="p-2 bg-primary text-white rounded-full"
            onClick={() => navigate('/add')}
          >
            +
          </button>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow p-4 flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-3">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow p-4 flex items-center"
                onClick={() => navigate(`/activity/edit/${activity.id}`)}
              >
                <div className={`w-10 h-10 rounded-full ${activityColors[activity.type] || 'bg-gray-300'} flex items-center justify-center text-white mr-3`}>
                  {activityIcons[activity.type] || '?'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-500">
                    {activity.time} • {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </p>
                </div>
                <div className="w-6 h-6" onClick={(e) => e.stopPropagation()}>
                  {activity.completed ? (
                    <div
                      className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white"
                      onClick={() => handleToggleComplete(activity.id)}
                    >
                      ✓
                    </div>
                  ) : (
                    <div
                      className="w-6 h-6 border-2 border-gray-300 rounded-full"
                      onClick={() => handleToggleComplete(activity.id)}
                    ></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500 py-8">
            {filters.type !== 'all' || filters.status !== 'all' ? (
              <>
                <p>No activities match the selected filters</p>
                <button
                  className="mt-2 text-primary"
                  onClick={() => setFilters({type: 'all', status: 'all', sort: 'time-asc'})}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p>No activities scheduled for this day</p>
                <button
                  className="w-full mt-4 bg-primary text-white rounded-lg py-2 flex items-center justify-center"
                  onClick={() => navigate('/add')}
                >
                  <span className="mr-2">+</span> Add Activity
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Calendar;