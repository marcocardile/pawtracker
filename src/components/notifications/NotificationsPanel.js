// src/components/notifications/NotificationsPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications, markNotificationAsRead, deleteNotification } from '../../services/notificationService';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the device is mobile/tablet
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Simple check for mobile or tablet
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Additional check for viewport width
      const isSmallViewport = window.innerWidth <= 1024; // Tablets and phones are typically <= 1024px
      
      setIsMobile(isMobileDevice || isSmallViewport);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifications();
    }
  }, [isOpen, currentUser]);

  // Handle touch events for swipe-down to close (mobile only)
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    if (touchStart && touchEnd && touchStart < touchEnd && touchEnd - touchStart > 100) {
      // Swipe down detected
      onClose();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const fetchedNotifications = await fetchNotifications(currentUser.uid);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to the relevant page based on notification type
    if (notification.type === 'vaccine' && notification.dogId) {
      navigate(`/dogs/${notification.dogId}`, { state: { activeTab: 'health' } });
    } else if (notification.type === 'vet' && notification.dogId) {
      navigate(`/dogs/${notification.dogId}`, { state: { activeTab: 'health' } });
    } else if (notification.type === 'medication' && notification.dogId) {
      navigate(`/dogs/${notification.dogId}`, { state: { activeTab: 'health' } });
    } else if (notification.type === 'activity') {
      navigate('/calendar');
    }

    // Close the panel after navigation
    onClose();
  };

  const handleDismiss = async (e, notification) => {
    e.stopPropagation(); // Prevent triggering the notification click
    try {
      await deleteNotification(notification.id);
      // Update local state
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const formatNotificationTime = (date) => {
    if (!date) return '';
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'vaccine':
        return '💉';
      case 'vet':
        return '🏥';
      case 'medication':
        return '💊';
      case 'activity':
        return '📅';
      default:
        return '🔔';
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'normal':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50">
      <div 
        className={`${isMobile 
          ? 'absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg flex flex-col max-h-[90%] h-[85%]' 
          : 'absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg flex flex-col h-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle - only shown on mobile */}
        {isMobile && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
        
        {/* Header */}
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Notifications</h2>
          <button 
            onClick={onClose} 
            className="p-2 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Close notifications"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 flex items-start cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`min-w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getPriorityColor(notification.priority)} border-l-4`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      {notification.dueDate && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Due: {formatDistanceToNow(notification.dueDate, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    onClick={(e) => handleDismiss(e, notification)}
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPanel;