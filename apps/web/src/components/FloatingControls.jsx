import React from 'react';

export function FloatingControls({
  onLocateMe,
  onZoomIn,
  onZoomOut,
  isAccessibleMode,
  onToggleAccessible,
  geoDenied,
}) {
  return (
    <div className="absolute right-4 bottom-28 z-20 flex flex-col items-end gap-3 select-none">
      {/* Accessible Route Toggle Chip */}
      <div className="bg-blue-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-yellow-400 shadow-[0_4px_0_0_#FACC15] flex items-center gap-2.5 min-h-[44px]">
        <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5 uppercase">
          ♿ Wheelchair Mode
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAccessibleMode}
          onClick={onToggleAccessible}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 border-2 border-white focus-visible:outline-none ${
            isAccessibleMode ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
              isAccessibleMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* BitSummit-Style Pink D-Pad / Action Button Cluster */}
      <div className="bg-blue-950/90 backdrop-blur-md p-2 rounded-3xl border-2 border-yellow-400 shadow-[0_6px_0_0_#FACC15] flex flex-col gap-2 items-center">
        {/* Zoom In (+) */}
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-90 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-[0_3px_0_0_#9F1239] transition-all cursor-pointer"
        >
          +
        </button>

        {/* Zoom Out (-) */}
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-90 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-[0_3px_0_0_#9F1239] transition-all cursor-pointer"
        >
          −
        </button>

        {/* Recenter / GPS Locate Me Button */}
        <button
          type="button"
          onClick={onLocateMe}
          disabled={geoDenied}
          title={geoDenied ? 'GPS Unavailable' : 'Recenter GPS Position'}
          aria-label="Recenter my position"
          className={`w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center border-2 border-white shadow-[0_3px_0_0_#9F1239] transition-all active:scale-90 cursor-pointer ${
            geoDenied ? 'bg-slate-600 opacity-50 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'
          }`}
        >
          🎯
        </button>
      </div>
    </div>
  );
}
