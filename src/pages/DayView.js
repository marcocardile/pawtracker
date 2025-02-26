// src/pages/DayView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse, parseISO, isToday } from 'date-fns';
import { MOCK_ACTIVITIES } from '../data/mockData';

function DayView() {
  const { date } = useParams(); // formato 'YYYY-MM-DD'
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [displayDate, setDisplayDate] = useState(new Date());
  
  // Carica le attività per la data selezionata
  useEffect(() => {
    try {
      // Converte la stringa della data in oggetto Date
      const parsedDate = date ? parseISO(date) : new Date();
      setDisplayDate(parsedDate);
      
      // Filtra le attività per la data selezionata
      const dayActivities = MOCK_ACTIVITIES.filter(activity => 
        format(parseISO(activity.date), 'yyyy-MM-dd') === format(parsedDate, 'yyyy-MM-dd')
      );
      
      // Ordina per ora
      const sortedActivities = [...dayActivities].sort((a, b) => 
        a.time.localeCompare(b.time)
      );
      
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error parsing date:', error);
      navigate('/calendar');
    }
  }, [date, navigate]);
  
  // Gestisce il toggle di completamento
  const handleToggleComplete = (activityId) => {
    setActivities(
      activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, completed: !activity.completed } 
          : activity
      )
    );
  };
  
  // Colori per i tipi di attività
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
  
  // Icone per i tipi di attività
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
  
  // Titoli per le fasce orarie
  const timeSlots = [
    { start: '06:00', end: '12:00', title: 'Morning' },
    { start: '12:00', end: '18:00', title: 'Afternoon' },
    { start: '18:00', end: '23:59', title: 'Evening' }
  ];
  
  // Raggruppa le attività per fascia oraria
  const groupedActivities = timeSlots.map(slot => {
    const slotActivities = activities.filter(activity => {
      return activity.time >= slot.start && activity.time < slot.end;
    });
    
    return {
      ...slot,
      activities: slotActivities
    };
  });
  
  return (
    <>
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/calendar')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <h1 className="text-xl font-bold">
          {isToday(displayDate) ? 'Today' : format(displayDate, 'EEEE, MMMM d')}
        </h1>
      </div>
      
      {/* Timeline View */}
      <div className="space-y-6">
        {groupedActivities.map((slot, index) => (
          <div key={index} className="relative">
            {/* Time slot header */}
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                {index === 0 ? '🌅' : index === 1 ? '☀️' : '🌙'}
              </div>
              <h2 className="text-lg font-medium">{slot.title}</h2>
              <div className="text-xs text-gray-500 ml-2">
                {slot.start} - {slot.end}
              </div>
            </div>
            
            {/* Timeline with activities */}
            <div className="ml-5 pl-6 border-l-2 border-gray-200">
              {slot.activities.length > 0 ? (
                <div className="space-y-3">
                  {slot.activities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="bg-white rounded-lg shadow p-4 flex items-center relative"
                      onClick={() => navigate(`/activity/edit/${activity.id}`)}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1/2 transform -translate-x-[calc(0.75rem+1px)] -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white"></div>
                      
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
                <div className="py-4 text-center text-gray-500">
                  <p>No activities for {slot.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 mt-4">
            <p>No activities scheduled for this day</p>
            <button 
              className="mt-4 bg-primary text-white rounded-lg py-2 px-4"
              onClick={() => navigate('/add')}
            >
              Add Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Add Activity Button */}
      <div className="fixed bottom-20 right-4">
        <button
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={() => navigate('/add')}
        >
          +
        </button>
      </div>
    </>
  );
}

export default DayView;