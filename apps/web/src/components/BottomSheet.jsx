import React, { useState } from 'react';
import { GlassSurface } from './ui/GlassSurface';

/**
 * Mobile 3-Snap Bottom Sheet (<768w / <1024w)
 * Snaps:
 * - peek: 120px
 * - half: 50vh
 * - full: 90vh
 */
export function BottomSheet({ summary, onClose, children }) {
  // snap modes: 'peek' | 'half' | 'full'
  const [snap, setSnap] = useState('peek');

  const snapHeights = {
    peek: 'h-[120px]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  const cycleSnap = () => {
    if (snap === 'peek') setSnap('half');
    else if (snap === 'half') setSnap('full');
    else setSnap('peek');
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none flex justify-center p-2 sm:p-4">
      <GlassSurface
        radius="panel"
        className={`w-full max-w-xl shadow-2xl pointer-events-auto transition-all duration-240 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col border-white/20 ${snapHeights[snap]}`}
      >
        {/* Grab Handle & Header */}
        <div
          onClick={cycleSnap}
          className="pt-2.5 pb-2 px-4 flex flex-col items-center gap-1.5 border-b border-white/10 select-none cursor-pointer group shrink-0"
        >
          {/* Snap Drag Pill */}
          <div className="w-10 h-1 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />

          <div className="w-full flex items-center justify-between mt-1">
            <span className="text-xs font-semibold text-white/90 truncate">
              {summary || 'Campus Details'}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                {snap === 'peek' ? 'Peek' : snap === 'half' ? 'Half' : 'Full'}
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  title="Close"
                  aria-label="Close"
                  className="w-6 h-6 rounded-full glass-child flex items-center justify-center text-white/70 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar text-white/90">
          {children}
        </div>
      </GlassSurface>
    </div>
  );
}

export default BottomSheet;
