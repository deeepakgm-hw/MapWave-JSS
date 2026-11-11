import React, { useState } from 'react';

// Floor data for mapped buildings
const BUILDING_FLOOR_DATA = {
  BLOCK_A: {
    floors: [
      { id: 'floor-1', level_number: 1, notes: 'Ground Floor — CSE Programming Labs, Mechanical Workshop & Reception' },
      { id: 'floor-2', level_number: 2, notes: 'Floor 2 — AI Research Center & Robotics Systems Laboratory' },
      { id: 'floor-3', level_number: 3, notes: 'Floor 3 — Information Science Labs, Mechanical CAD/CAM & Seminar Hall' },
    ],
    rooms: {
      'floor-1': [
        { id: 'room-a101', room_code: 'A-101', name: 'Computer Science Programming Lab', room_type: 'Laboratory', department: 'Computer Science & Engineering' },
        { id: 'room-a102', room_code: 'A-102', name: 'ISE Systems & Networking Lab', room_type: 'Laboratory', department: 'Information Science & Engineering' },
        { id: 'room-a103', room_code: 'A-103', name: 'Mechanical Thermodynamics Lab', room_type: 'Laboratory', department: 'Mechanical Engineering' },
      ],
      'floor-2': [
        { id: 'room-a201', room_code: 'A-201', name: 'NVIDIA AI & Deep Learning Lab', room_type: 'Research Lab', department: 'Computer Science & Engineering' },
        { id: 'room-a202', room_code: 'A-202', name: 'Robotics & Automation Prototyping Workshop', room_type: 'Laboratory', department: 'Robotics & Automation' },
        { id: 'room-a203', room_code: 'A-203', name: 'HOD Office — Computing & Robotics', room_type: 'Faculty Office', occupant_name: 'Dr. A. Sharma', department: 'CSE & Robotics' },
      ],
      'floor-3': [
        { id: 'room-a301', room_code: 'A-301', name: 'CAD/CAM & FEA Modeling Centre', room_type: 'Laboratory', department: 'Mechanical Engineering' },
        { id: 'room-a302', room_code: 'A-302', name: 'Information Science Seminar Hall A-302', room_type: 'Auditorium', department: 'Information Science & Engineering' },
        { id: 'room-a303', room_code: 'A-303', name: 'Autonomous Drone Flight Testing Lab', room_type: 'Laboratory', department: 'Robotics & Automation' },
      ],
    },
  },
  BLOCK_B: {
    floors: [
      { id: 'floor-1', level_number: 1, notes: 'Ground Floor — Central Library Stacks, Circulation Desk & Digital Reading' },
      { id: 'floor-2', level_number: 2, notes: 'Floor 2 — Electronics & Communication (ECE) Labs & VLSI Design' },
      { id: 'floor-3', level_number: 3, notes: 'Floor 3 — Electronics & Instrumentation (EIE) Labs & Sensors Wing' },
    ],
    rooms: {
      'floor-1': [
        { id: 'room-b101', room_code: 'B-101', name: 'Central Library Reference Stack & Circulation', room_type: 'Library', department: 'Central Library' },
        { id: 'room-b102', room_code: 'B-102', name: 'Digital Learning Resource Centre', room_type: 'Digital Stack', department: 'Central Library' },
      ],
      'floor-2': [
        { id: 'room-b201', room_code: 'B-201', name: 'VLSI & Embedded Systems Design Lab', room_type: 'Laboratory', department: 'ECE' },
        { id: 'room-b202', room_code: 'B-202', name: 'Digital Signal Processing (DSP) Lab', room_type: 'Laboratory', department: 'ECE' },
        { id: 'room-b203', room_code: 'B-203', name: 'ECE Department HOD Chamber', room_type: 'Faculty Office', occupant_name: 'Dr. B. K. Ramesh', department: 'ECE' },
      ],
      'floor-3': [
        { id: 'room-b301', room_code: 'B-301', name: 'Sensors & Process Instrumentation Lab', room_type: 'Laboratory', department: 'EIE' },
        { id: 'room-b302', room_code: 'B-302', name: 'Industrial Automation & PLC Lab', room_type: 'Laboratory', department: 'EIE' },
      ],
    },
  },
  BLOCK_CIVIL: {
    floors: [
      { id: 'floor-1', level_number: 1, notes: 'Ground Floor — Concrete Testing Lab & Heavy Structural Mechanics' },
      { id: 'floor-2', level_number: 2, notes: 'Floor 2 — Soil Mechanics, Geotechnical & Highway Engineering Lab' },
      { id: 'floor-3', level_number: 3, notes: 'Floor 3 — Total Station Surveying & Environmental Engineering Lab' },
      { id: 'floor-4', level_number: 4, notes: 'Floor 4 — Computer-Aided Civil Design, GIS & Faculty Chambers' },
    ],
    rooms: {
      'floor-1': [
        { id: 'room-cv101', room_code: 'CV-101', name: 'Structural Materials & Concrete Testing Lab', room_type: 'Laboratory', department: 'Civil Engineering' },
        { id: 'room-cv102', room_code: 'CV-102', name: 'Hydraulics & Fluid Mechanics Facility', room_type: 'Laboratory', department: 'Civil Engineering' },
      ],
      'floor-2': [
        { id: 'room-cv201', room_code: 'CV-201', name: 'Geotechnical & Soil Mechanics Testing Lab', room_type: 'Laboratory', department: 'Civil Engineering' },
        { id: 'room-cv202', room_code: 'CV-202', name: 'Highway & Transportation Materials Lab', room_type: 'Laboratory', department: 'Civil Engineering' },
      ],
      'floor-3': [
        { id: 'room-cv301', room_code: 'CV-301', name: 'Advanced Geomatics & Total Station Lab', room_type: 'Laboratory', department: 'Civil Engineering' },
        { id: 'room-cv302', room_code: 'CV-302', name: 'Environmental Water Quality Testing Lab', room_type: 'Laboratory', department: 'Civil Engineering' },
        { id: 'room-cv303', room_code: 'CV-303', name: 'Civil HOD Office & Faculty Chambers', room_type: 'Faculty Office', occupant_name: 'Dr. S. Patil', department: 'Civil Engineering' },
      ],
      'floor-4': [
        { id: 'room-cv401', room_code: 'CV-401', name: 'STAAD.Pro & Civil CAD Drafting Centre', room_type: 'Computer Lab', department: 'Civil Engineering' },
        { id: 'room-cv402', room_code: 'CV-402', name: 'GIS & Remote Sensing Mapping Studio', room_type: 'Research Lab', department: 'Civil Engineering' },
      ],
    },
  },
};

