import React from 'react';

export function RoutePreviewCard({
  destination,
  isAccessibleMode,
  errorMessage,
  onStartNavigation,
  onBack,
}) {
  const routeSummary = {
    distance_m: 185,
    duration_min: 3,
    floors: 2,
    steps: [
      'Walk along Central Walkway towards Block C (50m)',
      'Enter Block C Main Entrance',
      isAccessibleMode ? 'Take Elevator to Floor 2' : 'Take Stairs to Floor 2',
      `Arrive at ${destination?.name || destination?.room_code || 'Destination'}`,
    ],
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-white">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Route Unavailable</span>
        </div>
        <p className="text-xs text-rose-200/90 leading-relaxed">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] w-full py-2 bg-rose-900/60 hover:bg-rose-900 text-white rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors"
        >
          Select Another Destination
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Route Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-blue-400 uppercase">
            Destination
          </span>
          <h3 className="text-sm font-bold text-white truncate">
            {destination?.name || destination?.room_code || 'Selected Room'}
          </h3>
          <p className="text-[11px] text-white/50">
            {destination?.room_code} {destination?.building_name && `• ${destination.building_name}`}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base font-bold text-emerald-400">
            {routeSummary.duration_min} min
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            {routeSummary.distance_m}m walk
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-2 text-xs font-medium text-white/80">
        <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-[11px]">
          {routeSummary.distance_m} meters
        </span>
        <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-[11px]">
          {routeSummary.floors} Floors
        </span>
        {isAccessibleMode && (
          <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="4.5" r="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v7l4 3m-4-3l-4 3m4-7H7" />
            </svg>
            Elevator Route
          </span>
        )}
      </div>

      {/* Step Preview */}
      <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-blue-500/60 max-h-32 overflow-y-auto">
        {routeSummary.steps.map((step, idx) => (
          <div key={idx} className="text-xs text-white/70 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* Start Navigation Action Button */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onStartNavigation}
          className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Turn-by-Turn Navigation</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
