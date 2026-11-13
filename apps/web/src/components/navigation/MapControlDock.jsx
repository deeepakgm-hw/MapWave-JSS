import React from 'react';

export function MapControlDock({
  bearing = 0,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isGpsActive = false,
  isGpsLoading = false,
}) {
  return (
    <aside
      aria-label="Map Navigation Dock"
      className="pointer-events-auto flex flex-col gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/85 shadow-[0_12px_32px_rgba(0,0,0,0.1)] text-slate-700"
    >
      {/* 1. Compass / Reset North */}
      <button
        type="button"
        onClick={onResetNorth}
        title="Reset Map Orientation to North (0°)"
        aria-label="Reset North"
        className="w-9 h-9 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg
          className="w-4 h-4 transition-transform duration-300"
          style={{ transform: `rotate(${-bearing}deg)` }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <polygon points="12,3 16,12 12,9 8,12" fill="#ef4444" />
          <polygon points="12,21 16,12 12,15 8,12" fill="#94a3b8" />
        </svg>
      </button>

      {/* 2. Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom in"
        className="w-9 h-9 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v12m6-6H6" />
        </svg>
      </button>

      {/* 3. Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom out"
        className="w-9 h-9 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 12H6" />
        </svg>
      </button>

      <div className="w-full h-px bg-slate-200/80 my-0.5" />

      {/* 4. Locate Me */}
      <button
        type="button"
        onClick={onLocateMe}
        title={isGpsActive ? 'Center on Current GPS Location' : 'Locate Me'}
        aria-label="Locate me"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isGpsActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
            : 'hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900'
        }`}
      >
        {isGpsLoading ? (
          <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
          </svg>
        )}
      </button>
    </aside>
  );
}

export default MapControlDock;
