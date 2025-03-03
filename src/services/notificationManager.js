// src/services/notificationManager.js
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { /*compareAsc,*/ parseISO, addMinutes, isAfter, isBefore, /*format*/ } from 'date-fns';
import { db } from '../firebase';
import { 
  fetchActivities, 
  fetchHealthRecords,
  fetchVaccines
} from './firebaseService';

// Costanti per il servizio
const NOTIFICATION_CHECK_INTERVAL = 60000; // Verifica ogni minuto
const ACTIVITY_REMINDER_TIME = 30; // Minuti prima dell'attività
const UPCOMING_ACTIVITY_PERIOD = 24 * 60; // Attività nelle prossime 24 ore
const VACCINE_REMINDER_DAYS = [30, 7, 1]; // Giorni prima della scadenza del vaccino
const MEDICATION_REMINDER_DAYS = [3, 1]; // Giorni prima della fine del medicinale
const VET_REMINDER_DAYS = [7, 1]; // Giorni prima della visita veterinaria

class NotificationManager {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
    this.userId = null;
    this.lastChecked = {};
  }

  // Inizializza il manager con l'ID utente
  initialize(userId) {
    if (this.isRunning) {
      this.stop();
    }
    
    this.userId = userId;
    this.lastChecked = {
      activities: null,
      vaccines: null,
      medications: null,
      vet: null
    };
    
    // Esegui immediatamente la prima verifica
    this.checkForNotifications();
    
    // Imposta l'intervallo per le verifiche successive
    this.checkInterval = setInterval(() => {
      this.checkForNotifications();
    }, NOTIFICATION_CHECK_INTERVAL);
    
    this.isRunning = true;
    console.log('Notification Manager inizializzato per l\'utente:', userId);
    
    // Registra il servizio per le notifiche push (se supportate)
    this.registerForPushNotifications();
    
    return this;
  }

  // Arresta il manager
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Notification Manager arrestato');
  }

  // Verifica tutte le possibili notifiche
  async checkForNotifications() {
    if (!this.userId) return;
    
    try {
      await Promise.all([
        this.checkActivityNotifications(),
        this.checkVaccineNotifications(),
        this.checkMedicationNotifications(),
        this.checkVetAppointmentNotifications()
      ]);
      
      console.log('Verifica notifiche completata');
    } catch (error) {
      console.error('Errore durante la verifica delle notifiche:', error);
    }
  }

  // Verifica le notifiche per le attività
  async checkActivityNotifications() {
    try {
      // Ottieni tutte le attività
      const activities = await fetchActivities(this.userId);
      
      // Filtra solo le attività future o di oggi che non sono completate
      const now = new Date();
      const upcoming = activities.filter(activity => {
        const activityDateTime = parseISO(`${activity.date}T${activity.time}`);
        const cutoffTime = addMinutes(now, UPCOMING_ACTIVITY_PERIOD);
        
        return (
          !activity.completed && 
          isAfter(activityDateTime, now) && 
          isBefore(activityDateTime, cutoffTime)
        );
      });
      
      // Crea notifiche per le attività imminenti
      for (const activity of upcoming) {
        const activityDateTime = parseISO(`${activity.date}T${activity.time}`);
        const reminderTime = addMinutes(activityDateTime, -ACTIVITY_REMINDER_TIME);
        
        // Se è ora di inviare la notifica per questa attività
        if (isAfter(now, reminderTime) && isBefore(now, activityDateTime)) {
          // Verifica se abbiamo già inviato una notifica per questa attività
          const notificationKey = `activity_${activity.id}`;
          if (this.lastChecked[notificationKey]) continue;
          
          // Crea la notifica
          await this.createNotification({
            type: 'activity',
            title: `${activity.title} - Reminder`,
            message: `You have "${activity.title}" scheduled at ${activity.time}`,
            dogId: activity.dogId,
            relatedItemId: activity.id,
            dueDate: activityDateTime,
            priority: activity.priority || 'normal'
          });
          
          // Segna come inviata
          this.lastChecked[notificationKey] = true;
        }
      }
    } catch (error) {
      console.error('Errore durante la verifica delle notifiche attività:', error);
    }
  }

  // Verifica le notifiche per i vaccini
  async checkVaccineNotifications() {
    try {
      // Ottieni tutti i cani dell'utente
      const dogsCollection = collection(db, 'dogs');
      const q = query(dogsCollection, where('userId', '==', this.userId));
      const dogsSnapshot = await getDocs(q);
      const dogs = dogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Per ogni cane, verifica i vaccini
      for (const dog of dogs) {
        const vaccines = await fetchVaccines(dog.id);
        
        // Filtra i vaccini con data di scadenza
        const vaccinesWithExpiry = vaccines.filter(v => v.expiryDate);
        
        // Per ogni vaccino, verifica se è necessaria una notifica
        for (const vaccine of vaccinesWithExpiry) {
          const expiryDate = parseISO(vaccine.expiryDate);
          const now = new Date();
          
          // Verifica se la data di scadenza è vicina
          for (const days of VACCINE_REMINDER_DAYS) {
            const notificationKey = `vaccine_${vaccine.id}_${days}`;
            if (this.lastChecked[notificationKey]) continue;
            
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry === days) {
              // Crea la notifica
              await this.createNotification({
                type: 'vaccine',
                title: `Vaccination Reminder: ${vaccine.name}`,
                message: `${dog.name}'s ${vaccine.name} vaccination expires in ${days} ${days === 1 ? 'day' : 'days'}`,
                dogId: dog.id,
                relatedItemId: vaccine.id,
                dueDate: expiryDate,
                priority: days <= 7 ? 'high' : 'normal'
              });
              
              // Segna come inviata
              this.lastChecked[notificationKey] = true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Errore durante la verifica delle notifiche vaccini:', error);
    }
  }

  // Verifica le notifiche per i medicinali
  async checkMedicationNotifications() {
    try {
      // Ottieni tutti i record di salute
      const healthRecords = await Promise.all(
        (await this.getAllDogs()).map(dog => fetchHealthRecords(dog.id))
      );
      
      // Appiattisci l'array di array
      const allRecords = [].concat(...healthRecords);
      
      // Filtra solo i medicinali
      const medications = allRecords.filter(record => record.type === 'medication');
      
      // Per ogni medicinale, verifica se è necessaria una notifica
      for (const medication of medications) {
        if (!medication.endDate) continue;
        
        const endDate = parseISO(medication.endDate);
        const now = new Date();
        
        // Verifica se la data di fine è vicina
        for (const days of MEDICATION_REMINDER_DAYS) {
          const notificationKey = `medication_${medication.id}_${days}`;
          if (this.lastChecked[notificationKey]) continue;
          
          const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd === days) {
            // Ottieni il cane
            const dog = await this.getDogById(medication.dogId);
            
            // Crea la notifica
            await this.createNotification({
              type: 'medication',
              title: `Medication Ending Soon: ${medication.name}`,
              message: `${dog.name}'s ${medication.name} medication will end in ${days} ${days === 1 ? 'day' : 'days'}`,
              dogId: medication.dogId,
              relatedItemId: medication.id,
              dueDate: endDate,
              priority: 'high'
            });
            
            // Segna come inviata
            this.lastChecked[notificationKey] = true;
          }
        }
      }
    } catch (error) {
      console.error('Errore durante la verifica delle notifiche medicinali:', error);
    }
  }

  // Verifica le notifiche per gli appuntamenti veterinari
  async checkVetAppointmentNotifications() {
    try {
      // Ottieni tutti i record di salute
      const healthRecords = await Promise.all(
        (await this.getAllDogs()).map(dog => fetchHealthRecords(dog.id))
      );
      
      // Appiattisci l'array di array
      const allRecords = [].concat(...healthRecords);
      
      // Filtra solo gli appuntamenti veterinari
      const vetAppointments = allRecords.filter(record => record.type === 'vet');
      
      // Per ogni appuntamento, verifica se è necessaria una notifica
      for (const appointment of vetAppointments) {
        if (!appointment.date) continue;
        
        const appointmentDateTime = parseISO(`${appointment.date}T${appointment.time || '09:00'}`);
        const now = new Date();
        
        // Verifica se la data dell'appuntamento è vicina
        for (const days of VET_REMINDER_DAYS) {
          const notificationKey = `vet_${appointment.id}_${days}`;
          if (this.lastChecked[notificationKey]) continue;
          
          const daysUntilAppointment = Math.ceil((appointmentDateTime - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilAppointment === days) {
            // Ottieni il cane
            const dog = await this.getDogById(appointment.dogId);
            
            // Crea la notifica
            await this.createNotification({
              type: 'vet',
              title: `Vet Appointment Reminder`,
              message: `${dog.name} has a vet appointment for ${appointment.reason} in ${days} ${days === 1 ? 'day' : 'days'} at ${appointment.time || '09:00'}`,
              dogId: appointment.dogId,
              relatedItemId: appointment.id,
              dueDate: appointmentDateTime,
              priority: days <= 1 ? 'high' : 'normal'
            });
            
            // Segna come inviata
            this.lastChecked[notificationKey] = true;
          }
        }
      }
    } catch (error) {
      console.error('Errore durante la verifica delle notifiche appuntamenti veterinari:', error);
    }
  }

  // Crea una notifica nel database
  async createNotification(notificationData) {
    try {
      const notificationToSave = {
        ...notificationData,
        userId: this.userId,
        createdAt: new Date(),
        dueDate: notificationData.dueDate || null,
        isRead: false
      };
      
      // Salva la notifica nel database
      const docRef = await addDoc(collection(db, 'notifications'), notificationToSave);
      console.log('Notifica creata:', notificationToSave.title);
      
      // Mostra la notifica nel dispositivo dell'utente (se supportato)
      this.showLocalNotification(notificationToSave);
      
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione della notifica:', error);
    }
  }

  // Mostra una notifica locale sul dispositivo
  showLocalNotification(notification) {
    // Verifica se le notifiche Web sono supportate
    if ('Notification' in window) {
      // Verifica il permesso
      if (Notification.permission === 'granted') {
        // Mostra la notifica
        const localNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png'
        });
        
        // Gestisci il click sulla notifica
        localNotification.onclick = () => {
          window.focus();
          // Implementa la navigazione alla pagina corretta in base al tipo di notifica
        };
      } else if (Notification.permission !== 'denied') {
        // Richiedi il permesso
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.showLocalNotification(notification);
          }
        });
      }
    }
    
    // In alternativa, usa le capacità native se disponibili tramite Capacitor
    this.showNativeNotification(notification);
  }

  // Mostra una notifica nativa su dispositivi mobili tramite Capacitor
  async showNativeNotification(notification) {
    // Verifica se Capacitor è disponibile
    if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
      const { LocalNotifications } = window.Capacitor.Plugins;
      
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.title,
              body: notification.message,
              largeBody: notification.message,
              summaryText: 'PawTracker',
              schedule: { at: new Date() }
            }
          ]
        });
      } catch (error) {
        console.error('Errore durante la creazione della notifica nativa:', error);
      }
    }
  }

  // Registra per le notifiche push
  async registerForPushNotifications() {
    // Richiedi il permesso per le notifiche Web
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      console.log('Permesso notifiche:', permission);
    }
    
    // Implementa qui la registrazione per le notifiche push (FCM, ecc.)
  }

  // Helper per ottenere tutti i cani dell'utente
  async getAllDogs() {
    const dogsCollection = collection(db, 'dogs');
    const q = query(dogsCollection, where('userId', '==', this.userId));
    const dogsSnapshot = await getDocs(q);
    return dogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Helper per ottenere un cane tramite ID
  async getDogById(dogId) {
    const dogRef = doc(db, 'dogs', dogId);
    const dogSnapshot = await getDoc(dogRef);
    
    if (dogSnapshot.exists()) {
      return { id: dogSnapshot.id, ...dogSnapshot.data() };
    }
    
    return null;
  }
}

// Istanza singleton del NotificationManager
const notificationManager = new NotificationManager();

export default notificationManager;