import React from 'react';

export function GlobalMapSearch({ onOpenSearch }) {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      aria-label="Search buildings, rooms, labs and facilities"
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white active:bg-white text-slate-700 border border-white/85 shadow-[0_8px_25px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-200 cursor-pointer group min-h-[44px]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-xs font-normal text-slate-600 group-hover:text-slate-900 transition-colors truncate">
          Search buildings, rooms, labs and facilities...
        </span>
      </div>

      <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80 shrink-0">
        /
      </kbd>
    </button>
  );
}

export default GlobalMapSearch;
