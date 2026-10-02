import React, { useState } from 'react';

export function BottomSheet({ summary, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-20 transition-all duration-300 ease-in-out ${
        isExpanded ? 'h-[65vh]' : 'h-auto'
      }`}
    >
      <div className="mx-auto max-w-lg h-full bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-3xl flex flex-col overflow-hidden">
        {/* Drag Handle & Single-Line Summary Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full pt-3 pb-3 px-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-t-3xl min-h-[44px]"
        >
          {/* Pill Drag Indicator */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          
          {/* One-Line Summary Badge */}
          <div className="w-full flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {summary}
            </div>
            <span className="text-slate-400 text-xs font-bold pl-2 shrink-0">
              {isExpanded ? '▼ Collapse' : '▲ Details'}
            </span>
          </div>
        </button>

        {/* Scrollable Expanded Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
