import React from 'react';

const BottomWave = () => {
  return (
    <div className="relative w-full">
      <svg 
        viewBox="0 0 1440 240" 
        className="w-full h-32 text-accent"
        preserveAspectRatio="none"
      >
        <path 
          d="M0,0L1440,0L1440,240C1252.89,251.31,1019.2,133.13,720,136C420.8,138.87,187.11,257.19,0,240Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default BottomWave;