import React from 'react';
import { NAV_STATES } from '../lib/navigationState';

export function TopBar({ state, onBack, onOpenSearch, onOpenLanding }) {
  const { selectedBuilding, selectedFloor } = state;

  const renderBreadcrumb = () => {
    const items = [{ label: 'Campus Overview', level: NAV_STATES.OVERVIEW }];

    if (selectedBuilding) {
      items.push({
        label: selectedBuilding.name || `Building ${selectedBuilding.id}`,
        level: NAV_STATES.BUILDING_FLOORS,
      });
    }

    if (selectedFloor) {
      items.push({
        label: `Floor ${selectedFloor.level_number}`,
        level: NAV_STATES.FLOOR_VIEW,
      });
    }

    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-yellow-300 font-black text-sm select-none">▸</span>}
              <button
                type="button"
                onClick={() => {
                  if (!isLast) {
                    onBack(item.level);
                  }
                }}
                disabled={isLast}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  isLast
                    ? 'bg-yellow-400 text-blue-950 border-2 border-yellow-300 shadow-sm cursor-default'
                    : 'bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700 hover:border-yellow-400 cursor-pointer'
                }`}
              >
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-b-4 border-yellow-400 px-4 py-3 flex items-center justify-between shadow-xl z-30 shrink-0">
      {/* MapWave - JSSATE Branding Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenLanding}
          title="Return to MapWave Landing Page"
          className="flex items-center gap-2 bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-yellow-400 rounded-2xl px-3 py-1.5 shadow-[0_4px_0_0_#FACC15] hover:scale-105 transition-transform cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-blue-950 font-black text-xl shadow-inner">
            🌊
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              MapWave - JSSATE
            </h1>
            <p className="text-[10px] font-extrabold text-yellow-300 tracking-wider">
              3D INTERACTIVE SATELLITE NAVIGATOR
            </p>
          </div>
        </button>

        {/* Breadcrumb Navigation */}
        <div className="hidden md:block">
          {renderBreadcrumb()}
        </div>
      </div>

      {/* Action Buttons: Landing Return & Room Search */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenLanding}
          className="min-h-[44px] px-3 py-2 bg-blue-900/80 hover:bg-blue-800 text-yellow-300 border-2 border-yellow-400/60 rounded-2xl hidden sm:flex items-center gap-1.5 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>🏠 INTRO</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search rooms and occupants"
          className="min-h-[44px] px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white border-2 border-white rounded-2xl flex items-center gap-2 font-black text-xs sm:text-sm shadow-[0_4px_0_0_#9F1239] transition-all active:scale-95"
        >
          <svg className="w-4 h-4 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">SEARCH ROOMS</span>
        </button>
      </div>
    </header>
  );
}
