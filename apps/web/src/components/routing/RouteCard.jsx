import React from 'react';
import { GlassSurface } from '../ui/GlassSurface';

/**
 * Apple-Maps/Linear-grade Route Card Component
 * Features:
 * - Animated progress track with current node filled
 * - 3-column stat row (ETA, distance, pace)
 * - Accessibility chip (step-free, elevator priority, ramp access)
 * - Action buttons
 */
export function RouteCard({
  destination,
  origin = 'Current Location',
  etaMinutes = 3,
  distanceMeters = 85,
  paceMinutesPerKm = 12,
  checkpoints = ['Entrance Gate', 'Staircase A', 'Destination Room'],
  currentStepIndex = 1,
  isAccessible = false,
  onToggleAccessible,
  onStartNavigation,
  onCancelRoute,
  className = '',
}) {
  const destinationName =
    destination?.name || destination?.room_code || 'Selected Destination';

  return (
    <GlassSurface
      radius="card"
      className={`p-4 flex flex-col gap-3.5 select-none ${className}`}
      role="region"
      aria-label="Route Information Card"
    >
      {/* Header: Destination & Origin */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" />
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {destinationName}
            </h4>
          </div>
          <p className="text-[11px] text-white/60 truncate mt-0.5">
            From: <span className="text-white/80 font-medium">{origin}</span>
          </p>
        </div>

        {/* Accessibility Toggle Chip */}
        <button
          type="button"
          aria-label="Toggle Step-free Accessible Route"
          onClick={onToggleAccessible}
          title={isAccessible ? 'Accessible Route Active (Elevators & Ramps)' : 'Toggle Step-free Accessible Route'}
          className={`h-7 px-2.5 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer glass-child ${
            isAccessible
              ? 'bg-blue-600/30 text-blue-300 border-blue-400/40'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span>♿</span>
          <span>{isAccessible ? 'Step-Free' : 'Standard'}</span>
        </button>
      </div>

      {/* 3-Column Telemetry Stat Row */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-[12px] bg-black/25 border border-white/10 text-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
            Est. Time
          </span>
          <span className="text-sm font-bold text-white tracking-tight mt-0.5">
            {etaMinutes} <span className="text-[10px] font-normal text-white/60">min</span>
          </span>
        </div>
        <div className="flex flex-col border-x border-white/10 px-1">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
            Distance
          </span>
          <span
            className="text-sm font-bold text-amber-400 tracking-tight mt-0.5"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {distanceMeters} <span className="text-[10px] font-normal text-white/60">m</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
            Walk Pace
          </span>
          <span className="text-sm font-bold text-white tracking-tight mt-0.5">
            {paceMinutesPerKm} <span className="text-[10px] font-normal text-white/60">m/k</span>
          </span>
        </div>
      </div>

      {/* Progress Track with Node Fill */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/50 uppercase tracking-wider">
          <span>Route Waypoints</span>
          <span>Step {currentStepIndex + 1} of {checkpoints.length}</span>
        </div>

        <div className="relative flex items-center justify-between px-2 py-1.5">
          {/* Track Line */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/15 z-0" />
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-amber-400 z-0 transition-all duration-300"
            style={{
              width: `${(currentStepIndex / Math.max(checkpoints.length - 1, 1)) * 90}%`,
            }}
          />

          {checkpoints.map((point, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={point}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
                title={point}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-amber-400 ring-4 ring-amber-400/25 scale-110'
                      : isCompleted
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                      : 'bg-white/20 border border-white/40'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[9px] text-white/60 truncate max-w-[70px] mt-1 font-medium">
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary & Secondary Action CTAs */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onStartNavigation}
          className="w-full h-[52px] rounded-[16px] bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.985]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span>Start Turn-by-Turn Navigation</span>
        </button>

        {onCancelRoute && (
          <button
            type="button"
            onClick={onCancelRoute}
            className="w-full h-[40px] rounded-[12px] text-white/70 hover:text-white glass-child text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel Route
          </button>
        )}
      </div>
    </GlassSurface>
  );
}

export default RouteCard;