const DEFAULT_FLOORS = [
  { id: 'floor-1', level_number: 1, notes: 'Ground Floor — Reception & Core Department Laboratories' },
  { id: 'floor-2', level_number: 2, notes: 'Floor 2 — Research Centers & Faculty Offices' },
  { id: 'floor-3', level_number: 3, notes: 'Floor 3 — Smart Classrooms & Seminar Halls' },
];

export function IndoorMapView({ selectedBuilding, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [activeFloorId, setActiveFloorId] = useState(selectedFloor?.id || 'floor-1');
  const [opacity, setOpacity] = useState(1);

  // Normalize building code
  const code = (selectedBuilding?.code || '').toUpperCase();
  const name = (selectedBuilding?.name || '').toUpperCase();
  const bData =
    code.includes('CIVIL') || name.includes('CIVIL')
      ? BUILDING_FLOOR_DATA.BLOCK_CIVIL
      : code === 'BLOCK_B' || name.includes('BLOCK B') || code === 'LIBRARY'
      ? BUILDING_FLOOR_DATA.BLOCK_B
      : BUILDING_FLOOR_DATA.BLOCK_A;

  const floors = bData?.floors || DEFAULT_FLOORS;
  const roomsMap = bData?.rooms || {};

  const isIndoorReady =
    selectedBuilding?.indoor_mapping_status === 'available' ||
    !selectedBuilding?.indoor_mapping_status ||
    selectedBuilding?.code === 'BLOCK_A' ||
    selectedBuilding?.code === 'BLOCK_B' ||
    selectedBuilding?.code === 'BLOCK_CIVIL' ||
    selectedBuilding?.code === 'BLOCK_C' ||
    selectedBuilding?.name?.includes('Block');

  // 200ms smooth cross-fade when switching floors
  const handleFloorChange = (floor) => {
    setOpacity(0.2);
    setTimeout(() => {
      setActiveFloorId(floor.id);
      onSelectFloor(floor);
      setOpacity(1);
    }, 200);
  };

  const rooms = roomsMap[activeFloorId] || roomsMap['floor-1'] || [];
  const currentFloorObj = floors.find((f) => f.id === activeFloorId) || floors[0] || { notes: 'Select a floor' };

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
          {floors.map((floor) => {
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
