import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerClass = `spinner-container ${size}`;
  
  return (
    <div className={spinnerClass}>
      <div className="spinner"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;