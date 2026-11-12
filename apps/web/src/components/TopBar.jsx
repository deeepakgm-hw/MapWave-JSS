import React, { useState } from 'react';
import { MAP_PROVIDERS } from '../config/mapConfig';

export function TopBar({
  state,
  onBack,
  onOpenSearch,
  onOpenLanding,
  bearing = 0,
  onResetNorth,
  isTopView = false,
  onSetViewMode,
  currentProvider = MAP_PROVIDERS.GOOGLE,
  onSwitchProvider,
  isGpsActive = false,
  isGpsLoading = false,
  onToggleGps,
  onLocateMe,
  currentMode = 'CAMPUS_MODE',
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onToggleMode,
}) {
  const { selectedBuilding, selectedFloor, gpsLocation } = state;
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  return (
    <div className="absolute top-4 inset-x-4 z-30 flex items-start justify-between pointer-events-none select-none">
      {/* Top-Left: MapWave Minimal Brand & Search Floating Cluster in White Glassmorphism */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pointer-events-auto">
        {/* Brand Pill */}
        <button
          type="button"
          onClick={onOpenLanding}
          title="Return to MapWave Introduction"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 hover:bg-white/95 text-slate-800 backdrop-blur-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer text-left group active:scale-95 min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-slate-900 group-hover:text-blue-600 transition-colors">
              MapWave
            </div>
            <div className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              JSSATE Bangalore
            </div>
          </div>
        </button>

        {/* Clean Minimal Search Input Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search campus buildings, rooms, and departments"
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/85 hover:bg-white/95 text-slate-600 hover:text-slate-900 backdrop-blur-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer min-h-[44px] group"
        >
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium tracking-wide">
            Search buildings, rooms, labs...
          </span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/80">
            /
          </kbd>
        </button>

        {/* Minimal Breadcrumb Capsule (if a building or floor is selected) */}
        {(selectedBuilding || selectedFloor) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-800 backdrop-blur-2xl border border-white/80 text-xs font-medium shadow-sm">
            <button
              type="button"
              onClick={() => onBack('OVERVIEW')}
              className="hover:text-blue-600 cursor-pointer"
            >
              Campus
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">
              {selectedBuilding?.name || 'Building'}
            </span>
            {selectedFloor && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-amber-600 font-semibold">
                  Floor {selectedFloor.level_number}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top-Right: View Mode, GPS, Satellite Provider & Intro Cluster in White Glassmorphism */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Automatic Geofence Status Badge (CAMPUS_MODE vs EXPLORE_MODE) */}
        <button
          type="button"
          onClick={onToggleMode}
          title={`Geofencing: ${currentMode === 'CAMPUS_MODE' ? 'Campus Mode (3D models & indoor navigation active)' : 'Explore Mode (Outdoor GPS active)'}. Click to switch.`}
          className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl backdrop-blur-2xl border shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer min-h-[44px] ${
            currentMode === 'CAMPUS_MODE'
              ? 'bg-white/85 hover:bg-white/95 border-blue-400/40 text-blue-900'
              : 'bg-white/85 hover:bg-white/95 border-amber-400/50 text-amber-900'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentMode === 'CAMPUS_MODE' ? 'bg-blue-600' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5 text-slate-900">
              <span>{currentMode === 'CAMPUS_MODE' ? 'Campus Mode' : 'Explore Mode'}</span>
            </span>
            <span className="text-[9px] text-slate-500 leading-tight">
              {currentMode === 'CAMPUS_MODE'
                ? 'Inside Boundary'
                : `${distanceToCampusKm.toFixed(1)} km to Campus`}
            </span>
          </div>
        </button>

        {/* Real-time GPS Toggle / Locate Me Capsule */}
        <button
          type="button"
          onClick={onToggleGps || onLocateMe}
          title={
            isGpsActive
              ? `Live GPS Active (±${Math.round(gpsLocation?.accuracy || 10)}m) - Click to center on your position`
              : 'Turn on GPS to find where you are right now'
          }
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl backdrop-blur-2xl border shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer min-h-[44px] ${
            isGpsLoading
              ? 'bg-blue-50/90 border-blue-300 text-blue-900 animate-pulse'
              : isGpsActive
              ? 'bg-white/85 hover:bg-white/95 border-emerald-400/50 text-emerald-900'
              : 'bg-white/85 hover:bg-white/95 border-white/80 text-slate-700 hover:text-slate-900'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {isGpsActive && (
              <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500 opacity-60 animate-ping" />
            )}
            <svg
              className={`w-4 h-4 ${
                isGpsActive
                  ? 'text-emerald-600'
                  : isGpsLoading
                  ? 'text-blue-600 animate-spin'
                  : 'text-slate-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5 text-slate-900">
              <span>{isGpsLoading ? 'Locating...' : isGpsActive ? 'GPS ON' : 'Turn on GPS'}</span>
              {isGpsActive && gpsLocation && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 border border-emerald-300/60 font-semibold">
                  ±{Math.round(gpsLocation.accuracy || 8)}m
                </span>
              )}
            </span>
            <span className="text-[9px] text-slate-500 leading-tight">
              {isGpsActive ? 'Click to Recenter' : 'Find where you are'}
            </span>
          </div>
        </button>

        {/* 2D Top View / 3D Cross View Toggle */}
        {onSetViewMode && (
          <div className="flex items-center bg-white/85 backdrop-blur-2xl border border-white/80 rounded-2xl p-1 shadow-[0_8px_25px_rgba(0,0,0,0.08)] min-h-[44px]">
            <button
              type="button"
              onClick={() => onSetViewMode('top')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isTopView
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
              title="Switch to Top View (Flat 2D Overhead 0°)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>Top View</span>
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                !isTopView
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
              title="Switch to 3D Cross View (Tilted Perspective 45°)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>3D View</span>
            </button>
          </div>
        )}

        {/* Imagery Provider Dropdown Trigger */}
        {onSwitchProvider && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/85 hover:bg-white/95 text-slate-800 backdrop-blur-2xl border border-white/80 text-xs font-semibold tracking-wide shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all min-h-[44px] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50" />
              <span>
                {currentProvider === MAP_PROVIDERS.TOPO
                  ? '3D Interactive'
                  : currentProvider === MAP_PROVIDERS.GOOGLE
                  ? 'Google Ultra-HD'
                  : currentProvider === MAP_PROVIDERS.ESRI
                  ? 'Esri 30cm HD'
                  : 'MapTiler'}
              </span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProviderMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1 w-64 z-50 text-slate-800">
                {/* GPS Quick Switcher inside Provider Menu */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 mb-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isGpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-900">Live GPS Tracker</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleGps?.();
                        setShowProviderMenu(false);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isGpsActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isGpsActive ? 'ON' : 'Turn ON'}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isGpsActive && gpsLocation
                      ? `${gpsLocation.latitude.toFixed(4)}°N, ${gpsLocation.longitude.toFixed(4)}°E (±${Math.round(gpsLocation.accuracy)}m)`
                      : 'Locates and tracks where you are now'}
                  </div>
                </div>

                <div className="px-2 py-0.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Map & 3D View Engine
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchProvider(MAP_PROVIDERS.TOPO);
                    setShowProviderMenu(false);
                  }}
                  className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentProvider === MAP_PROVIDERS.TOPO
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>3D Interactive Map</span>
                      <span className="text-[9px] font-mono uppercase bg-amber-400 text-black px-1 rounded font-bold">3D GLB</span>
                    </div>
                    <div className="text-[10px] opacity-70">Interactive TopoExport 3D model</div>
                  </div>
                  {currentProvider === MAP_PROVIDERS.TOPO && <span>✓</span>}
                </button>

                <div className="my-1 border-t border-slate-200" />
                <div className="px-2.5 py-0.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Satellite HD Providers
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchProvider(MAP_PROVIDERS.GOOGLE);
                    setShowProviderMenu(false);
                  }}
                  className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentProvider === MAP_PROVIDERS.GOOGLE
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Google Ultra-HD</div>
                    <div className="text-[10px] opacity-70">Razor-sharp sub-meter (Clean)</div>
                  </div>
                  {currentProvider === MAP_PROVIDERS.GOOGLE && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchProvider(MAP_PROVIDERS.ESRI);
                    setShowProviderMenu(false);
                  }}
                  className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentProvider === MAP_PROVIDERS.ESRI
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Esri World Imagery</div>
                    <div className="text-[10px] opacity-70">30cm Maxar aerial (Clean)</div>
                  </div>
                  {currentProvider === MAP_PROVIDERS.ESRI && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchProvider(MAP_PROVIDERS.MAPTILER);
                    setShowProviderMenu(false);
                  }}
                  className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentProvider === MAP_PROVIDERS.MAPTILER
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold">MapTiler Satellite</div>
                    <div className="text-[10px] opacity-70">Clean satellite imagery</div>
                  </div>
                  {currentProvider === MAP_PROVIDERS.MAPTILER && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Intro / Return Button */}
        <button
          type="button"
          onClick={onOpenLanding}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/85 hover:bg-white/95 text-slate-800 backdrop-blur-2xl border border-white/80 text-xs font-semibold tracking-wider uppercase shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all min-h-[44px] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Intro</span>
        </button>
      </div>
    </div>
  );
}
