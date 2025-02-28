// Path: src/components/WeightChart.js

import React from 'react';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { Line } from 'react-chartjs-2';

const WeightChart = ({ dogId }) => {
  const weightsRef = useFirestore().collection('weights').where('dogId', '==', dogId);
  const { data: weights } = useFirestoreCollectionData(weightsRef, { idField: 'id' });

  const chartData = {
    labels: weights ? weights.map((record) => record.date) : [],
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights ? weights.map((record) => record.weight) : [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return <Line data={chartData} />;
};

export default WeightChart;