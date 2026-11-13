import React from 'react';
import { APP_MODES } from '../../services/geofenceService';

/**
 * Mobile-First Top Navigation Bar (Compact 48px height)
 * Features:
 * - Brand mark + Breadcrumb Chip (Campus / Selected Building / Floor)
 * - Geofence status indicator (Inside Campus / Outside Geofence)
 * - White-Themed Glassmorphic Styling with Apple-Maps Polish
 * - Truncates cleanly with ellipsis; never wraps
 */
export function TopBar({
  selectedBuilding,
  selectedFloor,
  currentMode = APP_MODES.CAMPUS_MODE,
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onSwitchMode,
  theme = 'light',
  onToggleTheme,
  onOpenNotifications,
  onOpenSearch,
  className = '',
}) {
  const buildingLabel = selectedBuilding
    ? selectedBuilding.shortName || selectedBuilding.name.split('(')[0]
    : 'Campus';
  const floorLabel = selectedFloor ? `F${selectedFloor.level_number}` : null;
  const breadcrumb = floorLabel ? `${buildingLabel} • ${floorLabel}` : buildingLabel;

  return (
    <header
      className={`fixed z-20 pointer-events-auto select-none font-sans ${className}`}
      style={{
        top: 'calc(var(--safe-t, 0px) + 12px)',
        left: 'calc(var(--safe-l, 0px) + 12px)',
        right: 'calc(var(--safe-r, 0px) + 12px)',
        zIndex: 'var(--z-controls, 20)',
        fontFamily: 'var(--font-ui)',
      }}
      role="banner"
    >
      <div
        className="h-[48px] px-3 rounded-2xl bg-white/90 hover:bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 transition-all"
      >
        {/* Left: Brand Icon + Breadcrumb Chip */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          {/* Breadcrumb Chip */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-900 tracking-tight shrink-0 hidden sm:inline">
              MAPWAVE
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">•</span>
            <div
              className="px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]"
              title={breadcrumb}
            >
              {breadcrumb}
            </div>
          </div>
        </div>

        {/* Right: Geofence Chip + Theme + Search / Notification */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Geofence Status Chip */}
          <button
            type="button"
            onClick={() => {
              const nextMode =
                currentMode === APP_MODES.CAMPUS_MODE
                  ? APP_MODES.EXPLORE_MODE
                  : APP_MODES.CAMPUS_MODE;
              onSwitchMode?.(nextMode);
            }}
            title={
              currentMode === APP_MODES.CAMPUS_MODE
                ? 'Inside Authoritative Campus Geofence'
                : `Outside Campus (${distanceToCampusKm.toFixed(1)} km)`
            }
            className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer tap-feedback bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-800"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentMode === APP_MODES.CAMPUS_MODE
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-slate-800 text-xs tracking-tight whitespace-nowrap font-medium">
              {currentMode === APP_MODES.CAMPUS_MODE ? 'Campus Mode' : 'Explore Mode'}
            </span>
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search campus"
            aria-label="Search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer tap-feedback bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/40 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
            title="JSSATE Student"
          >
            JS
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
