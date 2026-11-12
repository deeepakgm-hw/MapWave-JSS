import React, { useState } from 'react';
import { Building3DPreview } from './Building3DPreview';
import {
  getBuildingFloorConfig,
  getFloorData,
  isFloorMapped,
  getFloorRooms,
} from '../../data/campus-map/floorRegistry';

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
  onNavigateToRoom,
  onClearRoom,
  onStartNavigation,
  onCancelRoute,
  onToggleAccessible,
  onResetToCampus,
  onOpenSearch,
  onLocateMe,
  pilotBuildings = [],
  otherFacilities = [],
}) {
  const buildingCode = selectedBuilding?.code || 'BLOCK_A';
  const floorConfig = getBuildingFloorConfig(buildingCode);
  const activeLevel = selectedFloor?.level_number || floorConfig?.defaultFloor || 2;
  const isMapped = isFloorMapped(buildingCode, activeLevel);
  const rooms = isMapped ? getFloorRooms(buildingCode, activeLevel) : [];

  const [roomFilter, setRoomFilter] = useState('ALL');

  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'ALL') return true;
    if (roomFilter === 'LAB') return (r.room_type || '').toLowerCase().includes('lab');
    if (roomFilter === 'CLASS') return (r.room_type || '').toLowerCase().includes('class');
    if (roomFilter === 'FACULTY')
      return (
        (r.room_type || '').toLowerCase().includes('faculty') ||
        (r.room_type || '').toLowerCase().includes('office')
      );
    return true;
  });

  const floors = floorConfig?.floors || [
    { id: 'floor-1', level_number: 1, name: 'First Floor', status: 'unmapped' },
    { id: 'floor-2', level_number: 2, name: 'Second Floor', status: 'available' },
    { id: 'floor-3', level_number: 3, name: 'Third Floor', status: 'unmapped' },
  ];

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
                <span className="font-semibold text-[#181a1d]">Walkable Corridor Route</span>
                <span>
                  Est. Arrival • ~{activeRoute?.estimatedMinutes || 1} min
                </span>
              </div>

              {/* Horizontal Timeline Bar */}
              <div className="relative py-2 flex items-center justify-between">
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#e5e7eb]" />
                <div className="relative z-10 flex flex-col items-start">
                  <span className="text-xs font-bold text-[#181a1d]">
                    {gpsLocation ? 'Current Spot' : 'Staircase 1'}
                  </span>
                  <span className="text-[10px] text-[#8c929d]">
                    {gpsLocation ? 'GPS Anchor' : 'Floor 2 Entry'}
                  </span>
                </div>

                <div className="relative z-10 w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                  <span className="text-xs font-bold text-[#181a1d]">
                    {destination.room_code || destination.name}
                  </span>
                  <span className="text-[10px] text-[#8c929d]">
                    Floor {destination.floor || activeLevel}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f3f4f6] text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Corridor Distance</span>
                  <div className="text-sm font-bold text-[#181a1d]">
                    {activeRoute?.total_distance_m || 50.4} meters
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Pace</span>
                  <div className="text-sm font-bold text-[#181a1d]">1.2 m/s</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c929d]">Door Checkpoint</span>
                  <div className="text-sm font-bold text-[#181a1d]">
                    {activeRoute?.destinationDoor?.name || destination.door_name || 'Verified Door'}
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Notice */}
            <div className="p-4 rounded-[20px] bg-white/70 border border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">♿</span>
                <div>
                  <div className="text-xs font-bold text-[#181a1d]">Corridor Pathway</div>
                  <div className="text-[10px] text-[#6b7280]">Walkable corridor without barrier steps</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleAccessible}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isAccessibleMode
                    ? 'bg-[#181a1d] text-white'
                    : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                }`}
              >
                {isAccessibleMode ? 'Accessible Active' : 'Standard'}
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
        ) : selectedRoom && currentState !== 'ROUTE_PREVIEW' && currentState !== 'ROUTING_ACTIVE' ? (
          /* ========================================================
              STATE C: ROOM SELECTED (INDOOR ROOM INSPECTION)
              ======================================================== */
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header: Room Name & Code Badge */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#181a1d]">
                  {selectedRoom.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309] border border-amber-200/50">
                    Room #{selectedRoom.room_code || 'ROOM'}
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    Floor {selectedRoom.floor || 2} • Academic Block A
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearRoom}
                className="w-8 h-8 rounded-full bg-white text-[#4b5563] hover:text-[#111827] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                title="Close Room View"
              >
                ✕
              </button>
            </div>

            {/* Pure White Card with Verified Room Attributes */}
            <div className="p-5 rounded-[28px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-black/[0.04] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#8c929d]">
                <span className="font-semibold text-[#181a1d]">Room Specifications</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[10px] border border-emerald-200">
                  QGIS Verified Geometry
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb]/60">
                  <div className="text-[10px] font-mono uppercase text-[#8c929d]">Category</div>
                  <div className="text-xs font-bold text-[#181a1d] capitalize mt-0.5">
                    {selectedRoom.room_type || selectedRoom.category || 'General'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb]/60">
                  <div className="text-[10px] font-mono uppercase text-[#8c929d]">Floor Level</div>
                  <div className="text-xs font-bold text-[#181a1d] mt-0.5">
                    Floor {selectedRoom.floor || 2}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb]/60 col-span-2">
                  <div className="text-[10px] font-mono uppercase text-[#8c929d]">Associated Department</div>
                  <div className="text-xs font-semibold text-[#181a1d] mt-0.5">
                    {selectedRoom.name?.includes('ISE')
                      ? 'Information Science & Engineering (ISE)'
                      : selectedRoom.name?.includes('CSE')
                      ? 'Computer Science & Engineering (CSE)'
                      : selectedRoom.name?.includes('CAD')
                      ? 'Mechanical & CAD Engineering'
                      : 'Academic Complex Department'}
                  </div>
                </div>

                {selectedRoom.door && (
                  <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb]/60 col-span-2">
                    <div className="text-[10px] font-mono uppercase text-[#8c929d]">Entrance Checkpoint</div>
                    <div className="text-xs font-semibold text-[#181a1d] mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{selectedRoom.door.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToRoom) {
                    onNavigateToRoom(selectedRoom);
                  } else {
                    onSelectRoom(selectedRoom);
                  }
                }}
                className="flex-1 py-3 px-5 rounded-full bg-[#181a1d] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px]"
              >
                <span>Navigate to this Room</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={onClearRoom}
                className="py-3 px-4 rounded-full bg-white hover:bg-white/90 text-[#4b5563] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer min-h-[44px] shadow-sm"
              >
                Floor Plan
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
              STATE A / B: ROAM MAIN DASHBOARD (BUILDING OR CAMPUS OVERVIEW)
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

            {/* Pure White Card: Available Floors & Verified QGIS Rooms */}
            <div className="p-5 rounded-[28px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-black/[0.04] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#8c929d]">
                <span className="font-semibold text-[#181a1d]">
                  {selectedBuilding ? 'Available Floors' : 'Campus Overview'}
                </span>
                <span>
                  {selectedBuilding
                    ? isMapped
                      ? `${rooms.length} Mapped Rooms`
                      : 'Survey in Progress'
                    : 'Bangalore'}
                </span>
              </div>

              {selectedBuilding ? (
                /* Floor Selector Chips inside the White Card */
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {floors.map((fl) => {
                      const lvl = fl.level_number;
                      const isSelected = activeLevel === lvl;
                      const mapped = fl.status === 'available';

                      return (
                        <button
                          key={fl.id}
                          type="button"
                          onClick={() => {
                            onSelectFloor({ id: fl.id, level_number: lvl, status: fl.status });
                          }}
                          className={`flex-1 py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-[#181a1d] text-white shadow-md'
                              : mapped
                              ? 'bg-[#f3f4f6] text-[#181a1d] hover:bg-[#e5e7eb]'
                              : 'bg-[#f9fafb] text-[#9ca3af] hover:bg-[#f3f4f6]'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>Floor</span>
                            <span>{lvl}</span>
                          </div>
                          <span className={`text-[9px] font-normal uppercase ${isSelected ? 'text-amber-300' : mapped ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {mapped ? 'Mapped' : 'Phase 2'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* If active floor is verified, show room list & category chips */}
                  {isMapped ? (
                    <div className="flex flex-col gap-2 pt-1 border-t border-[#f3f4f6]">
                      {/* Category Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                        {[
                          { id: 'ALL', label: `All (${rooms.length})` },
                          { id: 'LAB', label: 'Labs' },
                          { id: 'CLASS', label: 'Classrooms' },
                          { id: 'FACULTY', label: 'Faculty' },
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => setRoomFilter(chip.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                              roomFilter === chip.id
                                ? 'bg-[#181a1d] text-white shadow-sm'
                                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable list of verified rooms */}
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto no-scrollbar pt-1">
                        {filteredRooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => onSelectRoom(room)}
                            className="p-2.5 rounded-2xl bg-[#f8f9fa] hover:bg-[#f1f3f5] border border-[#e5e7eb]/70 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-lg bg-white border border-[#e5e7eb] text-[10px] font-mono font-bold text-[#181a1d]">
                                {room.room_code}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[#181a1d] group-hover:text-blue-600 transition-colors">
                                  {room.name}
                                </span>
                                <span className="text-[10px] text-[#6b7280] capitalize">
                                  {room.room_type}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-[#8c929d] group-hover:text-[#181a1d] transition-colors">
                              →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb] flex flex-col items-center text-center gap-1.5 my-1">
                      <span className="text-xs font-bold text-[#181a1d]">Floor {activeLevel} CAD Survey In Progress</span>
                      <p className="text-[11px] text-[#6b7280] leading-tight">
                        Floor {activeLevel} datasets will be available in Phase 2. Second Floor is currently fully mapped.
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectFloor({ id: 'floor-2', level_number: 2, status: 'available' })}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-[#181a1d] text-white text-[11px] font-bold cursor-pointer"
                      >
                        View Verified Floor 2
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Roam Exact Timeline in White Card: Main Gate ➔ Central Quad */
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
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <span className="text-white font-medium">25 Mar</span>
                  <span className="font-mono text-[11px]">11:59</span>
                  <span className="text-[#9ca3af] font-medium">16 min</span>
                  <span className="font-mono text-[11px]">12:15</span>
                </div>

                <div className="relative py-1 flex items-center justify-between">
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/20" />
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="relative z-10 px-2 py-0.5 rounded-full bg-[#2a2f35] border border-white/10 text-[10px] text-[#f59e0b] font-mono flex items-center gap-1">
                    <span>9.5 km</span>
                  </div>
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-white/90">
                  <span>Old Town</span>
                  <span className="text-white">King Street</span>
                </div>
              </div>

              {/* Roam Journey Card 2 */}
              <div
                onClick={() => onSelectBuilding(pilotBuildings[1] || pilotBuildings[0])}
                className="p-4 rounded-[24px] bg-[#1c1f24] text-white shadow-sm hover:bg-[#252a30] transition-all cursor-pointer flex flex-col gap-2.5 border border-black/10 group"
              >
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <span className="text-white font-medium">22 Mar</span>
                  <span className="font-mono text-[11px]">15:10</span>
                  <span className="text-[#9ca3af] font-medium">10 min</span>
                  <span className="font-mono text-[11px]">15:20</span>
                </div>

                <div className="relative py-1 flex items-center justify-between">
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/20" />
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="relative z-10 px-2 py-0.5 rounded-full bg-[#2a2f35] border border-white/10 text-[10px] text-[#f59e0b] font-mono flex items-center gap-1">
                    <span>4.2 km</span>
                  </div>
                  <div className="relative z-10 w-2 h-2 rounded-full bg-[#f59e0b]" />
                </div>

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
