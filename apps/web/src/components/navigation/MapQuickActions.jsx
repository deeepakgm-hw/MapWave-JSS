import React from 'react';
import { ViewModeToggle } from './ViewModeToggle';
import { MapStyleSelector } from './MapStyleSelector';
import { MoreOptionsMenu } from './MoreOptionsMenu';

export function MapQuickActions({
  isTopView = false,
  onSetViewMode,
  currentProvider,
  onSwitchProvider,
  bearing = 0,
  onResetNorth,
  onLocateMe,
  isGpsActive,
  isGpsLoading,
  onToggleGps,
  onOpenLanding,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap pt-0.5">
      {/* Left: View Mode Toggle (2D/3D) and Map Style Selector */}
      <div className="flex items-center gap-2">
        <ViewModeToggle isTopView={isTopView} onSetViewMode={onSetViewMode} />
        <MapStyleSelector currentProvider={currentProvider} onSwitchProvider={onSwitchProvider} />
      </div>

      {/* Right: Quick Map Tools (Locate Me, Compass, More Menu) */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Compact Locate Me Button */}
        <button
          type="button"
          onClick={onLocateMe}
          title={isGpsActive ? 'Center on Current GPS Location' : 'Locate Me'}
          aria-label="Locate me"
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
            isGpsActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white/90 hover:bg-white text-slate-700 border-white/85'
          }`}
        >
          {isGpsLoading ? (
            <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          )}
        </button>

        {/* Compact Compass Button */}
        <button
          type="button"
          onClick={onResetNorth}
          title="Reset map orientation to North (0°)"
          aria-label="Reset North"
          className="w-9 h-9 rounded-full bg-white/90 hover:bg-white active:bg-slate-100 text-slate-700 border border-white/85 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: `rotate(${-bearing}deg)` }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <polygon points="12,3 16,12 12,9 8,12" fill="#ef4444" />
            <polygon points="12,21 16,12 12,15 8,12" fill="#94a3b8" />
          </svg>
        </button>

        {/* More Options Overflow Menu */}
        <MoreOptionsMenu
          onOpenLanding={onOpenLanding}
          onResetNorth={onResetNorth}
          onToggleGps={onToggleGps}
          isGpsActive={isGpsActive}
        />
      </div>
    </div>
  );
}

export default MapQuickActions;
