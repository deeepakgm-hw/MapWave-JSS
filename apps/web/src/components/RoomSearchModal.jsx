import React, { useState } from 'react';

// Mock searchable rooms database for campus search jump
const SAMPLE_ROOMS = [
  { id: 'room-101', room_code: 'C-101', name: 'Computer Science Lab 1', room_type: 'Lab', building_name: 'JSSATE Block C', level_number: 1, department: 'Computer Science & Engineering' },
  { id: 'room-102', room_code: 'C-102', name: 'Software Engineering Classroom', room_type: 'Classroom', building_name: 'JSSATE Block C', level_number: 1, department: 'Computer Science & Engineering' },
  { id: 'room-201', room_code: 'C-201', name: 'AI & Data Science Research Lab', room_type: 'Research Lab', building_name: 'JSSATE Block C', level_number: 2, department: 'Artificial Intelligence & Machine Learning' },
  { id: 'room-202', room_code: 'C-202', name: 'Faculty HOD Office', room_type: 'Office', occupant_name: 'Dr. A. Sharma', building_name: 'JSSATE Block C', level_number: 2, department: 'Computer Science & Engineering' },
  { id: 'room-301', room_code: 'A-301', name: 'Main Campus Auditorium', room_type: 'Auditorium', building_name: 'JSSATE Admin Block A', level_number: 3, department: 'General Campus' },
  { id: 'room-105', room_code: 'B-105', name: 'Central Campus Library', room_type: 'Library', building_name: 'JSSATE Library Block B', level_number: 1, department: 'Academics & Research' },
];

export function RoomSearchModal({ isOpen, onClose, onSelectRoom }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = SAMPLE_ROOMS.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.room_code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.occupant_name?.toLowerCase().includes(q) ||
      r.building_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            placeholder="Search room code, lab, office, or occupant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-slate-800 placeholder-slate-400 bg-transparent text-base font-medium focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search modal"
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No matching rooms or occupants found.
            </div>
          ) : (
            filtered.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  onSelectRoom({
                    room,
                    building: { name: room.building_name },
                    floor: { level_number: room.level_number },
                  });
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-blue-50/80 border border-transparent hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {room.room_code}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-900">
                      {room.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {room.building_name} • Floor {room.level_number} • {room.department}
                    {room.occupant_name && ` (${room.occupant_name})`}
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Navigate →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
