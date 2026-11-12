import React from 'react';

export function FloatingMapOverlay({
  selectedBuilding,
  onClearBuilding,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isGpsActive,
  gpsLocation,
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 md:p-6 overflow-hidden select-none">
      {/* Top Spacer (keeps space for TopBar, avoids any text collision) */}
      <div className="w-full h-16" />

      {/* 1. OVER-THE-MAP WAYPOINT CARD (#38 CABO JUBI STATION STYLE) */}
      {selectedBuilding && (
        <div className="pointer-events-auto self-start mt-2 max-w-[280px] w-full animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <div className="relative bg-white/95 backdrop-blur-2xl text-[#181a1d] rounded-[26px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/80">
            {/* Header: Title & Available Pill */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-[#181a1d] tracking-tight leading-snug">
                  #{selectedBuilding.code === 'BLOCK_A' ? '38 Cabo Jubi Station' : selectedBuilding.name.split('(')[0]}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fffbeb] text-[#d97706] border border-amber-200/60 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Available
              </span>
            </div>

            {/* Sub-label row */}
            <div className="flex items-center justify-between pt-3 text-[10px] text-[#8c929d] font-semibold">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span>Bikes</span>
                  <div className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-bold text-xs flex items-center gap-1">
                    <span>🚲</span>
                    <span>6</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span>Parking</span>
                  <div className="px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563] font-bold text-xs flex items-center gap-1">
                    <span>🅿</span>
                    <span>3</span>
                  </div>
                </div>
              </div>

              {/* Distance and Winding Amber Route SVG */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-bold text-[#181a1d]">300 m • 3 min</span>
                <svg className="w-14 h-4 text-[#f59e0b]" viewBox="0 0 60 16" fill="none">
                  <path
                    d="M2 12C12 12 18 4 28 4C38 4 44 12 56 12"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="56" cy="12" r="2.5" fill="#f59e0b" />
                </svg>
              </div>
            </div>
          </div>

          {/* Attached Circular Close Cross in White Glassmorphism */}
          <button
            type="button"
            onClick={onClearBuilding}
            className="mt-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md transition-colors cursor-pointer border border-white/80"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 2. BOTTOM CLUSTER IN WHITE GLASSMORPHISM */}
      <div className="flex items-end justify-between w-full mt-auto">
        {/* Bottom-Left: White Glass Telemetry Pill ("86 m left") */}
        <div className="pointer-events-auto flex items-center gap-2 py-2 px-3.5 bg-white/85 hover:bg-white/95 text-slate-800 backdrop-blur-2xl rounded-full border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.1)] text-xs font-semibold">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
          </svg>
          <span>
            {gpsLocation ? `GPS ±${Math.round(gpsLocation.accuracy || 8)}m` : '86 m left'}
          </span>
        </div>

        {/* Bottom-Right: Vertical Circular Glass Controls Stack in White Glassmorphism */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-white/80 backdrop-blur-2xl p-1.5 rounded-full border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {/* Reset / North */}
          <button
            type="button"
            onClick={onResetNorth}
            title="Reset North"
            className="w-10 h-10 rounded-full hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In"
            className="w-10 h-10 rounded-full hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-full hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>

          {/* Locate Me (Target Crosshair) */}
          <button
            type="button"
            onClick={onLocateMe}
            title="Locate Me"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isGpsActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
