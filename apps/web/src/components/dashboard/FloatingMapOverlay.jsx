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
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* 1. TOP BAR CLUSTER */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top-Left: Brand & Campus Status (Roam Style) */}
        <div className="pointer-events-auto flex flex-col gap-1 bg-stone-950/70 dark:bg-slate-950/75 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>MapWave</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30">
                PRO
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="text-white/90 font-semibold">JSS Academy of Tech</span>
            <span className="text-white/30">•</span>
            <span className="text-slate-400">21.4 Acres</span>
          </div>
        </div>

        {/* Top-Center: Roam-Style Glass Pill Navigation Cluster */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 p-1.5 bg-stone-950/75 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
          <button
            type="button"
            onClick={onClearBuilding}
            title="Campus Overview"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              !selectedBuilding
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {pilotBuildings.map((b) => {
            const isSelected = selectedBuilding?.id === b.id || selectedBuilding?.code === b.code;
            return (
              <button
                key={b.id}
                type="button"
                aria-label={`Zone ${b.code}`}
                onClick={() => onSelectBuilding(b)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span aria-hidden="true">{b.shortName || b.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Top-Right: Quick Controls & Geofence Status */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Geofence Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all ${
              isInsideCampus
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isInsideCampus ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="hidden sm:inline">
              {isInsideCampus ? 'Geofence Active' : `Outside (${distanceToCampusKm.toFixed(1)}km)`}
            </span>
          </div>

          {/* Map Provider Selector Pill */}
          <div className="flex items-center p-1 bg-stone-950/75 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => onSwitchProvider(MAP_PROVIDERS.GOOGLE)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                currentProvider === MAP_PROVIDERS.GOOGLE
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => onSwitchProvider(MAP_PROVIDERS.ESRI)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                currentProvider === MAP_PROVIDERS.ESRI
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Esri
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLOATING STATION / WAYPOINT CARD (ROAM SIGNATURE) */}
      {selectedBuilding && (
        <div className="pointer-events-auto self-start mt-4 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            {/* Close Cross */}
            <button
              type="button"
              onClick={onClearBuilding}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                {selectedBuilding.shortName || selectedBuilding.code || 'Station'}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open • Active
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white pr-6">
              {selectedBuilding.name}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {selectedBuilding.description || 'Primary campus academic complex housing lecture halls, advanced laboratories and faculty offices.'}
            </p>

            {/* Travel / Facility Stats Row */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/10 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px]">
                    🏢
                  </span>
                  <span>{selectedBuilding.floors || 3} Floors</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>•</span>
                  <span>{selectedBuilding.departments?.length || 4} Depts</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold font-mono">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>300 m • 3 min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM CLUSTER */}
      <div className="flex items-end justify-between w-full mt-auto">
        {/* Bottom-Left: Live GPS Telemetry Pill */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 px-3.5 bg-stone-950/75 backdrop-blur-xl rounded-full border border-white/10 shadow-xl text-xs text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="font-mono text-slate-300">
            {gpsLocation
              ? `GPS ±${Math.round(gpsLocation.accuracy || 8)}m`
              : 'GPS Ready'}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-emerald-400 font-semibold">
            {isInsideCampus ? 'Campus Geofence' : 'Explore Mode'}
          </span>
        </div>

        {/* Bottom-Right: Vertical Circular Glass Map Controls */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-stone-950/75 backdrop-blur-2xl p-2 rounded-full border border-white/10 shadow-2xl">
          {/* Compass / Reset North */}
          <button
            type="button"
            onClick={onResetNorth}
            title="Reset North"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-amber-400 transform transition-transform"
              style={{ transform: `rotate(${-bearing}deg)` }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="12,2 16,11 12,9 8,11" fill="#f59e0b" />
              <polygon points="12,22 16,13 12,15 8,13" fill="#ffffff" fillOpacity="0.7" />
            </svg>
          </button>

          {/* 2D / 3D Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={isTopView ? 'Switch to 3D View' : 'Switch to 2D Top View'}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            {isTopView ? '3D' : '2D'}
          </button>

          <div className="h-[1px] w-6 bg-white/10 mx-auto" />

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>

          <div className="h-[1px] w-6 bg-white/10 mx-auto" />

          {/* Locate Me (GPS Target Crosshair) */}
          <button
            type="button"
            onClick={onLocateMe}
            title={isGpsActive ? 'GPS Centered' : 'Find My Location'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isGpsActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isGpsLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
