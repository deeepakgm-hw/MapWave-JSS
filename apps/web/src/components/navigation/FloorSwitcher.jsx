import React from 'react';
import { GlassSurface } from '../ui/GlassSurface';

/**
 * Bottom-Left Floor Switcher & Telemetry Strip
 * Features:
 * - Vertical pill with sliding active indicator
 * - Scale bar & coordinate telemetry in Geist Mono 12px
 */
export function FloorSwitcher({
  currentFloor = 2,
  floors = [3, 2, 1], // Displayed top-to-bottom
  onSelectFloor,
  coordinates = [77.5057, 12.9015], // [lng, lat]
  zoom = 18,
  bottomOffset = null,
  style = {},
  className = '',
}) {
  const activeIndex = floors.indexOf(currentFloor);

  // Approximate meters per pixel scale calculation at current zoom and latitude
  const lat = coordinates[1] || 12.9015;
  const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  const scaleDistanceMeters = Math.round(metersPerPixel * 40); // 40px width bar

  return (
    <div
      className={`fixed left-4 xl:left-6 z-20 pointer-events-auto flex flex-col items-start gap-2 select-none font-sans transition-all duration-240 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        bottomOffset != null ? '' : 'bottom-4 xl:bottom-6'
      } ${className}`}
      style={{
        ...(bottomOffset != null ? { bottom: typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset } : {}),
        ...style,
      }}
      role="region"
      aria-label="Floor Switcher and Map Telemetry"
    >
      {/* 1. Vertical Floor Switcher Pill */}
      <GlassSurface
        radius="pill"
        className="p-1 flex flex-col items-center gap-1 relative shadow-xl border-white/20"
      >
        {floors.map((fl) => {
          const isActive = currentFloor === fl;
          return (
            <button
              key={fl}
              type="button"
              onClick={() => onSelectFloor?.(fl)}
              title={`Switch to Floor ${fl}`}
              aria-label={`Floor ${fl}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer relative z-10 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              F{fl}
            </button>
          );
        })}
      </GlassSurface>

      {/* 2. Scale Bar & Coordinate Telemetry */}
      <GlassSurface
        radius="control"
        className="px-2.5 py-1.5 flex flex-col gap-1 shadow-lg border-white/15"
      >
        {/* Scale Bar */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-1 border-b-2 border-x-2 border-white/70" />
          <span
            className="text-[11px] font-mono text-white/80 font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {scaleDistanceMeters > 0 ? `${scaleDistanceMeters}m` : '25m'}
          </span>
        </div>

        {/* Coordinates */}
        <div
          className="text-[11px] font-mono text-white/60 tracking-tighter"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {lat.toFixed(4)}°N, {(coordinates[0] || 77.5057).toFixed(4)}°E
        </div>
      </GlassSurface>
    </div>
  );
}

export default FloorSwitcher;
