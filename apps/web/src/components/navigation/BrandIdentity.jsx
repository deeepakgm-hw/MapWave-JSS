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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border border-white/85 shadow-[0_8px_25px_rgba(0,0,0,0.08)] backdrop-blur-2xl group cursor-pointer text-left focus:outline-none transition-all min-h-[40px]"
      >
        <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
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
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
            MAPWAVE
          </span>
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase leading-tight mt-0.5">
            JSSATE Bengaluru
          </span>
        </div>
      </button>

      {/* Context Breadcrumb if Building or Floor is Selected */}
      {(selectedBuilding || selectedFloor) && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-white/85 text-xs font-semibold text-slate-800 shadow-sm ml-1 truncate">
          <button
            type="button"
            onClick={onResetToCampus}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Campus
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 truncate max-w-[120px]">
            {selectedBuilding?.shortName || selectedBuilding?.name?.split('(')[0] || 'Building'}
          </span>
          {selectedFloor && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-amber-600 font-bold shrink-0">
                Floor {selectedFloor.level_number}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandIdentity;
