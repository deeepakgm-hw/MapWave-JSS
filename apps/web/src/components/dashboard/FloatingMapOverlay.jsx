import React from 'react';
import { MAP_PROVIDERS } from '../../config/mapConfig';
import { APP_MODES } from '../../services/geofenceService';

export function FloatingMapOverlay({
  selectedBuilding,
  onSelectBuilding,
  onClearBuilding,
  bearing = 0,
  isTopView = false,
  onResetNorth,
  onToggleViewMode,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isGpsActive,
  isGpsLoading,
  currentProvider,
  onSwitchProvider,
  currentMode,
  isInsideCampus,
  distanceToCampusKm = 0,
  gpsLocation,
  pilotBuildings = [],
  onOpenSearch,
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 md:p-7 overflow-hidden select-none">
      {/* 1. TOP CLUSTER (ROAM EXACT BRANDING & GLASS PILLS) */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top-Left: Roam Clean Minimalist Typography */}
        <div className="pointer-events-auto flex flex-col pt-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            Roam
          </h1>
          <h2 className="text-sm md:text-base font-semibold text-white/95 mt-2.5 drop-shadow">
            Nearby now
          </h2>
          <p className="text-xs text-white/70 font-normal drop-shadow">
            19 bikes • 8 parking spots
          </p>
        </div>

        {/* Top-Center: Roam Translucent Floating Icon Capsule */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/15 shadow-2xl">
          {/* Active 1st Pill: Pure White Circle with Home */}
          <button
            type="button"
            onClick={onClearBuilding}
            title="Overview"
            className="w-8 h-8 rounded-full bg-white text-[#181a1d] flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* 2nd Icon: Stats / Analytics */}
          <button
            type="button"
            onClick={() => onSelectBuilding(pilotBuildings[0])}
            aria-label={`Zone ${pilotBuildings[0]?.code || 'A'}`}
            title="Analytics"
            className="w-8 h-8 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* 3rd Icon: Bike / Mobility */}
          <button
            type="button"
            onClick={() => onSelectBuilding(pilotBuildings[1] || pilotBuildings[0])}
            aria-label={`Zone ${pilotBuildings[1]?.code || 'B'}`}
            title="Routes"
            className="w-8 h-8 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="6" cy="18" r="3" strokeWidth={2} />
              <circle cx="18" cy="18" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18l3-8h5l2 4m-7 4l3-8" />
            </svg>
          </button>

          {/* 4th Icon: Network Nodes */}
          <button
            type="button"
            onClick={() => onSelectBuilding(pilotBuildings[2] || pilotBuildings[0])}
            aria-label={`Zone ${pilotBuildings[2]?.code || 'CIVIL'}`}
            title="Connected Nodes"
            className="w-8 h-8 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          {/* 5th Icon: Saved Star */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Saved Locations"
            className="w-8 h-8 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {/* Top-Right: Roam Circular Glass Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Filter settings button with badge "3" */}
          <button
            type="button"
            onClick={() => onSwitchProvider(currentProvider === MAP_PROVIDERS.GOOGLE ? MAP_PROVIDERS.ESRI : MAP_PROVIDERS.GOOGLE)}
            title="Map Layer Settings"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl text-white border border-white/15 flex items-center justify-center shadow-lg transition-all cursor-pointer relative"
          >
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#181a1d] text-white text-[9px] font-bold border border-white/20 flex items-center justify-center shadow">
              3
            </span>
          </button>

          {/* Share / Layer Selector */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search Places"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl text-white border border-white/15 flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. OVER-THE-MAP ROAM WAYPOINT CARD (#38 CABO JUBI STATION STYLE) */}
      {selectedBuilding && (
        <div className="pointer-events-auto self-start mt-6 max-w-[270px] w-full animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <div className="relative bg-white text-[#181a1d] rounded-[26px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-black/[0.04]">
            {/* Header: Title & Available Pill */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-[#181a1d] tracking-tight leading-snug">
                  #{selectedBuilding.code === 'BLOCK_A' ? '38 Cabo Jubi Station' : selectedBuilding.name.split('(')[0]}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fffbeb] text-[#d97706] border border-amber-200/60 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Available
              </span>
            </div>

            {/* Sub-label row */}
            <div className="flex items-center justify-between pt-3 text-[10px] text-[#8c929d] font-semibold">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span>Bikes</span>
                  <div className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-bold text-xs flex items-center gap-1">
                    <span>🚲</span>
                    <span>6</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span>Parking</span>
                  <div className="px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563] font-bold text-xs flex items-center gap-1">
                    <span>🅿</span>
                    <span>3</span>
                  </div>
                </div>
              </div>

              {/* Distance and Winding Amber Route SVG */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-bold text-[#181a1d]">300 m • 3 min</span>
                <svg className="w-14 h-4 text-[#f59e0b]" viewBox="0 0 60 16" fill="none">
                  <path
                    d="M2 12C12 12 18 4 28 4C38 4 44 12 56 12"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="56" cy="12" r="2.5" fill="#f59e0b" />
                </svg>
              </div>
            </div>
          </div>

          {/* Detached Circular Close Cross */}
          <button
            type="button"
            onClick={onClearBuilding}
            className="mt-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer border border-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 3. BOTTOM CLUSTER */}
      <div className="flex items-end justify-between w-full mt-auto">
        {/* Bottom-Left: Roam "86 m left" Translucent Dark Glass Pill */}
        <div className="pointer-events-auto flex items-center gap-2 py-2 px-3.5 bg-black/45 backdrop-blur-xl rounded-full border border-white/15 shadow-xl text-xs text-white">
          <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
          </svg>
          <span className="font-medium tracking-wide">
            86 m left
          </span>
        </div>

        {/* Bottom-Right: Roam Vertical Circular Glass Controls Stack */}
        <div className="pointer-events-auto flex flex-col gap-2.5">
          {/* Reset / Refresh */}
          <button
            type="button"
            onClick={onResetNorth}
            title="Reset North"
            className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-xl text-white/90 hover:text-white border border-white/15 flex items-center justify-center shadow-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In"
            className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-xl text-white/90 hover:text-white border border-white/15 flex items-center justify-center shadow-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-xl text-white/90 hover:text-white border border-white/15 flex items-center justify-center shadow-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>

          {/* Locate Me (Target Crosshair) */}
          <button
            type="button"
            onClick={onLocateMe}
            title="Locate Me"
            className={`w-10 h-10 rounded-full backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-xl transition-all cursor-pointer ${
              isGpsActive
                ? 'bg-[#f59e0b] text-white shadow-amber-500/30'
                : 'bg-black/45 hover:bg-black/65 text-white/90 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
