// src/services/cacheService.js

// In-memory cache
const cache = new Map();

// Cache TTLs in milliseconds
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const TTLs = {
  dogs: 10 * 60 * 1000, // 10 minutes
  activities: 2 * 60 * 1000, // 2 minutes
  healthRecords: 5 * 60 * 1000, // 5 minutes
  vaccinations: 10 * 60 * 1000, // 10 minutes
};

// Cache helpers
const getKey = (collection, id = null) => {
  return id ? `${collection}:${id}` : collection;
};

const getCacheItem = (key) => {
  if (!cache.has(key)) return null;
  
  const item = cache.get(key);
  if (item.expires < Date.now()) {
    // Expired, remove from cache
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

const setCacheItem = (key, data, ttl = DEFAULT_TTL) => {
  cache.set(key, {
    data,
    expires: Date.now() + ttl
  });
};

const invalidateCache = (key) => {
  if (cache.has(key)) {
    cache.delete(key);
    return true;
  }
  return false;
};

// Clear cache for a collection
const clearCollectionCache = (collection) => {
  const prefix = `${collection}:`;
  let count = 0;
  
  // Clear collection list
  if (cache.has(collection)) {
    cache.delete(collection);
    count++;
  }
  
  // Clear individual items
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      count++;
    }
  }
  
  return count;
};

// Clear all cache
const clearAllCache = () => {
  const size = cache.size;
  cache.clear();
  return size;
};

/**
 * Wraps a service with caching capabilities
 * @param {Object} service - The service to enhance with caching
 * @returns {Object} - Enhanced service with caching
 */
export const enhanceServiceWithCache = (service) => {
  return {
    // Fetch dogs with cache
    fetchDogs: async (userId) => {
      const cacheKey = `dogs:list:${userId}`;
      const cachedData = getCacheItem(cacheKey);
      
      if (cachedData) {
        console.log('Using cached dogs data');
        return cachedData;
      }
      
      const dogs = await service.fetchDogs(userId);
      setCacheItem(cacheKey, dogs, TTLs.dogs);
      return dogs;
    },
    
    // Add dog with cache invalidation
    addDog: async (dogData) => {
      const result = await service.addDog(dogData);
      
      // Invalidate relevant caches
      clearCollectionCache('dogs');
      
      return result;
    },
    
    // Update dog with cache invalidation
    updateDog: async (dogId, dogData) => {
      await service.updateDog(dogId, dogData);
      
      // Invalidate relevant caches
      invalidateCache(`dogs:${dogId}`);
      clearCollectionCache('dogs');
    },
    
    // Delete dog with cache invalidation
    deleteDog: async (dogId) => {
      await service.deleteDog(dogId);
      
      // Invalidate relevant caches
      invalidateCache(`dogs:${dogId}`);
      clearCollectionCache('dogs');
    },
    
    // Fetch activities with cache
    fetchActivities: async (userId) => {
      const cacheKey = `activities:list:${userId}`;
      const cachedData = getCacheItem(cacheKey);
      
      if (cachedData) {
        console.log('Using cached activities data');
        return cachedData;
      }
      
      const activities = await service.fetchActivities(userId);
      setCacheItem(cacheKey, activities, TTLs.activities);
      return activities;
    },
    
    // Add activity with cache invalidation
    addActivity: async (activityData) => {
      const result = await service.addActivity(activityData);
      
      // Invalidate relevant caches
      clearCollectionCache('activities');
      
      return result;
    },
    
    // Update activity with cache invalidation
    updateActivity: async (activityId, activityData) => {
      await service.updateActivity(activityId, activityData);
      
      // Invalidate relevant caches
      invalidateCache(`activities:${activityId}`);
      clearCollectionCache('activities');
    },
    
    // Delete activity with cache invalidation
    deleteActivity: async (activityId) => {
      await service.deleteActivity(activityId);
      
      // Invalidate relevant caches
      invalidateCache(`activities:${activityId}`);
      clearCollectionCache('activities');
    },
    
    // Fetch health records with cache
    fetchHealthRecords: async (dogId) => {
      const cacheKey = `healthRecords:dog:${dogId}`;
      const cachedData = getCacheItem(cacheKey);
      
      if (cachedData) {
        console.log('Using cached health records data');
        return cachedData;
      }
      
      const records = await service.fetchHealthRecords(dogId);
      setCacheItem(cacheKey, records, TTLs.healthRecords);
      return records;
    },
    
    // Add health record with cache invalidation
    addHealthRecord: async (recordData) => {
      const result = await service.addHealthRecord(recordData);
      
      // Invalidate relevant caches
      clearCollectionCache('healthRecords');
      invalidateCache(`healthRecords:dog:${recordData.dogId}`);
      
      return result;
    },
    
    // Update health record with cache invalidation
    updateHealthRecord: async (recordId, recordData) => {
      await service.updateHealthRecord(recordId, recordData);
      
      // Invalidate relevant caches
      invalidateCache(`healthRecords:${recordId}`);
      clearCollectionCache('healthRecords');
      if (recordData.dogId) {
        invalidateCache(`healthRecords:dog:${recordData.dogId}`);
      }
    },
    
    // Delete health record with cache invalidation
    deleteHealthRecord: async (recordId, dogId) => {
      await service.deleteHealthRecord(recordId);
      
      // Invalidate relevant caches
      invalidateCache(`healthRecords:${recordId}`);
      clearCollectionCache('healthRecords');
      if (dogId) {
        invalidateCache(`healthRecords:dog:${dogId}`);
      }
    },
    
    // Fetch vaccines with cache
    fetchVaccines: async (dogId) => {
      const cacheKey = `vaccinations:dog:${dogId}`;
      const cachedData = getCacheItem(cacheKey);
      
      if (cachedData) {
        console.log('Using cached vaccinations data');
        return cachedData;
      }
      
      const vaccines = await service.fetchVaccines(dogId);
      setCacheItem(cacheKey, vaccines, TTLs.vaccinations);
      return vaccines;
    },
    
    // Add any other methods from the original service
    // with appropriate caching behavior
    // ...
    
    // Pass through other methods that don't need caching
    ...Object.entries(service).reduce((acc, [key, value]) => {
      if (!acc[key] && typeof value === 'function') {
        acc[key] = value;
      }
      return acc;
    }, {}),
    
    // Clear cache for the current user
    clearCache: () => {
      return clearAllCache();
    }
  };
};

// Helper functions
export const invalidateCacheKey = invalidateCache;
export const clearCache = clearAllCache;
export const clearCacheCollection = clearCollectionCache;