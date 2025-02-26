import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const MOCK_ACTIVITIES = [
  { id: 1, date: '2023-11-23', type: 'walk', title: 'Morning Walk', completed: true },
  { id: 2, date: '2023-11-24', type: 'food', title: 'Feed', completed: false },
  { id: 3, date: '2023-11-24', type: 'medicine', title: 'Medicine', completed: false },
  { id: 4, date: '2023-11-25', type: 'water', title: 'Give Water', completed: true },
  { id: 5, date: '2023-11-25', type: 'walk', title: 'Evening Walk', completed: false },
];

const MOCK_DOGS = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    birthdate: '2020-03-15',
    gender: 'male',
    weight: 28,
    height: 56,
    microchip: '123456789012345',
    notes: 'Likes to swim and play fetch. Allergic to chicken.'
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Beagle',
    birthdate: '2021-06-10',
    gender: 'female',
    weight: 12,
    height: 35,
    microchip: '987654321098765',
    notes: 'Very curious and energetic. Loves to sniff everything.'
  }
];

function HomeDashboard() {
  const navigate = useNavigate();

  const recentActivities = MOCK_ACTIVITIES.filter(activity => activity.completed).slice(0, 5);
  const upcomingEvents = MOCK_ACTIVITIES.filter(activity => !activity.completed).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Activity Summary Widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold text-lg">Recent Activities</h2>
          <ul className="mt-2 space-y-2">
            {recentActivities.map(activity => (
              <li key={activity.id} className="flex justify-between">
                <span>{activity.title}</span>
                <span>{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold text-lg">Upcoming Events</h2>
          <ul className="mt-2 space-y-2">
            {upcomingEvents.map(activity => (
              <li key={activity.id} className="flex justify-between">
                <span>{activity.title}</span>
                <span>{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/add')}
          className="w-full py-2 bg-primary text-white rounded-lg"
        >
          Add Activity
        </button>
        <button
          onClick={() => navigate('/dogs/new')}
          className="w-full py-2 bg-primary text-white rounded-lg"
        >
          Add Dog
        </button>
      </div>

      {/* Recent Activities List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-bold text-lg">Recent Activities</h2>
        <ul className="mt-2 space-y-2">
          {recentActivities.map(activity => (
            <li key={activity.id} className="flex justify-between">
              <span>{activity.title}</span>
              <span>{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events Preview */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-bold text-lg">Upcoming Events</h2>
        <ul className="mt-2 space-y-2">
          {upcomingEvents.map(activity => (
            <li key={activity.id} className="flex justify-between">
              <span>{activity.title}</span>
              <span>{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Dog Profile Preview */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-bold text-lg">Dog Profiles</h2>
        {MOCK_DOGS.map(dog => (
          <div key={dog.id} className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
              🐕
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{dog.name}</h3>
              <p className="text-sm text-gray-600">{dog.breed}</p>
              <p className="text-sm text-gray-600">{dog.gender === 'male' ? 'Male' : 'Female'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeDashboard;