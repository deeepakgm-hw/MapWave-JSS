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
}) {
  return (
    <div className="absolute right-5 bottom-8 z-20 flex flex-col items-center gap-3 select-none pointer-events-auto">
      {/* Floating Compass Widget from Reference Site */}
      <Compass bearing={bearing} onResetNorth={onResetNorth} />

      {/* Accessible Route Toggle Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-xl min-h-[44px]">
        <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="4.5" r="2.5" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v7l4 3m-4-3l-4 3m4-7H7" />
        </svg>
        <button
          type="button"
          role="switch"
          aria-checked={isAccessibleMode}
          onClick={onToggleAccessible}
          title="Toggle wheelchair accessible elevators and ramps"
          className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 border border-white/30 focus-visible:outline-none cursor-pointer ${
            isAccessibleMode ? 'bg-blue-600' : 'bg-white/20'
          }`}
        >
          <span
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
              isAccessibleMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Floating Zoom & GPS Action Cluster */}
      <div className="flex flex-col rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden divide-y divide-white/10">
        {/* 2D Top View / 3D Cross View Toggle Button */}
        {onToggleViewMode && (
          <button
            type="button"
            onClick={onToggleViewMode}
            title={isTopView ? 'Switch to 3D Cross View (Tilt 45°)' : 'Switch to Top View (Flat 2D 0°)'}
            aria-label="Toggle Top View and 3D View"
            className="w-11 h-11 flex items-center justify-center font-bold text-xs tracking-wider text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
          className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
          className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
          title={geoDenied ? 'GPS Unavailable' : 'Locate my position'}
          aria-label="Locate my position"
          className={`w-11 h-11 flex items-center justify-center transition-colors cursor-pointer ${
            geoDenied
              ? 'text-white/20 cursor-not-allowed'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
