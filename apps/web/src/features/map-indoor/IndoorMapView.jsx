import React, { useState } from 'react';

// Floor data for mapped pilot building (Block C)
const MOCK_FLOORS = [
  { id: 'floor-1', level_number: 1, notes: 'Ground Floor — Department Laboratories & Reception' },
  { id: 'floor-2', level_number: 2, notes: 'Floor 2 — AI Research Centers & Faculty Offices' },
  { id: 'floor-3', level_number: 3, notes: 'Floor 3 — Smart Classrooms & Seminar Halls' },
];

const MOCK_ROOMS = {
  'floor-1': [
    { id: 'room-101', room_code: 'C-101', name: 'Computer Science Lab 1', room_type: 'Laboratory', department: 'Computer Science & Engineering' },
    { id: 'room-102', room_code: 'C-102', name: 'Software Systems Lab', room_type: 'Laboratory', department: 'Computer Science & Engineering' },
    { id: 'room-103', room_code: 'C-103', name: 'Seminar Hall A', room_type: 'Auditorium', department: 'Academics' },
  ],
  'floor-2': [
    { id: 'room-201', room_code: 'C-201', name: 'AI & Machine Learning Lab', room_type: 'Research Lab', department: 'AI & Data Science' },
    { id: 'room-202', room_code: 'C-202', name: 'HOD Office', room_type: 'Faculty Office', occupant_name: 'Dr. A. Sharma', department: 'Computer Science & Engineering' },
    { id: 'room-203', room_code: 'C-203', name: 'Robotics & Embedded Systems Lab', room_type: 'Laboratory', department: 'Electronics & Computer' },
  ],
  'floor-3': [
    { id: 'room-301', room_code: 'C-301', name: 'Classroom 301', room_type: 'Lecture Hall', department: 'Academics' },
    { id: 'room-302', room_code: 'C-302', name: 'Classroom 302', room_type: 'Lecture Hall', department: 'Academics' },
  ],
};

export function IndoorMapView({ selectedBuilding, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [activeFloorId, setActiveFloorId] = useState(selectedFloor?.id || 'floor-1');
  const [opacity, setOpacity] = useState(1);

  const isIndoorReady =
    selectedBuilding?.indoor_mapping_status === 'available' ||
    !selectedBuilding?.indoor_mapping_status ||
    selectedBuilding?.code === 'BLOCK_C' ||
    selectedBuilding?.name?.includes('Block C');

  // 200ms smooth cross-fade when switching floors
  const handleFloorChange = (floor) => {
    setOpacity(0.2);
    setTimeout(() => {
      setActiveFloorId(floor.id);
      onSelectFloor(floor);
      setOpacity(1);
    }, 200);
  };

  const rooms = MOCK_ROOMS[activeFloorId] || MOCK_ROOMS['floor-1'];
  const currentFloorObj = MOCK_FLOORS.find((f) => f.id === activeFloorId) || MOCK_FLOORS[0];

  if (!isIndoorReady) {
    return (
      <div className="flex flex-col gap-3 py-1">
        {/* Verification and Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">
            Indoor Mapping In Progress
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
            selectedBuilding?.verification === 'verified'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/25'
          }`}>
            {selectedBuilding?.verification === 'verified' ? 'Verified 3D Volume' : 'Estimated Footprint'}
          </span>
          <span className="text-[10px] font-mono text-white/50">
            {selectedBuilding?.height_m ? `${selectedBuilding.height_m}m Height` : ''}
          </span>
        </div>

        {/* Building Details */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedBuilding?.description || 'Campus academic and administrative facility at JSSATE Bangalore.'}
        </p>

        {selectedBuilding?.departments && selectedBuilding.departments.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
              Departments & Divisions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedBuilding.departments.map((dept, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-[11px]"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notice for Pilot Indoors */}
        <div className="mt-2 p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl flex items-start gap-2.5">
          <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-[11px] text-blue-200/90 leading-relaxed">
            Detailed indoor floor plans and room checkpoints for this building are scheduled in Phase 2. To test turn-by-turn indoor routing right now, switch to <strong className="text-white">Block C (CS & AI)</strong>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Floor Selection Pills */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {MOCK_FLOORS.map((floor) => {
            const isActive = floor.id === activeFloorId;
            return (
              <button
                key={floor.id}
                type="button"
                onClick={() => handleFloorChange(floor)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white/70'
                }`}
              >
                Floor {floor.level_number}
              </button>
            );
          })}
        </div>

        <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase hidden sm:inline">
          Indoor Plan
        </span>
      </div>

      {/* Cross-Fading Room List */}
      <div
        className="flex flex-col gap-2 transition-opacity duration-200"
        style={{ opacity }}
      >
        <div className="text-[11px] font-medium text-white/60">
          {currentFloorObj.notes}
        </div>

        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {rooms.map((room) => (
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
                  <div className="text-[10px] text-white/50">
                    {room.room_type} {room.occupant_name && `• ${room.occupant_name}`}
                  </div>
                </div>
              </div>

              <span className="text-xs font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">
                Navigate →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
