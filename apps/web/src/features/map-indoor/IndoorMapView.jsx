import React, { useState } from 'react';

// Floor data for mapped buildings
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

              <div className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Navigate</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
