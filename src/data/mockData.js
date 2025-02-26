// src/data/mockData.js
export const MOCK_DOGS = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    birthdate: '2020-03-15',
    gender: 'male',
    weight: 28,
    photo: null
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Beagle',
    birthdate: '2021-06-10',
    gender: 'female',
    weight: 12,
    photo: null
  }
];

export const MOCK_ACTIVITIES = [
  { 
    id: 1, 
    dogId: '1',
    date: '2023-11-15', 
    time: '08:30',
    type: 'walk', 
    title: 'Morning Walk', 
    completed: true,
    notes: 'Walk in the park for 30 minutes'
  },
  { 
    id: 2, 
    dogId: '1',
    date: '2023-11-15', 
    time: '12:00',
    type: 'food', 
    title: 'Lunch', 
    completed: true,
    notes: 'Regular dog food, 1 cup'
  },
  { 
    id: 3, 
    dogId: '1',
    date: '2023-11-16', 
    time: '15:00',
    type: 'vet', 
    title: 'Vaccination', 
    completed: false,
    notes: 'Annual vaccination checkup',
    priority: 'high'
  },
  { 
    id: 4, 
    dogId: '1',
    date: '2023-11-20', 
    time: '13:00',
    type: 'play', 
    title: 'Park Visit', 
    completed: false,
    notes: 'Bring tennis ball'
  },
  { 
    id: 5, 
    dogId: '1',
    date: '2023-11-25', 
    time: '17:30',
    type: 'walk', 
    title: 'Evening Walk', 
    completed: false
  }
];