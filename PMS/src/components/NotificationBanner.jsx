import { useEffect } from 'react';

export default function NotificationBanner({ message, type = 'info', onClose, duration = 4000 }) {
  // Auto close after duration
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  // Colors for different types
  const colors = {
    success: 'bg-green-100 text-green-800 border-green-400',
    error: 'bg-red-100 text-red-800 border-red-400',
    info: 'bg-blue-100 text-blue-800 border-blue-400',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 border-l-4 p-4 rounded shadow-md z-50 max-w-md w-full
        ${colors[type] || colors.info}`}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="ml-4 font-bold text-xl leading-none focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
