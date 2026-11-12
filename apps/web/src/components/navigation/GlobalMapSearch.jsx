import React from 'react';

export function GlobalMapSearch({ onOpenSearch }) {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      aria-label="Search buildings, rooms, labs and facilities"
      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] active:bg-white/[0.15] text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer shadow-inner group min-h-[42px]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0"
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
        <span className="text-xs font-normal text-slate-300 group-hover:text-white transition-colors truncate">
          Search buildings, rooms, labs and facilities...
        </span>
      </div>

      <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 shrink-0">
        /
      </kbd>
    </button>
  );
}
