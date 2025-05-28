import React, { useState, useEffect } from 'react';

const NotificationBanner = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  isVisible = false 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      onClose();
    }
  };

  if (!show || !message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: '✓',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: '✕',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: '⚠',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 transition-all duration-300 transform ${
      show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    }`}>
      <div className={`${styles.bg} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start">
          <div className={`${styles.iconBg} rounded-full p-1 mr-3 flex-shrink-0`}>
            <span className={`${styles.text} text-sm font-medium`}>
              {styles.icon}
            </span>
          </div>
          <div className="flex-1">
            <p className={`${styles.text} text-sm font-medium`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${styles.text} hover:opacity-70 ml-2 flex-shrink-0`}
            aria-label="Close notification"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({
      show: true,
      message,
      type,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};

export default NotificationBanner;