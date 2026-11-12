import React, { useState } from 'react';
import { GlassSurface } from '../ui/GlassSurface';
import { Building3DPreview } from './Building3DPreview';
import { RouteCard } from '../routing/RouteCard';
import {
  getBuildingFloorConfig,
  isFloorMapped,
  getFloorRooms,
} from '../../data/campus-map/floorRegistry';
import { NAV_STATES } from '../../lib/navigationState';

export function DetailPanel({
  isOpen = true,
  onClose,
  onToggleOpen,
  selectedBuilding,
  selectedFloor,
  selectedRoom,
  destination,
  activeRoute,
  currentState = NAV_STATES.OVERVIEW,
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
  className = '',
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

  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-30 pointer-events-auto">
        <GlassSurface
          radius="control"
          onClick={onToggleOpen}
          interactive
          className="h-10 px-3 flex items-center gap-2 cursor-pointer shadow-xl border-white/20"
          title="Open Information Panel"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs font-semibold text-white">Details</span>
          <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </GlassSurface>
      </div>
    );
  }

  return (
    <aside
      className={`fixed top-4 right-4 bottom-4 xl:top-6 xl:right-6 xl:bottom-6 w-[400px] max-w-[calc(100vw-32px)] z-30 flex flex-col pointer-events-auto select-none transition-all duration-240 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${className}`}
      role="complementary"
      aria-label="Campus Context Details Panel"
    >
      <GlassSurface
        radius="panel"
        className="w-full h-full flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* ============================================================
            1. STICKY GLASS HEADER (Icon, Title, Subtitle, Notifs, Avatar, Collapse)
            ============================================================ */}
        <div className="p-4 pb-3 flex items-center justify-between gap-2.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[12px] bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
              <span className="text-sm">🏢</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                {selectedBuilding ? selectedBuilding.name.split('(')[0] : 'Campus Overview'}
              </h2>
              <span className="text-[11px] text-white/60 truncate">
                {selectedBuilding
                  ? `Floor ${activeLevel} • ${rooms.length} Rooms Mapped`
                  : 'JSSATE Navigation Hub'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenSearch}
              title="Campus Notifications"
              className="w-8 h-8 rounded-full glass-child flex items-center justify-center text-white/70 hover:text-white cursor-pointer relative"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              JS
            </div>

            {/* Collapse/Close Toggle */}
            <button
              type="button"
              onClick={onClose || onToggleOpen}
              title="Collapse Panel (Esc)"
              className="w-8 h-8 rounded-full glass-child flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            2. INTERNAL SCROLLABLE CONTENT BODY
            ============================================================ */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 no-scrollbar">
          {/* EXPLORE MODE STATE (When user is outside campus boundary) */}
          {currentMode === 'EXPLORE_MODE' ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Outside Campus (Explore Mode)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  Outside Geofence
                </span>
              </div>

              <p className="text-xs text-white/70 font-normal leading-relaxed">
                You are currently <strong className="text-amber-300 font-semibold">{distanceToCampusKm.toFixed(1)} km</strong> from JSS Academy of Technical Education. Real-time outdoor GPS tracking is active. Indoor building models and floor navigation are disabled until entering campus.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectBuilding?.({ enterCampus: true })}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px] cursor-pointer"
                >
                  <span>🏫 Re-center on Campus</span>
                </button>

                <button
                  type="button"
                  onClick={onLocateMe}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20 flex items-center justify-center gap-1.5 min-h-[44px] transition-colors cursor-pointer"
                >
                  <span>My Location</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* GPS Accuracy Warning Hint if indoor accuracy > 50m */}
              {gpsLocation && gpsLocation.accuracy > 50 && (
                <div className="p-3 rounded-[12px] bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>Low GPS accuracy (±{Math.round(gpsLocation.accuracy)}m) indoors.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onLocateMe}
                    className="px-2 py-1 rounded-[8px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Anchor
                  </button>
                </div>
              )}

              {/* ACTIVE ROUTE / DESTINATION PREVIEW */}
              {currentState === NAV_STATES.ROUTE_PREVIEW || destination || activeRoute ? (
                <RouteCard
                  destination={destination || selectedRoom}
                  origin={isInsideCampus ? 'Current Campus Position' : 'Main Gate Anchor'}
                  isAccessible={isAccessibleMode}
                  onToggleAccessible={onToggleAccessible}
                  onStartNavigation={onStartNavigation}
                  onCancelRoute={onCancelRoute || onResetToCampus}
                />
              ) : null}

              {/* BUILDING 3D MODEL PREVIEW & FLOOR SELECTION */}
              {selectedBuilding && (
                <div className="flex flex-col gap-2">
                  <div className="w-full h-44 rounded-[16px] overflow-hidden border border-white/10 bg-black/40 relative shadow-inner">
                    <Building3DPreview building={selectedBuilding} />
                    <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-[6px] text-[10px] font-mono bg-black/60 text-white/80 backdrop-blur-sm border border-white/10">
                      Interactive 3D WebGL
                    </span>
                  </div>

                  {/* Floor Switcher Tabs inside Panel */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">
                        AVAILABLE LEVELS
                      </span>
                      <span className="text-[10px] text-blue-400 font-semibold">
                        Floor {activeLevel} Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {floors.map((floor) => {
                        const isSelected = activeLevel === floor.level_number;
                        const isFloorAvail = floor.status === 'available';
                        return (
                          <button
                            key={floor.id}
                            type="button"
                            onClick={() => onSelectFloor?.(floor)}
                            className={`py-2 px-2 rounded-[12px] text-center flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                                : 'glass-child text-white/80 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-bold">Floor {floor.level_number}</span>
                            <span className="text-[9px] opacity-75 font-medium truncate">
                              {isFloorAvail ? 'Mapped' : 'Reserved'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Filter Chips for Rooms */}
                  {isMapped && rooms.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                          Rooms Directory ({filteredRooms.length})
                        </span>
                        <div className="flex items-center gap-1">
                          {['ALL', 'LAB', 'CLASS', 'FACULTY'].map((filterKey) => (
                            <button
                              key={filterKey}
                              type="button"
                              onClick={() => setRoomFilter(filterKey)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                                roomFilter === filterKey
                                  ? 'bg-blue-600 text-white'
                                  : 'text-white/60 hover:text-white glass-child'
                              }`}
                            >
                              {filterKey}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Room List Grid */}
                      <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {filteredRooms.map((room) => {
                          const isSelected = selectedRoom?.id === room.id;
                          return (
                            <div
                              key={room.id}
                              onClick={() => onSelectRoom?.(room)}
                              className={`p-2.5 rounded-[12px] flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400/50 text-white'
                                  : 'glass-child text-white/90 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs">
                                  {room.room_type?.toLowerCase().includes('lab')
                                    ? '🔬'
                                    : room.room_type?.toLowerCase().includes('faculty')
                                    ? '👨‍🏫'
                                    : '🚪'}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold truncate leading-tight">
                                    {room.name}
                                  </span>
                                  <span className="text-[10px] text-white/50 truncate capitalize">
                                    {room.room_type || 'Room'} • Floor {activeLevel}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToRoom?.(room);
                                }}
                                className="px-2.5 py-1 rounded-[8px] bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold tracking-wide shrink-0 transition-colors cursor-pointer"
                              >
                                Route
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CAMPUS OVERVIEW (When no building is selected) */}
              {!selectedBuilding && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                      Pilot 3D Buildings
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {pilotBuildings.length} Available
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {pilotBuildings.map((building) => (
                      <div
                        key={building.id}
                        onClick={() => onSelectBuilding?.(building)}
                        className="p-3 rounded-[14px] glass-child flex items-center justify-between gap-3 text-left transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[10px] bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
                            🏛️
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">
                              {building.name}
                            </span>
                            <span className="text-[10px] text-white/50 truncate">
                              3D Footprint & Indoor Corridors
                            </span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>

                  {/* Actions: Search Rooms & Accessibility Toggle */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onOpenSearch}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[14px] text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px] cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Find Facilities & Labs</span>
                    </button>

                    <div className="p-2.5 rounded-[12px] glass-child flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">♿</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">Wheelchair Accessible</span>
                          <span className="text-[10px] text-white/50">Prioritize elevators & ramps</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Toggle Wheelchair Accessible Mode"
                        onClick={onToggleAccessible}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isAccessibleMode ? 'bg-blue-600' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            isAccessibleMode ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Other Campus Facilities */}
                  {otherFacilities.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                        Other Facilities & Hostels
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {otherFacilities.map((facility) => (
                          <button
                            key={facility.id}
                            type="button"
                            onClick={() => onSelectBuilding?.(facility)}
                            className="p-2 rounded-[10px] glass-child text-left text-xs text-white/80 hover:text-white truncate cursor-pointer"
                          >
                            {facility.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ============================================================
            3. STICKY GLASS FOOTER (52px Full-width Primary CTA + Secondary Ghost)
            ============================================================ */}
        <div className="p-4 pt-3 border-t border-white/10 flex flex-col gap-2 shrink-0 bg-black/20">
          <button
            type="button"
            onClick={
              selectedBuilding
                ? () => {
                    const firstRoom = rooms[0];
                    if (firstRoom) onNavigateToRoom?.(firstRoom);
                  }
                : onOpenSearch
            }
            className="w-full h-[52px] rounded-[16px] bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.985]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{selectedBuilding ? 'Explore Floorplan & Rooms' : 'Search Campus Navigation'}</span>
          </button>

          <button
            type="button"
            onClick={onResetToCampus}
            className="w-full h-[38px] rounded-[12px] text-white/70 hover:text-white glass-child text-xs font-medium transition-colors cursor-pointer"
          >
            Reset to Campus Overview
          </button>
        </div>
      </GlassSurface>
    </aside>
  );
}

export default DetailPanel;
