import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassSurface } from './ui/GlassSurface';
import { Building3DPreview } from './dashboard/Building3DPreview';
import { RouteCard } from './routing/RouteCard';
import {
  getBuildingFloorConfig,
  isFloorMapped,
  getFloorRooms,
} from '../data/campus-map/floorRegistry';
import { NAV_STATES } from '../lib/navigationState';

/**
 * MapWave Persistent Mobile Bottom Sheet (One unified sheet)
 * Snaps:
 * - peek: ~88px + safe-b (Search bar visible)
 * - half: 50dvh (Details, building specs, room list)
 * - full: 92dvh (Full screen directory & route overview)
 *
 * Features:
 * - Velocity-based gesture snapping with rubber-band resistance
 * - Window visualViewport tracking to ride above mobile virtual keyboard
 * - Dynamic bottom offset reporting to parent via onHeightChange
 * - Turn-by-turn navigation card during active navigation
 * - Screen Wake Lock API integration during active navigation
 */
export function BottomSheet({
  selectedBuilding,
  selectedFloor,
  selectedRoom,
  destination,
  activeRoute,
  currentState = NAV_STATES.OVERVIEW,
  currentMode = 'CAMPUS_MODE',
  distanceToCampusKm = 0,
  gpsLocation,
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
  onLocateMe,
  pilotBuildings = [],
  otherFacilities = [],
  onHeightChange,
  onOpenSearch,
  searchQuery = '',
  onSearchChange,
  onSearchSelect,
}) {
  // snap modes: 'peek' | 'half' | 'full'
  const [snap, setSnap] = useState('peek');
  const [sheetHeightPx, setSheetHeightPx] = useState(96);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const touchStartY = useRef(0);
  const touchLastY = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);
  const [dragTranslateY, setDragTranslateY] = useState(0);

  // Auto-expand sheet to half when a building or room is selected or route is previewed
  useEffect(() => {
    if (selectedBuilding || destination || activeRoute || currentState === NAV_STATES.ROUTE_PREVIEW) {
      setSnap((prev) => (prev === 'peek' ? 'half' : prev));
    }
  }, [selectedBuilding, destination, activeRoute, currentState]);

  // Keep screen awake during active turn-by-turn navigation (Wake Lock API)
  useEffect(() => {
    let wakeLock = null;
    const isNavigating = currentState === NAV_STATES.ROUTING_ACTIVE;

    if (isNavigating && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLock = lock;
        })
        .catch((err) => {
          console.warn('[WakeLock] Unable to acquire screen wake lock:', err);
        });
    }

    return () => {
      wakeLock?.release?.();
    };
  }, [currentState]);

  // Visual Viewport tracking for mobile virtual keyboards
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Update dynamic sheet height measurement and notify parent
  useEffect(() => {
    if (!sheetRef.current) return;
    const height = sheetRef.current.offsetHeight;
    setSheetHeightPx(height);
    onHeightChange?.(height);
  }, [snap, selectedBuilding, destination, activeRoute, currentState, keyboardOffset, onHeightChange]);

  // Drag Gesture Handlers
  const handleTouchStart = (e) => {
    // Only allow dragging handle or header, or when content is scrolled to top
    if (contentRef.current && contentRef.current.scrollTop > 5 && snap === 'full') {
      return;
    }
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Apply rubber-band resistance at top or bottom limits
    let resistedDeltaY = deltaY;
    if (snap === 'full' && deltaY < 0) {
      resistedDeltaY = deltaY * 0.25; // upward resistance
    } else if (snap === 'peek' && deltaY > 0) {
      resistedDeltaY = deltaY * 0.25; // downward resistance
    }

    setDragTranslateY(resistedDeltaY);
    touchLastY.current = currentY;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const deltaY = dragTranslateY;
    const duration = Date.now() - touchStartTime.current;
    const velocity = deltaY / Math.max(duration, 1); // px per ms

    setDragTranslateY(0);

    // Velocity-based gesture or displacement-based snapping
    if (velocity < -0.4 || deltaY < -80) {
      // Swiped upward
      if (snap === 'peek') setSnap('half');
      else if (snap === 'half') setSnap('full');
    } else if (velocity > 0.4 || deltaY > 80) {
      // Swiped downward
      if (snap === 'full') setSnap('half');
      else if (snap === 'half') setSnap('peek');
    }
  };

  // Building floor metadata
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

  // Snap height classes
  const snapHeights = {
    peek: 'h-[92px]',
    half: 'h-[50dvh]',
    full: 'h-[92dvh]',
  };

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-label="Campus Navigation Bottom Sheet"
      className={`fixed inset-x-0 bottom-0 z-30 pointer-events-auto flex flex-col select-none transition-all duration-240 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${snapHeights[snap]}`}
      style={{
        transform: `translateY(${dragTranslateY}px)`,
        bottom: `${keyboardOffset}px`,
        paddingBottom: 'var(--safe-b, 0px)',
        zIndex: 'var(--z-sheet, 30)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <GlassSurface
        radius="panel"
        className="w-full h-full flex flex-col overflow-hidden shadow-2xl rounded-t-[24px] rounded-b-none border-x-0 border-b-0 border-t border-white/20"
      >
        {/* ============================================================
            1. DRAG HANDLE & COMPACT SEARCH BAR (Always accessible in Peek)
            ============================================================ */}
        <div
          onClick={() => {
            if (snap === 'peek') setSnap('half');
          }}
          className="px-4 pt-2 pb-2.5 flex flex-col items-center gap-1.5 shrink-0 cursor-pointer border-b border-white/10"
        >
          {/* Centered Drag Handle (36x4) */}
          <div className="w-9 h-1 rounded-full bg-white/40 hover:bg-white/70 transition-colors" />

          {/* Persistent Search Bar Input */}
          <div className="w-full flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-[44px] px-3.5 rounded-[14px] bg-white/10 border border-white/15 flex items-center gap-2.5 text-white/70 focus-within:border-blue-400 focus-within:bg-white/15 transition-all">
              <svg className="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  if (snap === 'peek') setSnap('half');
                }}
                onFocus={() => {
                  if (snap === 'peek') setSnap('half');
                }}
                placeholder="Search buildings, rooms, labs..."
                className="w-full bg-transparent text-white placeholder-white/45 text-base outline-none font-sans"
                style={{ fontSize: '16px' }}
                aria-label="Search campus directory"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearchChange?.('');
                  }}
                  className="w-6 h-6 rounded-full bg-white/15 text-white/80 hover:text-white flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Snap Cycle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (snap === 'peek') setSnap('half');
                else if (snap === 'half') setSnap('full');
                else setSnap('peek');
              }}
              aria-label={`Current state: ${snap}. Click to toggle.`}
              className="w-11 h-11 rounded-[14px] bg-white/10 hover:bg-white/15 text-white/80 flex items-center justify-center shrink-0 border border-white/15 cursor-pointer tap-feedback"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-240 ${
                  snap === 'full' ? 'rotate-180' : snap === 'half' ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            2. SCROLLABLE CONTENT BODY (Scrolls only at Full snap)
            ============================================================ */}
        <div
          ref={contentRef}
          className={`flex-1 px-4 py-3 flex flex-col gap-3.5 no-scrollbar ${
            snap === 'full' ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
          {/* Active Navigation HUD (Turn-by-turn guidance) */}
          {currentState === NAV_STATES.ROUTING_ACTIVE && (
            <div className="p-3.5 rounded-[16px] bg-blue-600/25 border border-blue-400/40 text-white flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <span className="text-lg">⬆️</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Next Direction
                  </span>
                  <span className="text-sm font-semibold truncate leading-tight mt-0.5">
                    Proceed forward along Main Corridor to {destination?.name || 'Destination'}
                  </span>
                  <span className="text-xs text-white/60 font-mono mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                    Est. 45m • 1 min walk
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancelRoute}
                className="px-3 py-2 rounded-[12px] bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer tap-feedback"
              >
                End
              </button>
            </div>
          )}

          {/* Explore Mode Notification */}
          {currentMode === 'EXPLORE_MODE' && (
            <div className="p-3.5 rounded-[16px] bg-amber-500/15 border border-amber-400/30 text-white flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Explore Mode Active
                </span>
                <span className="text-xs font-mono text-white/50 uppercase">
                  Outside Boundary
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
                You are currently <strong className="text-amber-300 font-semibold">{distanceToCampusKm.toFixed(1)} km</strong> from campus. Real-time GPS tracking is active.
              </p>
              <button
                type="button"
                onClick={() => onSelectBuilding?.({ enterCampus: true })}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-[12px] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer tap-feedback"
              >
                <span>🏫 Enter Campus 3D Mode</span>
              </button>
            </div>
          )}

          {/* Route Preview Card */}
          {(currentState === NAV_STATES.ROUTE_PREVIEW || destination || activeRoute) && (
            <RouteCard
              destination={destination || selectedRoom}
              origin={currentMode === 'CAMPUS_MODE' ? 'Current Campus Position' : 'Main Gate'}
              isAccessible={isAccessibleMode}
              onToggleAccessible={onToggleAccessible}
              onStartNavigation={onStartNavigation}
              onCancelRoute={onCancelRoute || onResetToCampus}
            />
          )}

          {/* Selected Building Details & Floor Level Tabs */}
          {selectedBuilding && !destination && (
            <div className="flex flex-col gap-3">
              {/* Header Title & Close Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {selectedBuilding.shortName || selectedBuilding.name.split('(')[0]}
                  </h3>
                  <span className="text-xs text-white/60 capitalize mt-0.5">
                    {selectedBuilding.category || 'Academic Complex'} • Floor {activeLevel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onResetToCampus}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer tap-feedback"
                >
                  ✕
                </button>
              </div>

              {/* 3D WebGL Building Model Container */}
              <div className="w-full h-36 rounded-[14px] overflow-hidden border border-white/10 bg-black/40 relative">
                <Building3DPreview building={selectedBuilding} />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] text-xs font-mono bg-black/60 text-white/80 backdrop-blur-sm border border-white/10">
                  3D View
                </span>
              </div>

              {/* Level Tabs (F1, F2, F3) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-wider font-bold">
                    SELECT FLOOR
                  </span>
                  <span className="text-xs text-blue-400 font-semibold">
                    Floor {activeLevel} Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {floors.map((floor) => {
                    const isSelected = activeLevel === floor.level_number;
                    const isAvail = floor.status === 'available';
                    return (
                      <button
                        key={floor.id}
                        type="button"
                        onClick={() => onSelectFloor?.(floor)}
                        className={`h-11 rounded-[12px] flex flex-col items-center justify-center border transition-all cursor-pointer tap-feedback ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-white/10 text-white/80 hover:text-white border-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">F{floor.level_number}</span>
                        <span className="text-[10px] opacity-75 font-medium leading-none mt-0.5">
                          {isAvail ? 'Mapped' : 'Reserved'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Chips */}
              {isMapped && rooms.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider font-bold">
                      Directory ({filteredRooms.length})
                    </span>
                    <div className="flex items-center gap-1">
                      {['ALL', 'LAB', 'CLASS', 'FACULTY'].map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setRoomFilter(filterKey)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer tap-feedback ${
                            roomFilter === filterKey
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-white/70 hover:text-white'
                          }`}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Rows with 44px min-height targets */}
                  <div className="flex flex-col gap-1.5">
                    {filteredRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      return (
                        <div
                          key={room.id}
                          onClick={() => onSelectRoom?.(room)}
                          className={`p-3 rounded-[12px] min-h-[48px] flex items-center justify-between gap-2 border transition-all cursor-pointer tap-feedback ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400/50 text-white'
                              : 'bg-white/10 border-white/10 text-white/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm">
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
                              <span className="text-xs text-white/50 truncate capitalize">
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
                            className="min-h-[44px] px-3 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide shrink-0 transition-colors cursor-pointer tap-feedback flex items-center justify-center"
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

          {/* Campus Overview (When idle / no building selected) */}
          {!selectedBuilding && !destination && currentMode !== 'EXPLORE_MODE' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/50 uppercase tracking-wider font-bold">
                  Pilot 3D Buildings
                </span>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  {pilotBuildings.length} Available
                </span>
              </div>

              {/* Pilot Building Cards */}
              <div className="flex flex-col gap-2">
                {pilotBuildings.map((building) => (
                  <button
                    key={building.id}
                    type="button"
                    onClick={() => onSelectBuilding?.(building)}
                    className="p-3 rounded-[14px] min-h-[52px] bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between gap-3 text-left transition-all cursor-pointer tap-feedback"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-blue-600/30 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
                        🏛️
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {building.name}
                        </span>
                        <span className="text-xs text-white/50 truncate">
                          3D Footprint & Indoor Corridors
                        </span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Search Rooms CTA Button (Matches unit tests) */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSearch) {
                      onOpenSearch();
                    } else {
                      setSnap('full');
                    }
                  }}
                  className="flex-1 min-h-[48px] py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[14px] text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer tap-feedback"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Rooms</span>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isAccessibleMode}
                  onClick={onToggleAccessible}
                  className={`min-h-[48px] px-3.5 rounded-[14px] text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer tap-feedback ${
                    isAccessibleMode
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/10 text-white/80 border-white/10'
                  }`}
                >
                  <span>♿</span>
                  <span>Accessible</span>
                </button>
              </div>

              {/* Other Facilities Section */}
              {otherFacilities.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-wider font-bold">
                    Campus Facilities & Hostels
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {otherFacilities.map((facility) => (
                      <button
                        key={facility.id}
                        type="button"
                        onClick={() => onSelectBuilding?.(facility)}
                        className="p-2.5 min-h-[44px] rounded-[10px] bg-white/10 hover:bg-white/15 border border-white/10 text-left text-xs text-white/90 truncate cursor-pointer tap-feedback"
                      >
                        {facility.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            3. STICKY BOTTOM ACTION BAR (52px Full-width Primary CTA)
            ============================================================ */}
        {snap !== 'peek' && (
          <div className="p-3 pt-2 border-t border-white/10 flex flex-col gap-2 shrink-0 bg-black/30">
            <button
              type="button"
              onClick={
                selectedBuilding
                  ? () => {
                      const firstRoom = rooms[0];
                      if (firstRoom) onNavigateToRoom?.(firstRoom);
                      else setSnap('full');
                    }
                  : () => setSnap('full')
              }
              className="w-full h-[52px] rounded-[16px] bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{selectedBuilding ? 'Explore Floorplan & Rooms' : 'Browse All Facilities'}</span>
            </button>

            <button
              type="button"
              onClick={onResetToCampus}
              className="w-full h-[40px] rounded-[12px] text-white/70 hover:text-white bg-white/5 border border-white/10 text-xs font-medium transition-colors cursor-pointer tap-feedback"
            >
              Dismiss & Campus Overview
            </button>
          </div>
        )}
      </GlassSurface>
    </div>
  );
}

export default BottomSheet;
