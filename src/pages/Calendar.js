// src/pages/Calendar.js - versione aggiornata senza loader
import React, { useState } from 'react';
import { format, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Dati fittizi per le attività
const MOCK_ACTIVITIES = [
  { id: 1, date: '2023-11-15', type: 'walk', title: 'Morning Walk', completed: true },
  { id: 2, date: '2023-11-15', type: 'food', title: 'Lunch', completed: true },
  { id: 3, date: '2023-11-16', type: 'vet', title: 'Vaccination', completed: false },
  { id: 4, date: '2023-11-20', type: 'play', title: 'Park Visit', completed: false },
  { id: 5, date: '2023-11-25', type: 'walk', title: 'Evening Walk', completed: false },
];

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities] = useState(MOCK_ACTIVITIES); // Inizializzato direttamente
  const navigate = useNavigate();
  
  // Gestori per navigare tra i mesi
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  // Vai a "oggi"
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Verifica se una data ha attività
  const hasActivities = (date) => {
    return activities.some(activity => 
      isSameDay(parseISO(activity.date), date)
    );
  };
  
  // Ottieni le attività per la data selezionata
  const getActivitiesForDate = (date) => {
    return activities.filter(activity => 
      isSameDay(parseISO(activity.date), date)
    );
  };
  
  // Array con i nomi dei giorni della settimana
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Genera i giorni del mese
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    // Spazi vuoti per i giorni precedenti al primo del mese
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Giorni del mese
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
          onClick={() => setSelectedDate(date)}
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
  
  // Attività per la data selezionata
  const selectedDateActivities = getActivitiesForDate(selectedDate);
  
  // Colori per i tipi di attività
  const activityColors = {
    walk: 'bg-blue-500',
    food: 'bg-orange-500',
    vet: 'bg-red-500',
    play: 'bg-green-500'
  };
  
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <button 
          onClick={goToToday}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
        >
          Today
        </button>
      </div>
      
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
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays()}
        </div>
      </div>
      
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
        
        {selectedDateActivities.length > 0 ? (
          <div className="space-y-3">
            {selectedDateActivities.map(activity => (
              <div 
                key={activity.id} 
                className="bg-white rounded-lg shadow p-4 flex items-center"
              >
                <div className={`w-10 h-10 rounded-full ${activityColors[activity.type]} flex items-center justify-center text-white mr-3`}>
                  {activity.type === 'walk' && '🚶'}
                  {activity.type === 'food' && '🍖'}
                  {activity.type === 'vet' && '💉'}
                  {activity.type === 'play' && '🎾'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-500">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
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
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500 py-8">
            No activities scheduled for this day
            <button 
              className="w-full mt-4 bg-primary text-white rounded-lg py-2 flex items-center justify-center"
              onClick={() => navigate('/add')}
            >
              <span className="mr-2">+</span> Add Activity
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Calendar;