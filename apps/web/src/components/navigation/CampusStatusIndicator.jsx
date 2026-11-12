import React from 'react';

export function CampusStatusIndicator({
  currentMode = 'CAMPUS_MODE',
  isInsideCampus = true,
  distanceToCampusKm = 0,
  isGpsActive = false,
  isGpsLoading = false,
  onToggleMode,
}) {
  const isCampus = currentMode === 'CAMPUS_MODE';

  let statusLabel = isCampus ? 'Campus Mode' : 'Explore Mode';
  let detailLabel = isCampus
    ? 'Inside Boundary'
    : distanceToCampusKm > 0
    ? `${distanceToCampusKm.toFixed(1)} km away`
    : 'Outside Campus';

  if (isGpsLoading) {
    statusLabel = 'Detecting Location';
    detailLabel = 'Validating GPS...';
  } else if (!isGpsActive && !isInsideCampus) {
    detailLabel = 'Location Inactive';
  }

  return (
    <button
      type="button"
      onClick={onToggleMode}
      aria-label={statusLabel}
      title={`Geofence Status: ${statusLabel} (${detailLabel}). Click to switch mode.`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer group ${
        isCampus
          ? 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-400/30 text-blue-200'
          : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/30 text-amber-200'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`w-2 h-2 rounded-full ${
            isGpsLoading
              ? 'bg-cyan-400 animate-ping'
              : isCampus
              ? 'bg-blue-400 shadow-sm shadow-blue-400/50'
              : 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50'
          }`}
        />
      </div>

      <div className="flex flex-col text-left leading-none">
        <span className="text-xs font-semibold text-white tracking-tight">
          {statusLabel}
        </span>
        <span className="text-[9px] font-mono text-slate-400 tracking-normal mt-0.5">
          {detailLabel}
        </span>
      </div>
    </button>
  );
}
