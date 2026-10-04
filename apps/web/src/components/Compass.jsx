import React from 'react';

export function Compass({ bearing = 0, onResetNorth }) {
  return (
    <button
      type="button"
      onClick={onResetNorth}
      title="Reset bearing to North"
      aria-label="Compass - Reset bearing to North"
      className="relative w-14 h-14 rounded-full border border-white/60 bg-black/40 hover:bg-black/60 backdrop-blur-md shadow-xl flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer group"
    >
      {/* Cardinal Labels */}
      <span className="absolute top-1 text-[8px] font-mono font-bold text-white/70 group-hover:text-white transition-colors">
        N
      </span>
      <span className="absolute bottom-1 text-[8px] font-mono font-bold text-white/40">
        S
      </span>
      <span className="absolute right-1.5 text-[8px] font-mono font-bold text-white/40">
        E
      </span>
      <span className="absolute left-1.5 text-[8px] font-mono font-bold text-white/40">
        W
      </span>

      {/* Rotating Needle */}
      <div
        className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-200 pointer-events-none"
        style={{ transform: `rotate(${-bearing}deg)` }}
      >
        <div className="w-0.5 h-6 flex flex-col items-center justify-between">
          {/* North Needle Point (Red/Amber Accent) */}
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[9px] border-b-rose-500" />
          {/* South Needle Point (White) */}
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[9px] border-t-white/80" />
        </div>
      </div>
    </button>
  );
}
