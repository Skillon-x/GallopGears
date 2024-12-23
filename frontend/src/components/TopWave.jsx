import React from 'react';

const TopWave = () => {
  return (
    <div className="relative w-full">
      <svg 
        viewBox="0 0 1440 240" 
        className="w-full h-32 text-accent transform scale-y-[-1]"
        preserveAspectRatio="none"
      >
        <path 
          d="M0,240L1440,240L1440,0C1252.89,-11.31,1019.2,106.87,720,104C420.8,101.13,187.11,-17.19,0,0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default TopWave;