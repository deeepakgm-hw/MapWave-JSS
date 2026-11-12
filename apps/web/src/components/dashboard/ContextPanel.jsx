import React, { useState } from 'react';
import { Building3DPreview } from './Building3DPreview';

export function ContextPanel({
  selectedBuilding,
  selectedFloor,
  selectedRoom,
  destination,
  activeRoute,
  currentState,
  currentMode,
  isInsideCampus,
  distanceToCampusKm = 0,
  gpsLocation,
  isGpsActive,
  isAccessibleMode,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  onStartNavigation,
  onCancelRoute,
  onToggleAccessible,
  onResetToCampus,
  onOpenSearch,
  onLocateMe,
  pilotBuildings = [],
  otherFacilities = [],
}) {
  const [selectedFloorId, setSelectedFloorId] = useState(selectedFloor?.id || 'floor-1');

  // Active display building or fallback to first pilot building for preview
  const displayBuilding = selectedBuilding || pilotBuildings[0];

  return (
    <aside className="relative flex flex-col h-full w-full bg-[#eceeed] text-[#181a1d] shadow-2xl overflow-hidden select-none">
      {/* 1. TOP HEADER: ROAM PURE WHITE SEARCH CAPSULE + NOTIFICATION + AVATAR */}
      <div className="p-4 sm:p-5 pb-3 flex items-center gap-2.5 shrink-0">
        {/* Search Input Capsule */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search campus buildings, rooms, and departments"
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-full bg-white hover:bg-white/95 text-[#6b7280] hover:text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-[#8c929d] group-hover:text-amber-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-normal text-[#8c929d]">
              Search stations or places
            </span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[#9ca3af]">
            /
          </kbd>
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          onClick={onOpenSearch}
          title="Campus Notifications"
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 text-[#4b5563] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04] flex items-center justify-center transition-all cursor-pointer relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] font-bold flex items-center justify-center">
            5
          </span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={onLocateMe}
          title="Student Profile & GPS Status"
          className="w-10 h-10 rounded-full bg-stone-300 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-white cursor-pointer hover:scale-105 transition-transform shrink-0"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2. SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4 no-scrollbar">
        {/* ========================================================
            STATE D: ROUTING / NAVIGATION DASHBOARD
            ======================================================== */}
        {(currentState === 'ROUTE_PREVIEW' || currentState === 'ROUTING_ACTIVE') && destination ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header: Title & Amber Pill */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#181a1d]">
                  {destination.name || destination.room_code || 'Room Guidance'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309] border border-amber-200/50">
                    Route #{destination.room_code || 'WAYPOINT'}
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    {destination.building_name || selectedBuilding?.name || 'Academic Complex'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancelRoute}
                className="w-8 h-8 rounded-full bg-white text-[#4b5563] hover:text-[#111827] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                title="Cancel Route"
              >
                ✕
              </button>
            </div>

            {/* Pure White Roam Travel Metrics Card */}
            <div className="p-5 rounded-[28px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-black/[0.04] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#8c929d]">
                <span className="font-semibold text-[#181a1d]">Route Preview</span>
                <span>Est. Arrival • In ~3 mins</span>
              </div>

              {/* Horizontal Timeline Bar */}
              <div className="relative py-2 flex items-center justify-between">
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#e5e7eb]" />
                <div className="relative z-10 flex flex-col items-start">
                  <span className="text-xs font-bold text-[#181a1d]">Current Spot</span>
                  <span className="text-[10px] text-[#8c929d]">Main Walkway</span>
                </div>

                <div className="relative z-10 w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                  <span className="text-xs font-bold text-[#181a1d]">{destination.name || destination.room_code}</span>
                  <span className="text-[10px] text-[#8c929d]">Floor {destination.level_number || 1}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f3f4f6] text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Distance</span>
                  <div className="text-sm font-bold text-[#181a1d]">185 meters</div>
                </div>
                <div className="h-6 w-[1px] bg-[#e5e7eb]" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Travel Mode</span>
                  <div className="text-sm font-bold text-[#181a1d]">Walking • Paved</div>
                </div>
                <div className="h-6 w-[1px] bg-[#e5e7eb]" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Elevator</span>
                  <div className="text-sm font-bold text-[#181a1d]">Step-Free</div>
                </div>
              </div>
            </div>

            {/* Wheelchair Accessibility Switch */}
            <div className="flex items-center justify-between p-4 rounded-[22px] bg-white shadow-sm border border-black/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center text-sm">
                  ♿
                </div>
                <div>
                  <div className="text-xs font-bold text-[#181a1d]">Step-Free Accessible Route</div>
                  <div className="text-[11px] text-[#8c929d]">Use ramps & central elevator only</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAccessibleMode}
                onClick={onToggleAccessible}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  isAccessibleMode ? 'bg-[#f59e0b]' : 'bg-[#d1d5db]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isAccessibleMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onStartNavigation}
                className="flex-1 py-3 px-5 rounded-full bg-[#181a1d] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px]"
              >
                <span>Start Turn-by-Turn Navigation</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={onCancelRoute}
                className="py-3 px-4 rounded-full bg-white hover:bg-white/90 text-[#4b5563] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer min-h-[44px] shadow-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
              STATE A / B / C: ROAM MAIN DASHBOARD (BUILDING OR CAMPUS OVERVIEW)
              ======================================================== */
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Top Title & Roam Amber Badge Header */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#181a1d]">
                  {selectedBuilding ? selectedBuilding.name : 'JSSATE Campus'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309] border border-amber-200/50">
                    {selectedBuilding ? `Block #${selectedBuilding.code || 'A'}` : 'Campus #21.4Acres'}
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    {selectedBuilding ? (selectedBuilding.category || 'Academic Complex') : 'Bangalore • Karnataka'}
                  </span>
                </div>
              </div>

              {/* Three-dots Menu Button */}
              <button
                type="button"
                onClick={selectedBuilding ? onResetToCampus : onOpenSearch}
                className="w-8 h-8 rounded-full bg-white text-[#6b7280] hover:text-[#111827] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                title={selectedBuilding ? 'Return to campus overview' : 'Campus Options'}
              >
                •••
              </button>
            </div>

            {/* Central Hero Visual (3D Model / Photo) seamlessly resting on #eceeed */}
            <div className="relative rounded-[28px] overflow-hidden">
              {selectedBuilding ? (
                <Building3DPreview building={selectedBuilding} height={210} />
              ) : (
                <div className="w-full h-52 rounded-[28px] overflow-hidden relative shadow-sm border border-black/[0.04]">
                  <img
                    src="/images/block_a.png"
                    alt="Campus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-white">
                      Campus Overview • Select a building or search
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Pure White Card: Roam "Last ride" Style Component */}
            <div className="p-5 rounded-[28px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-black/[0.04] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#8c929d]">
                <span className="font-semibold text-[#181a1d]">
                  {selectedBuilding ? 'Available Floors' : 'Campus Overview'}
                </span>
                <span>{selectedBuilding ? 'Indoor Active' : '27 Mar • 12:15'}</span>
              </div>

              {selectedBuilding ? (
                /* Floor Selector Chips inside the White Card */
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].slice(0, selectedBuilding.floor_count || 3).map((lvl) => {
                      const floorId = `floor-${lvl}`;
                      const isSelected = (selectedFloor?.level_number || 1) === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setSelectedFloorId(floorId);
                            onSelectFloor({ id: floorId, level_number: lvl });
                          }}
                          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#181a1d] text-white shadow-md'
                              : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                          }`}
                        >
                          <span>Floor</span>
                          <span>{lvl}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Departments / Facilities quick row */}
                  {selectedBuilding.departments && selectedBuilding.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {selectedBuilding.departments.map((dept, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-[#f8f9fa] border border-[#e5e7eb] text-[#374151] text-[11px] font-medium"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Roam Exact Timeline in White Card: Marina ➔ Alameda */
                <div className="relative py-2 flex items-center justify-between">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] bg-[#e5e7eb]" />
                  <div className="relative z-10 flex flex-col items-start">
                    <span className="text-xs font-bold text-[#181a1d]">Main Gate</span>
                    <span className="text-[10px] text-[#8c929d]">Entry</span>
                  </div>

                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
                    </svg>
                  </div>

                  <div className="relative z-10 flex flex-col items-end">
                    <span className="text-xs font-bold text-[#181a1d]">Central Quad</span>
                    <span className="text-[10px] text-[#8c929d]">Academics</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Roam "Latest journeys" in Rich Dark Charcoal Cards */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#181a1d]">Latest journeys</span>
                  <span className="text-xs text-[#8c929d]">13</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenSearch}
                    className="w-7 h-7 rounded-full bg-white text-[#6b7280] flex items-center justify-center shadow-sm text-xs cursor-pointer"
                  >
                    🎛️
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSearch}
                    className="text-xs font-semibold text-[#181a1d] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
              </div>

              {/* Roam Journey Card 1 (Dark Charcoal #1c1f24 with Amber Node) */}
              <div
                onClick={() => onSelectBuilding(pilotBuildings[0])}
                className="p-4 rounded-[24px] bg-[#1c1f24] text-white shadow-sm hover:bg-[#252a30] transition-all cursor-pointer flex flex-col gap-2.5 border border-black/10 group"
              >
                {/* Time & Duration Row */}
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <span className="text-white font-medium">25 Mar</span>
                  <span className="font-mono text-[11px]">11:59</span>
                  <span className="text-[#9ca3af] font-medium">16 min</span>
                  <span className="font-mono text-[11px]">12:15</span>
                </div>

                {/* Timeline Track with Amber Node */}
                <div className="relative py-1 flex items-center justify-between">
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/20" />
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="relative z-10 px-2 py-0.5 rounded-full bg-[#2a2f35] border border-white/10 text-[10px] text-[#f59e0b] font-mono flex items-center gap-1">
                    <span>9.5 km</span>
                  </div>
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                </div>

                {/* Start & End Labels */}
                <div className="flex items-center justify-between text-xs font-medium text-white/90">
                  <span>Old Town</span>
                  <span className="text-white">King Street</span>
                </div>
              </div>

              {/* Roam Journey Card 2 (Dark Charcoal #1c1f24 with Amber Node) */}
              <div
                onClick={() => onSelectBuilding(pilotBuildings[1] || pilotBuildings[0])}
                className="p-4 rounded-[24px] bg-[#1c1f24] text-white shadow-sm hover:bg-[#252a30] transition-all cursor-pointer flex flex-col gap-2.5 border border-black/10 group"
              >
                {/* Time & Duration Row */}
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <span className="text-white font-medium">22 Mar</span>
                  <span className="font-mono text-[11px]">15:10</span>
                  <span className="text-[#9ca3af] font-medium">10 min</span>
                  <span className="font-mono text-[11px]">15:20</span>
                </div>

                {/* Timeline Track with Amber Node */}
                <div className="relative py-1 flex items-center justify-between">
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/20" />
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="relative z-10 px-2 py-0.5 rounded-full bg-[#2a2f35] border border-white/10 text-[10px] text-[#f59e0b] font-mono flex items-center gap-1">
                    <span>4.2 km</span>
                  </div>
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                </div>

                {/* Start & End Labels */}
                <div className="flex items-center justify-between text-xs font-medium text-white/90">
                  <span>Marina</span>
                  <span className="text-white">Alameda</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
