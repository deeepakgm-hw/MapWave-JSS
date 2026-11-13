import React from 'react';

export function ViewModeToggle({ isTopView = false, onSetViewMode }) {
  if (!onSetViewMode) return null;

  return (
    <div
      role="group"
      aria-label="Map View Mode"
      className="flex items-center p-0.5 rounded-full bg-white/90 backdrop-blur-2xl border border-white/85 shadow-[0_8px_25px_rgba(0,0,0,0.08)] shrink-0 min-h-[36px]"
    >
      <button
        type="button"
        onClick={() => onSetViewMode('top')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
          isTopView
            ? 'bg-blue-600 text-white shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
        }`}
        title="2D Overhead Orthographic View (0° pitch)"
      >
        <span>2D</span>
      </button>

      <button
        type="button"
        onClick={() => onSetViewMode('3d')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
          !isTopView
            ? 'bg-blue-600 text-white shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
        }`}
        title="3D Tilted Perspective View (45° pitch)"
      >
        <span>3D</span>
      </button>
    </div>
  );
}

export default ViewModeToggle;
