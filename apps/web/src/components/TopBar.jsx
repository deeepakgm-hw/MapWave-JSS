import React from 'react';

export function TopBar({
  state,
  onBack,
  onOpenSearch,
  onOpenLanding,
  bearing = 0,
  onResetNorth,
}) {
  const { selectedBuilding, selectedFloor } = state;

  return (
    <div className="absolute top-4 inset-x-4 z-20 flex items-start justify-between pointer-events-none select-none">
      {/* Top-Left: MapWave Minimal Brand & Search Floating Cluster */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pointer-events-auto">
        {/* Brand Pill */}
        <button
          type="button"
          onClick={onOpenLanding}
          title="Return to MapWave Introduction"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 cursor-pointer text-left group active:scale-95 min-h-[44px]"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-white group-hover:text-blue-300 transition-colors">
              MapWave
            </div>
            <div className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
              JSSATE Bangalore
            </div>
          </div>
        </button>

        {/* Clean Minimal Search Input Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search campus buildings, rooms, and departments"
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 cursor-pointer min-h-[44px]"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium tracking-wide">
            Search buildings, rooms, labs...
          </span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 border border-white/10">
            /
          </kbd>
        </button>

        {/* Minimal Breadcrumb Capsule (if a building or floor is selected) */}
        {(selectedBuilding || selectedFloor) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 text-white/90 backdrop-blur-md border border-white/20 text-xs font-medium">
            <button
              type="button"
              onClick={() => onBack('OVERVIEW')}
              className="hover:text-blue-300 cursor-pointer"
            >
              Campus
            </button>
            <span className="text-white/40">/</span>
            <span className="font-semibold text-white">
              {selectedBuilding?.name || 'Building'}
            </span>
            {selectedFloor && (
              <>
                <span className="text-white/40">/</span>
                <span className="text-amber-300 font-semibold">
                  Floor {selectedFloor.level_number}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top-Right: Return Intro & Compass */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenLanding}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/50 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/20 text-xs font-medium tracking-wider uppercase shadow-xl transition-all min-h-[44px] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Intro</span>
        </button>
      </div>
    </div>
  );
}
