import React, { useState } from 'react';

const SAMPLE_ROOMS = [
  { id: 'room-101', room_code: 'C-101', name: 'Computer Science Lab 1', room_type: 'Laboratory', building_name: 'JSSATE Block C', level_number: 1, department: 'Computer Science & Engineering' },
  { id: 'room-102', room_code: 'C-102', name: 'Software Engineering Classroom', room_type: 'Classroom', building_name: 'JSSATE Block C', level_number: 1, department: 'Computer Science & Engineering' },
  { id: 'room-201', room_code: 'C-201', name: 'AI & Machine Learning Research Lab', room_type: 'Research Lab', building_name: 'JSSATE Block C', level_number: 2, department: 'Artificial Intelligence & Data Science' },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-950 text-white w-full max-w-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            placeholder="Search room code, lab, office, or building..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-white placeholder-white/40 bg-transparent text-sm font-medium focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-white/50 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs font-mono">
              No matching rooms, departments, or facilities found.
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
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 flex items-center justify-between group transition-all cursor-pointer min-h-[44px]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {room.room_code}
                    </span>
                    <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {room.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1">
                    {room.building_name} • Floor {room.level_number} • {room.department}
                    {room.occupant_name && ` (${room.occupant_name})`}
                  </p>
                </div>
                <div className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Navigate →</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
