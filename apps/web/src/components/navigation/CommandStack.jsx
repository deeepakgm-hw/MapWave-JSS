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
  theme = 'light',
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

  const currentStyleLabel = mapStyles.find((s) => s.id === currentProvider)?.label || 'Google Ultra-HD';

  return (
    <div
      className="flex flex-col gap-2.5 w-full max-w-[430px] pointer-events-auto select-none font-sans"
      style={{ fontFamily: 'var(--font-ui)' }}
      role="region"
      aria-label="Navigation Command Stack"
    >
      {/* ROW A: Brand + Breadcrumb + Campus-Mode Pill in White Glassmorphism */}
      <div
        className="h-[54px] px-3.5 rounded-2xl bg-white/90 hover:bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5 shrink-0 transition-all"
      >
        <button
          type="button"
          onClick={onOpenIntro}
          className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
          title="Return to MapWave Intro"
        >
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          {/* Wordmark & Breadcrumb */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                MAPWAVE
              </span>
              <span className="text-[10px] font-semibold text-blue-600 tracking-wide uppercase">
                JSSATE
              </span>
            </div>
            <span className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              {selectedBuilding
                ? selectedBuilding.shortName || selectedBuilding.name.split('(')[0]
                : 'Bengaluru Campus Portal'}
            </span>
          </div>
        </button>

        {/* Dynamic Campus Mode Pill */}
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
          className="h-[32px] px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/90 transition-all cursor-pointer shrink-0 text-slate-800 shadow-sm"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isInsideCampus
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="tracking-tight font-medium text-slate-800">
            {currentMode === APP_MODES.CAMPUS_MODE ? 'Campus Mode' : 'Explore Mode'}
          </span>
        </button>
      </div>

      {/* ROW B: Search Bar (48px) with Keyboard Shortcut "/" in White Glassmorphism */}
      <div
        onClick={onOpenSearch}
        className="h-[46px] px-3.5 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 shrink-0 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0 text-slate-500 group-hover:text-slate-800 transition-colors">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="h-5 px-1.5 rounded-[6px] text-[11px] font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          /
        </kbd>
      </div>

      {/* ROW C: Controls Row with Reference White Glassmorphism Pills */}
      <div
        className="h-[44px] px-2 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-1.5 shrink-0 relative"
      >
        {/* 1. 2D / 3D Segmented Toggle */}
        <div className="flex items-center p-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => onToggleViewMode?.('top')}
            className={`h-[28px] px-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              isTopView
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode?.('3d')}
            className={`h-[28px] px-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              !isTopView
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D
          </button>
        </div>

        {/* 2. Basemap Dropdown Trigger - Matches Image 2 Reference Style */}
        <div className="relative" ref={styleMenuRef}>
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="h-[32px] px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            {/* Green pill indicator dot matching user screenshot */}
            <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] shrink-0" />
            <span className="truncate max-w-[110px] font-semibold text-slate-900">{currentStyleLabel}</span>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showStyleMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Basemap Dropdown Popover in White Glassmorphism */}
          {showStyleMenu && (
            <div className="absolute top-[40px] left-0 w-60 p-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <span className="px-2.5 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
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
                  className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    currentProvider === item.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <span className={`text-[10px] font-mono ${currentProvider === item.id ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.badge}
                  </span>
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
          className={`h-[32px] w-[32px] rounded-full flex items-center justify-center transition-all cursor-pointer border ${
            isGpsActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border-slate-200/80'
          }`}
        >
          {isGpsLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="h-[32px] w-[32px] rounded-full flex items-center justify-center bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80 text-slate-700 cursor-pointer transition-all"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: `rotate(${-bearing}deg)` }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <polygon points="12,3 16,12 12,9 8,12" fill="#ef4444" />
            <polygon points="12,21 16,12 12,15 8,12" fill="#94a3b8" />
          </svg>
        </button>

        {/* 5. Overflow / Intro Menu */}
        <div className="relative" ref={overflowMenuRef}>
          <button
            type="button"
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            title="More Options"
            className="h-[32px] w-[32px] rounded-full flex items-center justify-center bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80 text-slate-700 cursor-pointer transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </button>

          {showOverflowMenu && (
            <div className="absolute top-[40px] right-0 w-52 p-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  onToggleTheme?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
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
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
              >
                <span>8px Grid Audit</span>
                <span className={`text-[10px] font-mono ${isGridAudit ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isGridAudit ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenIntro?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>INTRO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAdmin?.();
                  setShowOverflowMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <span>Admin Console</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ROW D: Selected-Building Card */}
      {selectedBuilding && (
        <div
          className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 border-l-4 border-l-blue-600"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                {selectedBuilding.shortName || selectedBuilding.name.split('(')[0]}
              </h3>
              <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                {selectedBuilding.category || 'Academic Complex'} •{' '}
                {selectedBuilding.code || 'Mapped Building'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearBuilding}
              title="Close building view"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer shrink-0 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>{selectedBuilding.floor_count || 3} Floors Available</span>
            <span
              className="text-blue-600 font-semibold"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {selectedBuilding.height_m ? `${selectedBuilding.height_m}m Height` : '3D Mapped'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommandStack;
