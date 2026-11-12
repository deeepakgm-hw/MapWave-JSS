import React, { useRef, useEffect, useState } from 'react';
import { GlassSurface } from '../ui/GlassSurface';
import { MAP_PROVIDERS } from '../../config/mapConfig';
import { APP_MODES } from '../../services/geofenceService';

export function CommandStack({
  selectedBuilding,
  onClearBuilding,
  currentMode = APP_MODES.CAMPUS_MODE,
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onSwitchMode,
  isTopView = false,
  onToggleViewMode,
  currentProvider = MAP_PROVIDERS.GOOGLE,
  onSwitchProvider,
  onLocateMe,
  isGpsActive = false,
  isGpsLoading = false,
  bearing = 0,
  onResetNorth,
  onOpenSearch,
  onOpenAdmin,
  onOpenIntro,
  theme = 'dark',
  onToggleTheme,
  isGridAudit = false,
  onToggleGridAudit,
}) {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const styleMenuRef = useRef(null);
  const overflowMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target)) {
        setShowStyleMenu(false);
      }
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target)) {
        setShowOverflowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        onOpenSearch?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const mapStyles = [
    { id: MAP_PROVIDERS.GOOGLE, label: 'Google Ultra-HD', badge: 'Satellite' },
    { id: MAP_PROVIDERS.ESRI, label: 'Esri World Imagery', badge: 'HD Satellite' },
    { id: MAP_PROVIDERS.MAPLIBRE, label: 'MapLibre Maps', badge: 'OSM Standard' },
    { id: MAP_PROVIDERS.MAPTILER, label: 'MapTiler Satellite', badge: 'Vector/Raster' },
    { id: MAP_PROVIDERS.TOPO, label: 'Campus 3D Models', badge: 'Interactive 3D' },
  ];

  const currentStyleLabel = mapStyles.find((s) => s.id === currentProvider)?.label || 'Map Style';

  return (
    <div
      className="flex flex-col gap-3 w-full max-w-[420px] pointer-events-auto select-none font-sans"
      style={{ fontFamily: 'var(--font-ui)' }}
      role="region"
      aria-label="Navigation Command Stack"
    >
      {/* ROW A: Brand + Breadcrumb + Campus-Mode Chip (56px) */}
      <GlassSurface
        radius="card"
        className="h-[56px] px-3.5 flex items-center justify-between gap-2.5 shrink-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-[10px] bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          {/* Wordmark & Breadcrumb */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] font-bold tracking-tight text-white dark:text-white">
                MAPWAVE
              </span>
              <span className="text-[10px] font-medium text-blue-400/90 tracking-wide uppercase">
                JSSATE
              </span>
            </div>
            <span className="text-[11px] text-white/60 truncate mt-0.5 font-medium">
              {selectedBuilding
                ? selectedBuilding.shortName || selectedBuilding.name.split('(')[0]
                : 'Bengaluru Campus Portal'}
            </span>
          </div>
        </div>

        {/* Dynamic Campus Mode Chip */}
        <button
          type="button"
          onClick={() => {
            const nextMode =
              currentMode === APP_MODES.CAMPUS_MODE
                ? APP_MODES.EXPLORE_MODE
                : APP_MODES.CAMPUS_MODE;
            onSwitchMode?.(nextMode);
          }}
          title={isInsideCampus ? 'Inside authoritative campus geofence' : 'Outside campus perimeter'}
          className="h-[30px] px-2.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold border transition-all glass-child cursor-pointer shrink-0"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isInsideCampus
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="tracking-tight text-white/90">
            {currentMode === APP_MODES.CAMPUS_MODE ? 'Campus Mode' : 'Explore Mode'}
          </span>
        </button>
      </GlassSurface>

      {/* ROW B: Search Bar (48px) with Keyboard Shortcut "/" */}
      <GlassSurface
        radius="card"
        onClick={onOpenSearch}
        className="h-[48px] px-3.5 flex items-center justify-between gap-3 shrink-0 cursor-pointer hover:border-white/25 transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0 text-white/60 group-hover:text-white/80 transition-colors">
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-[13px] font-normal truncate">
            Search buildings, rooms, labs and facilities...
          </span>
        </div>
        <kbd
          className="h-5 px-1.5 rounded-[6px] text-[11px] font-mono font-medium text-white/60 bg-white/10 border border-white/15 flex items-center justify-center shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          /
        </kbd>
      </GlassSurface>

      {/* ROW C: Controls Row (40px) */}
      <GlassSurface
        radius="control"
        className="h-[40px] px-1.5 flex items-center justify-between gap-1.5 shrink-0 relative"
      >
        {/* 1. 2D / 3D Segmented Toggle */}
        <div className="flex items-center p-0.5 rounded-[10px] bg-black/20 border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => onToggleViewMode?.('top')}
            className={`h-[30px] px-2.5 rounded-[8px] text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
              isTopView
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode?.('3d')}
            className={`h-[30px] px-2.5 rounded-[8px] text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
              !isTopView
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            3D
          </button>
        </div>

        {/* 2. Basemap Dropdown Trigger */}
        <div className="relative" ref={styleMenuRef}>
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="h-[30px] px-2.5 rounded-[10px] text-[11px] font-medium text-white/80 hover:text-white flex items-center gap-1.5 glass-child cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="truncate max-w-[90px]">{currentStyleLabel}</span>
            <svg
              className={`w-3 h-3 text-white/50 transition-transform ${showStyleMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Basemap Dropdown Popover */}
          {showStyleMenu && (
            <div className="absolute top-[38px] left-0 w-56 p-1.5 rounded-[16px] glass-surface shadow-2xl z-50 flex flex-col gap-1 border border-white/15 animate-in fade-in zoom-in-95 duration-150">
              <span className="px-2.5 py-1 text-[10px] font-mono text-white/50 uppercase tracking-wider">
                Imagery Providers
              </span>
              {mapStyles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSwitchProvider?.(item.id);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-[10px] text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    currentProvider === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px] opacity-70 font-mono">{item.badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Locate Me Button */}
        <button
          type="button"
          onClick={onLocateMe}
          title={isGpsActive ? 'Recenter GPS Location' : 'Locate My Position'}
          className={`h-[30px] w-[30px] rounded-[10px] flex items-center justify-center transition-all cursor-pointer glass-child ${
            isGpsActive ? 'text-blue-400 border-blue-400/40' : 'text-white/70 hover:text-white'
          }`}
        >
          {isGpsLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          )}
        </button>

        {/* 4. Compass Reset Button */}
        <button
          type="button"
          onClick={onResetNorth}
          title="Reset North Bearing"
          className="h-[30px] w-[30px] rounded-[10px] flex items-center justify-center text-white/70 hover:text-white glass-child cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: `rotate(${-bearing}deg)` }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="currentColor" strokeWidth="1" />
          </svg>
        </button>

        {/* 5. Overflow / Theme Toggle Menu */}
        <div className="relative" ref={overflowMenuRef}>
          <button
            type="button"
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            title="More Options"
            className="h-[30px] w-[30px] rounded-[10px] flex items-center justify-center text-white/70 hover:text-white glass-child cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </button>

          {showOverflowMenu && (
            <div className="absolute top-[38px] right-0 w-48 p-1.5 rounded-[16px] glass-surface shadow-2xl z-50 flex flex-col gap-1 border border-white/15 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  onToggleTheme?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-left text-xs font-medium text-white/80 hover:bg-white/10 flex items-center justify-between cursor-pointer"
              >
                <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
                <span className="text-xs">{theme === 'light' ? '☀️' : '🌙'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleGridAudit?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-left text-xs font-medium text-white/80 hover:bg-white/10 flex items-center justify-between cursor-pointer"
              >
                <span>8px Grid Audit</span>
                <span className={`text-[10px] font-mono ${isGridAudit ? 'text-emerald-400' : 'text-white/40'}`}>
                  {isGridAudit ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenIntro?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-left text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
              >
                <span>Intro Screen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAdmin?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-left text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
              >
                <span>Admin Console</span>
              </button>
            </div>
          )}
        </div>
      </GlassSurface>

      {/* ROW D: Selected-Building Card (Flows BELOW the stack in the same column flow) */}
      {selectedBuilding && (
        <GlassSurface
          radius="card"
          className="p-3.5 flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 border-l-4 border-l-blue-500"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                {selectedBuilding.shortName || selectedBuilding.name.split('(')[0]}
              </h3>
              <p className="text-[11px] text-white/60 capitalize mt-0.5">
                {selectedBuilding.category || 'Academic Complex'} •{' '}
                {selectedBuilding.code || 'Mapped Building'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearBuilding}
              title="Close building view"
              className="w-6 h-6 rounded-full glass-child flex items-center justify-center text-white/60 hover:text-white cursor-pointer shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-white/70">
            <span>{selectedBuilding.floor_count || 3} Floors Available</span>
            <span
              className="text-blue-400 font-semibold"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {selectedBuilding.height_m ? `${selectedBuilding.height_m}m Height` : '3D Mapped'}
            </span>
          </div>
        </GlassSurface>
      )}
    </div>
  );
}

export default CommandStack;
