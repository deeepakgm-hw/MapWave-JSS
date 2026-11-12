import React from 'react';
import { MapControlDock } from '../navigation/MapControlDock';

export function FloatingMapOverlay({
  selectedBuilding,
  onClearBuilding,
  bearing = 0,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isGpsActive,
  isGpsLoading,
  gpsLocation,
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
      {/* Top Spacer to prevent any collision with MapNavigationHeader */}
      <div className="w-full h-36 pointer-events-none" />

      {/* 1. Building Quick Floating Card (only when a building is selected) */}
      {selectedBuilding && (
        <div className="pointer-events-auto self-start max-w-[280px] w-full animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <div className="relative bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/10">
            {/* Header: Title & Status */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {selectedBuilding.shortName || selectedBuilding.name?.split('(')[0] || 'Building'}
                </h3>
                <span className="text-[10px] text-slate-400 capitalize">
                  {selectedBuilding.category || 'Academic Complex'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Selected
              </span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/10 text-[10px] text-slate-300">
              <span>{selectedBuilding.floor_count || 3} Floors Available</span>
              <span className="text-sky-400 font-semibold font-mono">
                {selectedBuilding.height_m ? `${selectedBuilding.height_m}m` : 'Mapped'}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClearBuilding}
            aria-label="Close building card"
            className="mt-1.5 w-6 h-6 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shadow-md transition-colors cursor-pointer border border-white/10"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 2. Bottom Cluster: Floating Control Dock on Lower-Right */}
      <div className="flex items-end justify-end w-full mt-auto">
        <MapControlDock
          bearing={bearing}
          onResetNorth={onResetNorth}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onLocateMe={onLocateMe}
          isGpsActive={isGpsActive}
          isGpsLoading={isGpsLoading}
        />
      </div>
    </div>
  );
}
