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
  distanceToCampusKm,
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
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedFloorId, setSelectedFloorId] = useState(selectedFloor?.id || 'floor-1');

  // Filter facilities based on category pill
  const filteredBuildings = pilotBuildings.concat(otherFacilities).filter((b) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'ACADEMIC') return b.category === 'Academic' || b.name.includes('Block');
    if (activeCategory === 'LIBRARY') return b.code === 'BLOCK_B' || b.name.includes('Library');
    if (activeCategory === 'AMENITIES') return b.name.includes('Cafeteria') || b.category === 'Amenities';
    return true;
  });

  return (
    <aside className="relative flex flex-col h-full w-full bg-[#f8f9fa] dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-l border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden select-none">
      {/* 1. Header with Search Bar & Profile/Status */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Search Trigger Input */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-white/10 transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium tracking-wide">
                Search stations, blocks, or labs...
              </span>
            </div>
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 text-slate-400">
              /
            </kbd>
          </button>

          {/* User Location Status Quick Trigger */}
          <button
            type="button"
            onClick={onLocateMe}
            title={isGpsActive ? 'Live GPS Active' : 'Locate Me'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              isGpsActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
          {[
            { id: 'ALL', label: 'All Places' },
            { id: 'ACADEMIC', label: 'Academic Blocks' },
            { id: 'LIBRARY', label: 'Library' },
            { id: 'AMENITIES', label: 'Food & Amenities' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 text-slate-700 dark:text-slate-200">
        {/* ========================================================
            STATE D: ROUTING / NAVIGATION DASHBOARD
            ======================================================== */}
        {(currentState === 'ROUTE_PREVIEW' || currentState === 'ROUTING_ACTIVE') && destination && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Navigation Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  Route Preview
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  {destination.name || destination.room_code || 'Destination'}
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {destination.building_name || selectedBuilding?.name || 'Academic Campus'}
                </div>
              </div>
              <button
                type="button"
                onClick={onCancelRoute}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Cancel Route"
              >
                ✕
              </button>
            </div>

            {/* Travel Metrics Card (Roam Style) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Walking Time
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    ~3 mins
                  </div>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />

              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Distance
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  185 m
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />

              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Floors
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {destination.level_number ? `Floor ${destination.level_number}` : 'Ground'}
                </div>
              </div>
            </div>

            {/* Accessible Wheelchair Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  ♿
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Step-Free Accessible Route
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Use ramps and building elevators only
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAccessibleMode}
                onClick={onToggleAccessible}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  isAccessibleMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
                    isAccessibleMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Turn-by-Turn Guidance Steps */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Guidance Waypoints
              </span>
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Start from Main Quadrangle Walkway</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Follow paved campus path towards Academic Complex (80m)</p>
                  </div>
                </div>
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 ml-1" />
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Enter Building Main Portico</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {isAccessibleMode ? 'Take Central Elevator to target floor' : 'Take East Staircase to target floor'}
                    </p>
                  </div>
                </div>
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 ml-1" />
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Arrive at {destination.name || destination.room_code}</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Destination located along northern corridor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onStartNavigation}
                className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer min-h-[44px]"
              >
                <span>Start Live Guidance</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={onCancelRoute}
                className="py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer min-h-[44px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STATE B / C: BUILDING OR FLOOR SELECTED
            ======================================================== */}
        {currentState !== 'ROUTE_PREVIEW' && currentState !== 'ROUTING_ACTIVE' && selectedBuilding && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header: Title, Category Pill, Height */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Zone #{selectedBuilding.code || 'CAMPUS'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {selectedBuilding.category || 'Academic Complex'}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  {selectedBuilding.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedBuilding.description}
                </p>
              </div>

              <button
                type="button"
                onClick={onResetToCampus}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer text-xs"
                title="Return to campus overview"
              >
                ✕
              </button>
            </div>

            {/* Interactive 3D Model / Aerial Hero Visual */}
            <Building3DPreview building={selectedBuilding} height={200} />

            {/* Floor Navigation Chips (Timeline Journey Style from Roam) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Available Floors ({selectedBuilding.floor_count || 3})
                </span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  Indoor Active
                </span>
              </div>

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
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>Floor {lvl}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Departments & Divisions */}
            {selectedBuilding.departments && selectedBuilding.departments.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Academic Departments
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBuilding.departments.map((dept, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Laboratories & Facilities */}
            {selectedBuilding.facilities && selectedBuilding.facilities.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Laboratories & Research Centers
                </span>
                <div className="flex flex-col gap-1.5">
                  {selectedBuilding.facilities.map((fac, i) => (
                    <div
                      key={i}
                      onClick={() => onSelectRoom?.({ id: `room-${i}`, name: fac, room_code: `LAB-${i + 1}`, building_name: selectedBuilding.name })}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {fac}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Route →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STATE A: DEFAULT CAMPUS DASHBOARD
            ======================================================== */}
        {currentState !== 'ROUTE_PREVIEW' && currentState !== 'ROUTING_ACTIVE' && !selectedBuilding && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Campus Identity & Live Geofence Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-900/20 via-slate-900/10 to-transparent dark:from-blue-950/40 dark:via-slate-900 border border-blue-500/20 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    JSS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      JSSATE Bengaluru
                    </h3>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Dr. Vishnuvardhan Road • 21.4 Acres
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{currentMode === 'CAMPUS_MODE' ? 'On Campus' : 'Explore'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed pt-1">
                Explore interactive 3D satellite models, verified building floorplans, and turn-by-turn guidance across campus.
              </p>
            </div>

            {/* Quick Metrics (Roam Style Stat Row) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Zones</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">8</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Floors</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">18</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Rooms</div>
                <div className="text-lg font-bold text-amber-500 mt-0.5">42+</div>
              </div>
            </div>

            {/* Important Campus Buildings (Roam "Latest journeys" Card List) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Important Campus Buildings
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Select to explore
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {filteredBuildings.map((building) => (
                  <div
                    key={building.id}
                    onClick={() => onSelectBuilding(building)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 shadow-sm flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                        {building.code === 'BLOCK_A' ? (
                          <img src="/images/block_a.png" alt="Block A" className="w-full h-full object-cover" />
                        ) : building.code === 'BLOCK_B' ? (
                          <img src="/images/block_b.png" alt="Block B" className="w-full h-full object-cover" />
                        ) : building.code === 'BLOCK_CIVIL' ? (
                          <img src="/images/block_civil.png" alt="Civil Block" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">🏫</span>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {building.short_name || building.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {building.description || building.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {building.height_m ? `${building.height_m}m` : 'Building'}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
