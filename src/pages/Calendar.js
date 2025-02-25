// src/pages/Calendar.js
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import Layout from '../components/layout/Layout';

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Gestori per navigare tra i mesi
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
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
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === currentMonth.getMonth() && 
                      new Date().getFullYear() === currentMonth.getFullYear();
      
      days.push(
        <div 
          key={day} 
          className={`p-2 text-center ${isToday ? 'bg-primary text-white rounded-full' : ''}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <Layout>
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
        <h3 className="text-lg font-bold mb-4">Today's Activities</h3>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center text-gray-500 py-4">
            No activities scheduled for today
          </div>
          <button className="w-full mt-2 bg-primary text-white rounded-lg py-2 flex items-center justify-center">
            <span className="mr-2">+</span> Add Activity
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Calendar;