// src/components/health/DogWeightChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DogWeightChart({ weightRecords }) {
  // Sort records by date (earliest first)
  const sortedRecords = [...weightRecords].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Format the data for Chart.js
  const data = {
    labels: sortedRecords.map(record => format(new Date(record.date), 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Weight (kg)',
        data: sortedRecords.map(record => record.weight),
        borderColor: '#3498db', // Primary color
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#3498db',
        pointRadius: 4,
        tension: 0.3, // Smooths the line
        fill: true
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight History'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Weight: ${context.raw} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Weight (kg)'
        },
        // Calculate a good min value slightly below the lowest weight
        min: Math.floor(Math.min(...sortedRecords.map(r => r.weight)) * 0.95),
        // Calculate a good max value slightly above the highest weight
        max: Math.ceil(Math.max(...sortedRecords.map(r => r.weight)) * 1.05)
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // If we have no weight records or only one, display a message
  if (sortedRecords.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center text-gray-500">
        No weight records available to display chart
      </div>
    );
  }

  if (sortedRecords.length === 1) {
    return (
      <div className="border rounded-lg p-6 text-center text-gray-500">
        At least two weight records are needed to display a chart
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default DogWeightChart;