import React from 'react';

export function BrandIdentity({
  selectedBuilding,
  selectedFloor,
  onResetToCampus,
  onOpenLanding,
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {/* Brand Icon & Wordmark */}
      <button
        type="button"
        onClick={onOpenLanding}
        title="Return to MapWave Introduction"
        className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-extrabold tracking-wider uppercase text-white group-hover:text-sky-400 transition-colors leading-none">
            MAPWAVE
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-tight mt-0.5">
            JSSATE Bengaluru
          </span>
        </div>
      </button>

      {/* Context Breadcrumb if Building or Floor is Selected */}
      {(selectedBuilding || selectedFloor) && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-medium text-slate-300 ml-1 truncate">
          <button
            type="button"
            onClick={onResetToCampus}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Campus
          </button>
          <span className="text-slate-500">/</span>
          <span className="font-semibold text-white truncate max-w-[120px]">
            {selectedBuilding?.shortName || selectedBuilding?.name?.split('(')[0] || 'Building'}
          </span>
          {selectedFloor && (
            <>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400 font-semibold shrink-0">
                Floor {selectedFloor.level_number}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
