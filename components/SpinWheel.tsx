import React, { useState, useRef } from 'react';

interface SpinWheelProps {
  onSpinEnd: (result: string) => void;
  isSpinning: boolean;
}

const segments = [
  "Premium Card", "Platinum Card", "Gold Card", "3 More Chances",
  "Bad Luck", "Try Again", "Mystery", "Bad Luck"
];

const colors = [
  "#F5C451", // Gold
  "#1A2B6D", // Royal Blue
  "#3A2B84", // Accent Purple
  "#0E1221", // Surface
  "#050814", // Main
  "#1A2B6D", // Royal Blue
  "#F5C451", // Gold
  "#050814"  // Main
];

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinEnd, isSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning) return;
    
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalSpins = 6; 
    const newRotation = rotation + (totalSpins * 360) + extraDegrees;
    
    setRotation(newRotation);

    setTimeout(() => {
      const normalizedDegrees = newRotation % 360;
      const segmentDegrees = 360 / segments.length;
      const index = Math.floor((360 - normalizedDegrees) / segmentDegrees) % segments.length;
      onSpinEnd(segments[index]);
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Needle */}
      <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[35px] border-t-white drop-shadow-lg"></div>
        <div className="w-3 h-3 gold-bg rounded-full -mt-2 border-2 border-[var(--bg-main)]"></div>
      </div>
      
      {/* Wheel Container */}
      <div 
        ref={wheelRef}
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)'
        }}
        className="w-80 h-80 md:w-[450px] md:h-[450px] rounded-full border-8 border-white/5 shadow-2xl relative overflow-hidden bg-[var(--bg-surface)]"
      >
        {segments.map((label, i) => {
          const deg = (360 / segments.length);
          return (
            <div 
              key={i}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transform: `rotate(${i * deg}deg)`,
                backgroundColor: colors[i],
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 42%)'
              }}
            >
              <div 
                className="absolute top-12 md:top-24 left-1/2 -translate-x-1/2 -rotate-[67deg] text-[9px] md:text-[11px] font-black text-center w-28 leading-tight pointer-events-none text-white drop-shadow-md"
                style={{ transformOrigin: 'center bottom' }}
              >
                {label.toUpperCase()}
              </div>
            </div>
          );
        })}
        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[var(--bg-main)] rounded-full border-4 border-white/5 flex items-center justify-center z-20 shadow-inner">
          <div className="w-5 h-5 gold-bg rounded-full animate-pulse"></div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        className={`mt-12 btn-primary px-16 py-5 text-base ${
          isSpinning ? 'opacity-50 cursor-not-allowed grayscale' : ''
        }`}
      >
        {isSpinning ? 'ROLLING FORTUNE...' : 'SPIN NOW'}
      </button>
    </div>
  );
};

export default SpinWheel;