import React, { useState } from 'react';

export function BottomSheet({ summary, onClose, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none flex justify-center p-3 sm:p-5">
      <div
        className={`w-full max-w-xl bg-slate-950/95 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto transition-all duration-300 ease-in-out flex flex-col ${
          isExpanded ? 'max-h-[75vh]' : 'max-h-[35vh] sm:max-h-[28vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-white/10 select-none">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left flex-1 min-h-[44px] cursor-pointer group"
          >
            <div className="w-8 h-1 bg-white/30 rounded-full group-hover:bg-white/60 transition-colors" />
            <div className="text-xs font-semibold tracking-wide text-white/90 truncate">
              {summary}
            </div>
          </button>

          <div className="flex items-center gap-2 pl-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
              className="text-[11px] font-mono tracking-wider uppercase text-white/50 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Details'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
