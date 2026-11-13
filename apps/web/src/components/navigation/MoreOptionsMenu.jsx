import React, { useState, useRef, useEffect } from 'react';

export function MoreOptionsMenu({
  onOpenLanding,
  onResetNorth,
  onToggleGps,
  isGpsActive = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More Map Options"
        title="More Options"
        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white active:bg-slate-100 text-slate-700 border border-white/85 shadow-[0_8px_25px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 p-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Campus Navigation
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenLanding?.();
              setIsOpen(false);
            }}
            className="p-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-semibold text-slate-900">INTRO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleGps?.();
              setIsOpen(false);
            }}
            className="p-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="font-medium">Live Campus GPS</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${isGpsActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
              {isGpsActive ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MoreOptionsMenu;
