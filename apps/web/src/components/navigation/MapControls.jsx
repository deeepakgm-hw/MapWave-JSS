import React from 'react';
import { GlassSurface } from '../ui/GlassSurface';

/**
 * Bottom-Right Floating Map Controls Dock
 * Vertical pill with 44px touch targets.
 * Animates right offset dynamically so it never sits underneath DetailPanel.
 */
export function MapControls({
  bearing = 0,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isGpsActive = false,
  isGpsLoading = false,
  isPanelOpen = true,
  bottomOffset = null,
  style = {},
  className = '',
}) {
  return (
    <div
      className={`fixed z-20 pointer-events-auto select-none transition-all duration-240 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        bottomOffset != null ? '' : 'bottom-4'
      } ${
        isPanelOpen
          ? 'right-4 lg:right-[432px] xl:right-[440px]'
          : 'right-4 xl:right-6'
      } ${className}`}
      style={{
        ...(bottomOffset != null ? { bottom: typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset } : {}),
        ...style,
      }}
      role="toolbar"
      aria-label="Map Navigation Controls"
    >
      <GlassSurface
        radius="pill"
        className="p-1.5 flex flex-col items-center gap-1.5 shadow-2xl border-white/20"
      >
        {/* Zoom In */}
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-11 h-11 rounded-full glass-child flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v12m6-6H6" />
          </svg>
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-11 h-11 rounded-full glass-child flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 12H6" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-white/15 my-0.5" />

        {/* Compass / Reset North */}
        <button
          type="button"
          onClick={onResetNorth}
          title="Reset Bearing to True North"
          aria-label="Reset North"
          className="w-11 h-11 rounded-full glass-child flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-95 relative"
        >
          <div
            className="w-5 h-5 transition-transform duration-300 flex items-center justify-center"
            style={{ transform: `rotate(${-bearing}deg)` }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <polygon points="12,2 18,20 12,16 6,20" fill="#EF4444" />
              <polygon points="12,16 18,20 12,22 6,20" fill="#94A3B8" />
            </svg>
          </div>
        </button>

        {/* Locate Me */}
        <button
          type="button"
          onClick={onLocateMe}
          title={isGpsActive ? 'Recenter GPS' : 'Locate Position'}
          aria-label="Locate Position"
          className={`w-11 h-11 rounded-full glass-child flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            isGpsActive ? 'text-blue-400 border-blue-400/50' : 'text-white/80 hover:text-white'
          }`}
        >
          {isGpsLoading ? (
            <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2.2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          )}
        </button>
      </GlassSurface>
    </div>
  );
}

export default MapControls;
