// src/services/notificationService.js
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * Creates a new notification
 * 
 * @param {Object} notification - The notification object
 * @param {string} notification.userId - User ID
 * @param {string} notification.dogId - Dog ID (can be null for user-level notifications)
 * @param {string} notification.type - Notification type (e.g., 'vaccine', 'medication', 'vet', 'activity')
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {Date} notification.dueDate - When the notification is due
 * @param {string} notification.relatedItemId - ID of the related item (e.g., vaccination ID)
 * @param {boolean} notification.isRead - Whether the notification has been read
 * @param {string} notification.priority - Priority level ('high', 'normal', 'low')
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createNotification = async (notification) => {
  try {
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp(),
      dueDate: Timestamp.fromDate(new Date(notification.dueDate)),
      isRead: false,
      priority: notification.priority || 'normal'
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Fetches notifications for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {boolean} options.unreadOnly - Whether to fetch only unread notifications
 * @param {string} options.dogId - Filter by dog ID
 * @param {string} options.type - Filter by notification type
 * @returns {Promise<Array>} - Array of notifications
 */
export const fetchNotifications = async (userId, options = {}) => {
  try {
    let q = query(collection(db, 'notifications'), where('userId', '==', userId));
    
    if (options.unreadOnly) {
      q = query(q, where('isRead', '==', false));
    }
    
    if (options.dogId) {
      q = query(q, where('dogId', '==', options.dogId));
    }
    
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Marks a notification as read
 * 
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Deletes a notification
 * 
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Creates a notification for upcoming vaccination
 * 
 * @param {Object} vaccination - Vaccination object
 * @param {Object} dog - Dog object
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Notification ID
 */
export const createVaccinationReminder = async (vaccination, dog, userId) => {
  // Only create a reminder if there's an expiry date
  if (!vaccination.expiryDate) return null;
  
  const expiryDate = new Date(vaccination.expiryDate);
  const now = new Date();
  
  // Calculate days until expiry
  const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  // Only create a reminder if the vaccine expires within 30 days
  if (daysUntilExpiry > 30) return null;
  
  try {
    return await createNotification({
      userId,
      dogId: dog.id,
      type: 'vaccine',
      title: `Vaccination Reminder: ${vaccination.name}`,
      message: `${dog.name}'s ${vaccination.name} vaccination will expire ${
        daysUntilExpiry <= 0 ? 'today' : `in ${daysUntilExpiry} days`
      }. Please schedule a re-vaccination.`,
      dueDate: expiryDate,
      relatedItemId: vaccination.id,
      priority: daysUntilExpiry <= 7 ? 'high' : 'normal'
    });
  } catch (error) {
    console.error('Error creating vaccination reminder:', error);
    throw error;
  }
};

/**
 * Creates a notification for upcoming vet appointment
 * 
 * @param {Object} appointment - Vet appointment object
 * @param {Object} dog - Dog object
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Notification ID
 */
export const createVetAppointmentReminder = async (appointment, dog, userId) => {
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  
  // Calculate days until appointment
  const daysUntilAppointment = Math.floor((appointmentDate - now) / (1000 * 60 * 60 * 24));
  
  // Don't create reminders for past appointments or more than 7 days in advance
  if (daysUntilAppointment < 0 || daysUntilAppointment > 7) return null;
  
  try {
    return await createNotification({
      userId,
      dogId: dog.id,
      type: 'vet',
      title: `Vet Appointment Reminder`,
      message: `${dog.name} has a vet appointment for ${appointment.reason} ${
        daysUntilAppointment === 0 ? 'today' : `in ${daysUntilAppointment} days`
      } at ${appointment.time}${
        appointment.location ? ` at ${appointment.location}` : ''
      }.`,
      dueDate: appointmentDate,
      relatedItemId: appointment.id,
      priority: daysUntilAppointment <= 1 ? 'high' : 'normal'
    });
  } catch (error) {
    console.error('Error creating vet appointment reminder:', error);
    throw error;
  }
};

/**
 * Creates a notification for medication reminder
 * 
 * @param {Object} medication - Medication object
 * @param {Object} dog - Dog object
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Notification ID
 */
export const createMedicationReminder = async (medication, dog, userId) => {
  // Only create reminders for active medications
  const endDate = medication.endDate ? new Date(medication.endDate) : null;
  const now = new Date();
  
  if (endDate && endDate < now) return null;
  
  // Calculate days until the medication ends
  const daysUntilEnd = endDate 
    ? Math.floor((endDate - now) / (1000 * 60 * 60 * 24))
    : null;
  
  // Create a reminder if the medication is ending soon (within 3 days)
  if (daysUntilEnd !== null && daysUntilEnd <= 3 && daysUntilEnd >= 0) {
    try {
      return await createNotification({
        userId,
        dogId: dog.id,
        type: 'medication',
        title: `Medication Ending Soon: ${medication.name}`,
        message: `${dog.name}'s ${medication.name} medication will end ${
          daysUntilEnd === 0 ? 'today' : `in ${daysUntilEnd} days`
        }. Please check if it needs to be refilled.`,
        dueDate: endDate,
        relatedItemId: medication.id,
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating medication reminder:', error);
      throw error;
    }
  }
  
  return null;
};

/**
 * Scans health records and creates notifications for upcoming events
 * 
 * @param {string} userId - User ID
 * @param {string} dogId - Dog ID
 * @returns {Promise<Array>} - Array of created notification IDs
 */
export const scanHealthRecordsForReminders = async (userId, dogId) => {
  try {
    // Fetch the dog
    const dogRef = doc(db, 'dogs', dogId);
    const dogSnapshot = await getDocs(dogRef);
    if (!dogSnapshot.exists()) {
      throw new Error(`Dog with ID ${dogId} not found`);
    }
    const dog = { id: dogSnapshot.id, ...dogSnapshot.data() };
    
    // Fetch health records
    const healthRecordsQuery = query(
      collection(db, 'healthRecords'), 
      where('dogId', '==', dogId),
      where('userId', '==', userId)
    );
    const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
    const healthRecords = healthRecordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch vaccines
    const vaccinesQuery = query(
      collection(db, 'vaccinations'), 
      where('dogId', '==', dogId),
      where('userId', '==', userId)
    );
    const vaccinesSnapshot = await getDocs(vaccinesQuery);
    const vaccines = vaccinesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const createdNotifications = [];
    
    // Process vaccines
    for (const vaccine of vaccines) {
      const notificationId = await createVaccinationReminder(vaccine, dog, userId);
      if (notificationId) {
        createdNotifications.push(notificationId);
      }
    }
    
    // Process health records
    for (const record of healthRecords) {
      if (record.type === 'vet') {
        const notificationId = await createVetAppointmentReminder(record, dog, userId);
        if (notificationId) {
          createdNotifications.push(notificationId);
        }
      } else if (record.type === 'medication') {
        const notificationId = await createMedicationReminder(record, dog, userId);
        if (notificationId) {
          createdNotifications.push(notificationId);
        }
      }
    }
    
    return createdNotifications;
  } catch (error) {
    console.error('Error scanning health records for reminders:', error);
    throw error;
  }
};