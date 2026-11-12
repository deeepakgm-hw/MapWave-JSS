import React from 'react';
import { GlassSurface } from '../ui/GlassSurface';
import { APP_MODES } from '../../services/geofenceService';

/**
 * Mobile-First Top Navigation Bar (Compact 48px height)
 * Features:
 * - Brand mark + Breadcrumb Chip (Campus / Selected Building / Floor)
 * - Geofence status indicator (Inside Campus / Outside Geofence)
 * - Theme toggle (Light/Dark)
 * - Notification bell with badge & Profile avatar
 * - Truncates cleanly with ellipsis; never wraps
 * - Safe area top inset awareness: top: calc(var(--safe-t, 0px) + 12px)
 */
export function TopBar({
  selectedBuilding,
  selectedFloor,
  currentMode = APP_MODES.CAMPUS_MODE,
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onSwitchMode,
  theme = 'dark',
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
      <GlassSurface
        radius="card"
        className="h-[48px] px-3 flex items-center justify-between gap-2 shadow-xl border-white/15"
      >
        {/* Left: Brand Icon + Breadcrumb Chip */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-[10px] bg-blue-600/30 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          {/* Breadcrumb Chip */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-white tracking-tight shrink-0 hidden sm:inline">
              MAPWAVE
            </span>
            <span className="text-white/30 text-xs hidden sm:inline">•</span>
            <div
              className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/90 truncate max-w-[140px] sm:max-w-[200px]"
              title={breadcrumb}
            >
              {breadcrumb}
            </div>
          </div>
        </div>

        {/* Right: Geofence Chip + Theme + Notification + Avatar */}
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
            className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer tap-feedback bg-white/10 hover:bg-white/15 border-white/15"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentMode === APP_MODES.CAMPUS_MODE
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-white/90 text-xs tracking-tight whitespace-nowrap">
              {currentMode === APP_MODES.CAMPUS_MODE ? 'Campus Mode' : 'Explore Mode'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer tap-feedback bg-white/10 border border-white/10"
          >
            <span className="text-xs">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* Notification Button */}
          <button
            type="button"
            onClick={onOpenNotifications || onOpenSearch}
            title="Notifications"
            aria-label="Notifications"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer tap-feedback bg-white/10 border border-white/10 relative"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          {/* Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
            title="JSSATE Student"
          >
            JS
          </div>
        </div>
      </GlassSurface>
    </header>
  );
}

export default TopBar;
