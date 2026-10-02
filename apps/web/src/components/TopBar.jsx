import React from 'react';
import { NAV_STATES } from '../lib/navigationState';

export function TopBar({ state, onBack, onOpenSearch }) {
  const { currentState, selectedBuilding, selectedFloor } = state;

  const renderBreadcrumb = () => {
    const items = [{ label: 'Campus', level: NAV_STATES.OVERVIEW }];

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
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-semibold overflow-x-auto no-scrollbar">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-slate-400 select-none">/</span>}
              <button
                type="button"
                onClick={() => {
                  if (!isLast) {
                    onBack(item.level);
                  }
                }}
                disabled={isLast}
                className={`min-h-[44px] px-2 py-1.5 rounded-lg flex items-center transition-colors ${
                  isLast
                    ? 'text-slate-900 font-bold bg-slate-100 cursor-default'
                    : 'text-blue-700 hover:bg-blue-50 cursor-pointer underline-offset-4 hover:underline'
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-sm z-30 shrink-0">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
          N
        </div>
        <div>
          {renderBreadcrumb()}
        </div>
      </div>

      {/* Action Buttons: Room Search Shortcut */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search rooms and occupants"
          className="min-h-[44px] min-w-[44px] px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 rounded-xl flex items-center gap-2 font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-95"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Search Rooms</span>
        </button>
      </div>
    </header>
  );
}
