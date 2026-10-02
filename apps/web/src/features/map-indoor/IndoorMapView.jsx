import React, { useState, useEffect } from 'react';

// Mock floors data for selected building
const MOCK_FLOORS = [
  { id: 'floor-1', level_number: 1, notes: 'Ground Floor — Computer Labs & Admin' },
  { id: 'floor-2', level_number: 2, notes: 'Second Floor — AI Labs & HOD Offices' },
  { id: 'floor-3', level_number: 3, notes: 'Third Floor — Lecture Halls' },
];

const MOCK_ROOMS = {
  'floor-1': [
    { id: 'room-101', room_code: 'C-101', name: 'Computer Science Lab 1', room_type: 'Lab' },
    { id: 'room-102', room_code: 'C-102', name: 'Software Engineering Lab', room_type: 'Lab' },
    { id: 'room-103', room_code: 'C-103', name: 'Seminar Hall A', room_type: 'Hall' },
  ],
  'floor-2': [
    { id: 'room-201', room_code: 'C-201', name: 'AI & Data Science Research Lab', room_type: 'Lab' },
    { id: 'room-202', room_code: 'C-202', name: 'Faculty HOD Office', room_type: 'Office', occupant_name: 'Dr. A. Sharma' },
    { id: 'room-203', room_code: 'C-203', name: 'Robotics Workshop', room_type: 'Workshop' },
  ],
  'floor-3': [
    { id: 'room-301', room_code: 'C-301', name: 'Lecture Hall 101', room_type: 'Classroom' },
    { id: 'room-302', room_code: 'C-302', name: 'Lecture Hall 102', room_type: 'Classroom' },
  ],
};

export function IndoorMapView({ selectedBuilding, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [activeFloorId, setActiveFloorId] = useState(selectedFloor?.id || 'floor-1');
  const [opacity, setOpacity] = useState(1);

  // Cross-fade transition (~200ms) when changing floors
  const handleFloorChange = (floor) => {
    setOpacity(0.2);
    setTimeout(() => {
      setActiveFloorId(floor.id);
      onSelectFloor(floor);
      setOpacity(1);
    }, 200);
  };

  const rooms = MOCK_ROOMS[activeFloorId] || MOCK_ROOMS['floor-1'];

  return (
    <div className="flex flex-col gap-4">
      {/* Floor Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {MOCK_FLOORS.map((floor) => {
          const isActive = floor.id === activeFloorId;
          return (
            <button
              key={floor.id}
              type="button"
              onClick={() => handleFloorChange(floor)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Floor {floor.level_number}
            </button>
          );
        })}
      </div>

      {/* Cross-fading Floorplan Room List */}
      <div
        className="flex flex-col gap-2 transition-opacity duration-200"
        style={{ opacity }}
      >
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Rooms on Floor {MOCK_FLOORS.find((f) => f.id === activeFloorId)?.level_number}
        </h4>

        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelectRoom(room)}
            className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-xl flex items-center justify-between group transition-all min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                {room.room_code}
              </span>
              <div>
                <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-900">
                  {room.name}
                </h5>
                <p className="text-xs text-slate-500">
                  {room.room_type} {room.occupant_name && `• ${room.occupant_name}`}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
              Select →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
