import React from 'react';

export function AdminDashboard({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">Campus Admin Dashboard</h3>
            <p className="text-xs text-blue-200">Building, Room & Occupant Management</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin dashboard"
            className="min-h-[44px] min-w-[44px] p-2 text-white/80 hover:text-white rounded-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="text-2xl font-black text-blue-900">12</div>
              <div className="text-xs font-bold text-blue-700 mt-1">Campus Buildings</div>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <div className="text-2xl font-black text-indigo-900">148</div>
              <div className="text-xs font-bold text-indigo-700 mt-1">Mapped Rooms</div>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="text-2xl font-black text-emerald-900">32</div>
              <div className="text-xs font-bold text-emerald-700 mt-1">QR Checkpoints</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Admin management console for floorplan vector upload, room code assignments, occupant directory editing, and network graph node linking.
          </p>
        </div>
      </div>
    </div>
  );
}
