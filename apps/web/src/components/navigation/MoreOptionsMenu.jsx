import React, { useState, useRef, useEffect } from 'react';

export function MoreOptionsMenu({
  onOpenLanding,
  onResetNorth,
  onToggleGps,
  isGpsActive,
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
        title="More map options & settings"
        aria-label="More options"
        className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-52 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 flex flex-col gap-1 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onResetNorth?.();
              setIsOpen(false);
            }}
            className="p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm">🧭</span>
            <span>Reset North (0°)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleGps?.();
              setIsOpen(false);
            }}
            className="p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm">📍</span>
            <span>{isGpsActive ? 'Turn Off GPS Tracking' : 'Enable GPS Tracking'}</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            type="button"
            onClick={() => {
              onOpenLanding?.();
              setIsOpen(false);
            }}
            className="p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm">🏠</span>
            <span>Campus Introduction (Intro)</span>
          </button>
        </div>
      )}
    </div>
  );
}
