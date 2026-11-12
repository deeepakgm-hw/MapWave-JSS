import React from 'react';

export function ViewModeToggle({ isTopView = false, onSetViewMode }) {
  if (!onSetViewMode) return null;

  return (
    <div
      role="group"
      aria-label="Map View Mode"
      className="flex items-center p-0.5 rounded-xl bg-white/[0.08] border border-white/10 shrink-0"
    >
      <button
        type="button"
        onClick={() => onSetViewMode('top')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
          isTopView
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="2D Overhead Orthographic View (0° pitch)"
      >
        <span>2D</span>
      </button>

      <button
        type="button"
        onClick={() => onSetViewMode('3d')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
          !isTopView
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="3D Tilted Perspective View (45° pitch)"
      >
        <span>3D</span>
      </button>
    </div>
  );
}
