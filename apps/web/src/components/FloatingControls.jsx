import React from 'react';
import { Compass } from './Compass';

export function FloatingControls({
  onLocateMe,
  onZoomIn,
  onZoomOut,
  isAccessibleMode,
  onToggleAccessible,
  geoDenied,
  bearing = 0,
  onResetNorth,
  isTopView = false,
  onToggleViewMode,
  isGpsActive = false,
}) {
  return (
    <div className="absolute right-5 bottom-8 z-20 flex flex-col items-center gap-3 select-none pointer-events-auto">
      {/* Floating Compass Widget */}
      <Compass bearing={bearing} onResetNorth={onResetNorth} />

      {/* Accessible Route Toggle Pill in White Glassmorphism */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 text-slate-800 backdrop-blur-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.1)] min-h-[44px]">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="4.5" r="2.5" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v7l4 3m-4-3l-4 3m4-7H7" />
        </svg>
        <button
          type="button"
          role="switch"
          aria-checked={isAccessibleMode}
          onClick={onToggleAccessible}
          title="Toggle wheelchair accessible elevators and ramps"
          className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 border border-slate-300 focus-visible:outline-none cursor-pointer ${
            isAccessibleMode ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
              isAccessibleMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Floating Zoom & GPS Action Cluster in White Glassmorphism */}
      <div className="flex flex-col rounded-2xl bg-white/85 text-slate-700 backdrop-blur-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-slate-100">
        {/* 2D Top View / 3D Cross View Toggle Button */}
        {onToggleViewMode && (
          <button
            type="button"
            onClick={onToggleViewMode}
            title={isTopView ? 'Switch to 3D Cross View (Tilt 45°)' : 'Switch to Top View (Flat 2D 0°)'}
            aria-label="Toggle Top View and 3D View"
            className="w-11 h-11 flex items-center justify-center font-bold text-xs tracking-wider text-slate-800 hover:bg-slate-100/60 transition-colors cursor-pointer"
          >
            {isTopView ? '3D' : '2D'}
          </button>
        )}

        {/* Zoom In */}
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-11 h-11 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-11 h-11 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>

        {/* Recenter / GPS Locate Me */}
        <button
          type="button"
          onClick={onLocateMe}
          disabled={geoDenied}
          title={geoDenied ? 'GPS Unavailable' : isGpsActive ? 'Locate my real-time position' : 'Turn on GPS & locate me'}
          aria-label="Locate my position"
          className={`w-11 h-11 flex items-center justify-center transition-all cursor-pointer relative ${
            geoDenied
              ? 'text-slate-300 cursor-not-allowed'
              : isGpsActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          {isGpsActive && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
