import React from 'react';

export function FloatingControls({
  onLocateMe,
  isAccessibleMode,
  onToggleAccessible,
  geoDenied,
}) {
  return (
    <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-3 items-end">
      {/* Accessible Route Toggle Switch */}
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2.5 min-h-[44px]">
        <span className="text-xs font-bold text-slate-700 select-none flex items-center gap-1.5">
          ♿ Accessible
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAccessibleMode}
          onClick={onToggleAccessible}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
            isAccessibleMode ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              isAccessibleMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Locate Me Floating Action Button */}
      <button
        type="button"
        onClick={onLocateMe}
        disabled={geoDenied}
        title={geoDenied ? 'GPS Unavailable' : 'Recenter map on GPS location'}
        aria-label="Locate my position"
        className={`min-h-[44px] min-w-[44px] p-3 rounded-2xl shadow-xl border backdrop-blur-md flex items-center justify-center font-semibold text-sm transition-all active:scale-90 ${
          geoDenied
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white/95 text-blue-900 hover:bg-blue-50 border-slate-200/80 hover:border-blue-300'
        }`}
      >
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
        </svg>
      </button>
    </div>
  );
}
