// src/components/analytics/DogHealthAnalytics.js
import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays, addMonths, subMonths, isAfter, isBefore } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { fetchHealthRecords, fetchVaccines } from '../../services/firebaseService';

function DogHealthAnalytics({ dogId }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weightRecords, setWeightRecords] = useState([]);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [healthTrends, setHealthTrends] = useState({
    weightTrend: 'stable', // 'increasing', 'decreasing', 'stable'
    weightChangeRate: 0,    // kg per month
    lastWeightCheck: null,
    upcomingVaccinations: [],
    medicationAdherence: 0, // percentage
    vetVisitFrequency: 0    // visits per year
  });

  useEffect(() => {
    const loadHealthData = async () => {
      if (!currentUser || !dogId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch health records
        const records = await fetchHealthRecords(dogId);
        setHealthRecords(records);
        
        // Filter weight records
        const weightRecs = records
          .filter(record => record.type === 'weight')
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeightRecords(weightRecs);
        
        // Fetch vaccinations
        const vaccines = await fetchVaccines(dogId);
        setVaccineRecords(vaccines);
        
        // Calculate health trends
        calculateHealthTrends(weightRecs, vaccines, records);
      } catch (err) {
        console.error("Error loading health data for analytics:", err);
        setError("Failed to load health data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadHealthData();
  }, [currentUser, dogId]);

  // Calculate health trends and statistics
  const calculateHealthTrends = (weightRecs, vaccines, allRecords) => {
    // Calculate weight trend
    let weightTrend = 'stable';
    let weightChangeRate = 0;
    let lastWeightCheck = null;
    
    if (weightRecs.length >= 2) {
      // Get most recent weight records (up to 3 months)
      const now = new Date();
      const threeMonthsAgo = subMonths(now, 3);
      const recentWeights = weightRecs.filter(r => parseISO(r.date) >= threeMonthsAgo);
      
      if (recentWeights.length >= 2) {
        const firstWeight = recentWeights[0];
        const lastWeight = recentWeights[recentWeights.length - 1];
        const weightDiff = lastWeight.weight - firstWeight.weight;
        const daysDiff = differenceInDays(parseISO(lastWeight.date), parseISO(firstWeight.date));
        
        // Calculate monthly change rate
        weightChangeRate = weightDiff / (daysDiff / 30);
        
        // Determine trend
        if (weightChangeRate > 0.2) {
          weightTrend = 'increasing';
        } else if (weightChangeRate < -0.2) {
          weightTrend = 'decreasing';
        }
        
        lastWeightCheck = lastWeight.date;
      }
    }
    
    // Find upcoming vaccinations (next 60 days)
    const now = new Date();
    const sixtyDaysFromNow = addMonths(now, 2);
    const upcomingVaccinations = vaccines
      .filter(v => {
        if (!v.expiryDate) return false;
        const expiryDate = parseISO(v.expiryDate);
        return isAfter(expiryDate, now) && isBefore(expiryDate, sixtyDaysFromNow);
      })
      .sort((a, b) => parseISO(a.expiryDate) - parseISO(b.expiryDate));
    
    // Calculate medication adherence
    const medicationRecords = allRecords.filter(r => r.type === 'medication');
    let medicationAdherence = 0;
    
    if (medicationRecords.length > 0) {
      const completed = medicationRecords.filter(r => r.endDate && isAfter(parseISO(r.endDate), now));
      medicationAdherence = (completed.length / medicationRecords.length) * 100;
    }
    
    // Calculate vet visit frequency (per year)
    const vetRecords = allRecords.filter(r => r.type === 'vet');
    let vetVisitFrequency = 0;
    
    if (vetRecords.length > 0) {
      const oldestVisit = vetRecords.reduce((oldest, current) => 
        parseISO(current.date) < parseISO(oldest.date) ? current : oldest
      );
      
      const yearDiff = differenceInDays(now, parseISO(oldestVisit.date)) / 365;
      vetVisitFrequency = yearDiff > 0 ? vetRecords.length / yearDiff : vetRecords.length;
    }
    
    setHealthTrends({
      weightTrend,
      weightChangeRate,
      lastWeightCheck,
      upcomingVaccinations,
      medicationAdherence,
      vetVisitFrequency
    });
  };

  // Get health score
  const calculateHealthScore = () => {
    // This is a simplified health score calculation
    let score = 70; // Base score
    
    // Weight trend factor
    if (healthTrends.weightTrend === 'stable') {
      score += 10;
    } else if (healthTrends.weightTrend === 'decreasing' && healthTrends.weightChangeRate > -1) {
      score += 5; // Slight decrease may be good
    } else if (healthTrends.weightTrend === 'increasing' && healthTrends.weightChangeRate < 0.5) {
      score += 5; // Slight increase may be good for growing dogs
    }
    
    // Vaccine factor
    if (healthTrends.upcomingVaccinations.length === 0 && vaccineRecords.length > 0) {
      score += 10; // All vaccines up to date
    } else {
      score -= healthTrends.upcomingVaccinations.length * 2; // Deduct for each upcoming vaccine
    }
    
    // Medication adherence
    score += (healthTrends.medicationAdherence / 10);
    
    // Vet visit frequency
    if (healthTrends.vetVisitFrequency >= 1) {
      score += 10; // Regular checkups
    } else if (healthTrends.vetVisitFrequency >= 0.5) {
      score += 5;  // Moderate checkups
    }
    
    // Limit score to 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  
  // Get status color class
  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.medium) return 'text-yellow-500';
    return 'text-red-500';
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

  const healthScore = calculateHealthScore();

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Health Score</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div 
              className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold ${
                healthScore >= 80 ? 'bg-green-100 text-green-800' : 
                healthScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}
            >
              {healthScore}
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-gray-600">
          {healthScore >= 80 ? 'Your dog is in excellent health!' : 
           healthScore >= 50 ? 'Your dog is in good health with some areas to improve.' : 
           'Your dog\'s health needs attention.'}
        </p>
      </div>
      
      {/* Weight Trend */}
      {weightRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Weight Trend</h3>
          
          <div className="mb-4 overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {weightRecords.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{format(parseISO(record.date), 'MMM d, yyyy')}</td>
                    <td className="p-2 font-medium">{record.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-700">
              <span className="font-medium">Trend: </span>
              <span className={
                healthTrends.weightTrend === 'stable' ? 'text-green-500' :
                healthTrends.weightTrend === 'increasing' ? 'text-yellow-500' :
                'text-yellow-500'
              }>
                {healthTrends.weightTrend.charAt(0).toUpperCase() + healthTrends.weightTrend.slice(1)}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Change Rate: </span>
              {healthTrends.weightChangeRate.toFixed(2)} kg per month
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Last Check: </span>
              {healthTrends.lastWeightCheck ? format(parseISO(healthTrends.lastWeightCheck), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
        </div>
      )}
      
      {/* Upcoming Vaccinations */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Vaccination Status</h3>
        {healthTrends.upcomingVaccinations.length > 0 ? (
          <div>
            <p className="text-yellow-500 font-medium mb-2">
              Upcoming vaccinations that need attention:
            </p>
            <div className="space-y-2">
              {healthTrends.upcomingVaccinations.map((vaccine) => (
                <div key={vaccine.id} className="border rounded-lg p-3">
                  <p className="font-medium">{vaccine.name}</p>
                  <p className="text-sm text-gray-500">
                    Expires: {format(parseISO(vaccine.expiryDate), 'MMMM d, yyyy')}
                    {' '}
                    <span className="text-yellow-500">
                      ({differenceInDays(parseISO(vaccine.expiryDate), new Date())} days left)
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : vaccineRecords.length > 0 ? (
          <div className="text-green-500 flex items-center">
            <span className="mr-2">✅</span>
            All vaccinations are up to date!
          </div>
        ) : (
          <div className="text-red-500">
            No vaccination records found. Please add vaccination information to monitor your dog's health better.
          </div>
        )}
      </div>
      
      {/* Health Metrics */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Health Metrics</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-700 mb-2">Medication Adherence</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ 
                  width: `${healthTrends.medicationAdherence}%`,
                  backgroundColor: healthTrends.medicationAdherence >= 80 ? '#48bb78' : 
                                 healthTrends.medicationAdherence >= 50 ? '#ecc94b' : 
                                 '#f56565'
                }}
              ></div>
            </div>
            <p className={`text-right text-sm ${
              getStatusColor(healthTrends.medicationAdherence, {good: 80, medium: 50})
            }`}>
              {Math.round(healthTrends.medicationAdherence)}%
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-2">Vet Visit Frequency</p>
            <p className="text-2xl font-bold">
              {healthTrends.vetVisitFrequency.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">visits per year</span>
            </p>
            <p className={`text-sm ${
              getStatusColor(healthTrends.vetVisitFrequency, {good: 1, medium: 0.5})
            }`}>
              {healthTrends.vetVisitFrequency < 1 ? 'Consider scheduling more regular checkups' : 'Good checkup frequency'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Health Recommendations */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Health Recommendations</h3>
        <div className="space-y-2">
          {weightRecords.length < 2 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">Track Weight Regularly</p>
              <p className="text-sm text-blue-600">
                Regular weight tracking helps monitor your dog's health. Consider recording weight monthly.
              </p>
            </div>
          )}
          
          {healthTrends.weightTrend === 'increasing' && healthTrends.weightChangeRate > 0.5 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-700">Weight Increasing</p>
              <p className="text-sm text-yellow-600">
                Your dog's weight is increasing at {healthTrends.weightChangeRate.toFixed(2)} kg per month. 
                Consider reviewing diet and exercise routine.
              </p>
            </div>
          )}
          
          {healthTrends.weightTrend === 'decreasing' && healthTrends.weightChangeRate < -0.5 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-700">Weight Decreasing</p>
              <p className="text-sm text-yellow-600">
                Your dog's weight is decreasing at {Math.abs(healthTrends.weightChangeRate).toFixed(2)} kg per month. 
                Monitor closely and consult with your vet if this continues.
              </p>
            </div>
          )}
          
          {healthTrends.upcomingVaccinations.length > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-700">Vaccination Due Soon</p>
              <p className="text-sm text-yellow-600">
                {healthTrends.upcomingVaccinations.length} vaccination(s) will expire soon. 
                Schedule a vet appointment to keep vaccinations up to date.
              </p>
            </div>
          )}
          
          {healthTrends.medicationAdherence < 70 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-700">Improve Medication Adherence</p>
              <p className="text-sm text-yellow-600">
                Your medication adherence is at {Math.round(healthTrends.medicationAdherence)}%. 
                Try to follow medication schedules more consistently for better health outcomes.
              </p>
            </div>
          )}
          
          {healthTrends.vetVisitFrequency < 1 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">Regular Vet Checkups</p>
              <p className="text-sm text-blue-600">
                Consider scheduling at least one annual checkup with your vet, 
                even if your dog appears healthy.
              </p>
            </div>
          )}
          
          {healthScore >= 80 && healthTrends.medicationAdherence >= 80 && healthTrends.vetVisitFrequency >= 1 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-700">Excellent Health Management</p>
              <p className="text-sm text-green-600">
                You're doing a great job managing your dog's health! Continue with 
                the current care routine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DogHealthAnalytics;