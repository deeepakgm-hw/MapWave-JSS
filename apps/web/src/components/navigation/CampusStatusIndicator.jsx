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
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white active:bg-white border border-white/85 backdrop-blur-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all cursor-pointer group min-h-[36px]"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isGpsLoading
              ? 'bg-sky-400 animate-ping'
              : isCampus
              ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
              : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
          }`}
        />
      </div>

      <div className="flex flex-col text-left leading-none">
        <span className="text-xs font-bold text-slate-900 tracking-tight">
          {statusLabel}
        </span>
        <span className="text-[9px] font-mono text-slate-500 tracking-normal mt-0.5">
          {detailLabel}
        </span>
      </div>
    </button>
  );
}

export default CampusStatusIndicator;
