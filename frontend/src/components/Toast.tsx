import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: '5px',
    color: 'white',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'opacity 0.5s ease-in-out',
  };

  const typeStyles = {
    success: { backgroundColor: '#4CAF50' }, // Green
    error: { backgroundColor: '#f44336' },   // Red
    info: { backgroundColor: '#2196F3' },    // Blue
  };

  return (
    <div style={{ ...baseStyle, ...typeStyles[type] }}>
      {message}
      <button 
        onClick={onClose} 
        style={{ marginLeft: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;
