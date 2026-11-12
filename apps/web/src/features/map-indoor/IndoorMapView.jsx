import React, { useState } from 'react';
import {
  getBuildingFloorConfig,
  getFloorData,
  isFloorMapped,
  getFloorRooms,
} from '../../data/campus-map/floorRegistry';

export function IndoorMapView({
  selectedBuilding,
  selectedFloor,
  onSelectFloor,
  onSelectRoom,
}) {
  const buildingCode = selectedBuilding?.code || 'BLOCK_A';
  const floorConfig = getBuildingFloorConfig(buildingCode);
  const activeLevel = selectedFloor?.level_number || floorConfig?.defaultFloor || 2;

  const [opacity, setOpacity] = useState(1);
  const [roomFilter, setRoomFilter] = useState('ALL');

  const floors = floorConfig?.floors || [
    { id: 'floor-1', level_number: 1, name: 'First Floor', status: 'unmapped' },
    { id: 'floor-2', level_number: 2, name: 'Second Floor', status: 'available' },
    { id: 'floor-3', level_number: 3, name: 'Third Floor', status: 'unmapped' },
  ];

  const currentFloorData = getFloorData(buildingCode, activeLevel);
  const isMapped = isFloorMapped(buildingCode, activeLevel);
  const rooms = isMapped ? getFloorRooms(buildingCode, activeLevel) : [];

  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'ALL') return true;
    if (roomFilter === 'LAB') return (r.room_type || '').toLowerCase().includes('lab');
    if (roomFilter === 'CLASS') return (r.room_type || '').toLowerCase().includes('class');
    if (roomFilter === 'FACULTY') return (r.room_type || '').toLowerCase().includes('faculty') || (r.room_type || '').toLowerCase().includes('office');
    return true;
  });

  const handleFloorChange = (floor) => {
    setOpacity(0.2);
    setTimeout(() => {
      onSelectFloor(floor);
      setOpacity(1);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Floor Selection Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {floors.map((floor) => {
            const isActive = floor.level_number === activeLevel;
            const mapped = floor.status === 'available';

            return (
              <button
                key={floor.id}
                type="button"
                onClick={() => handleFloorChange(floor)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : mapped
                    ? 'bg-white/10 hover:bg-white/20 text-white/90'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <span>Floor {floor.level_number}</span>
                {mapped ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Verified Map Available" />
                ) : (
                  <span className="text-[9px] font-normal uppercase opacity-60">Phase 2</span>
                )}
              </button>
            );
          })}
        </div>

        <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase hidden sm:inline">
          {isMapped ? `${rooms.length} Verified Rooms` : 'Floor Plan'}
        </span>
      </div>

      {/* Content Area */}
      <div
        className="flex flex-col gap-2 transition-opacity duration-200"
        style={{ opacity }}
      >
        {isMapped ? (
          <>
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {[
                { id: 'ALL', label: `All (${rooms.length})` },
                { id: 'LAB', label: 'Labs' },
                { id: 'CLASS', label: 'Classrooms' },
                { id: 'FACULTY', label: 'Faculty & Office' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRoomFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    roomFilter === f.id
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Room List */}
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 flex items-center justify-between group transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {room.room_code}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {room.name}
                      </div>
                      <div className="text-[10px] text-white/50 capitalize">
                        {room.room_type} • Floor {room.floor}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    Navigate →
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-2 my-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
              ℹ
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {currentFloorData?.name || `Floor ${activeLevel}`} Survey In Progress
            </h4>
            <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
              CAD architectural digitizing and QGIS node extraction for Floor {activeLevel} are underway in Phase 2.
            </p>
            <button
              type="button"
              onClick={() => onSelectFloor(floors.find((f) => f.status === 'available') || floors[1])}
              className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Switch to Verified Floor 2
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
