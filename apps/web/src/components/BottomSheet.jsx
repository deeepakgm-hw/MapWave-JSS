import React, { useState } from 'react';

export function BottomSheet({ summary, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-30 transition-all duration-300 ease-in-out ${
        isExpanded ? 'h-[65vh]' : 'h-auto'
      }`}
    >
      <div className="mx-auto max-w-2xl h-full bg-blue-950 text-white border-t-4 border-yellow-400 shadow-[0_-12px_30px_rgba(0,0,0,0.4)] rounded-t-3xl flex flex-col overflow-hidden">
        {/* Drag Handle & Stylized Header Shelf */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full pt-3 pb-3 px-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-blue-900/60 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-t-3xl min-h-[44px]"
        >
          {/* Pill Drag Indicator */}
          <div className="w-14 h-2 bg-yellow-400 rounded-full shadow-xs" />
          
          {/* One-Line Summary Badge */}
          <div className="w-full flex items-center justify-between">
            <div className="text-sm font-black text-white tracking-wide truncate flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              {summary}
            </div>
            <span className="text-yellow-300 text-xs font-extrabold pl-2 shrink-0 bg-blue-900/80 px-3 py-1 rounded-full border border-yellow-400/40">
              {isExpanded ? '▼ COLLAPSE' : '▲ DETAILS'}
            </span>
          </div>
        </button>

        {/* Scrollable Expanded Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 bg-slate-900/90 text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
