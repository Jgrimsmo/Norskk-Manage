// src/components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <div 
        className={`loading-spinner loading-spinner-${size}`}
      />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
