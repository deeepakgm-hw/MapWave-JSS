import React from 'react';

export function AdminDashboard({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-950 text-white w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus Spatial Administration</h3>
            <p className="text-[11px] text-white/50">Building geometry, room metadata & navigation graph</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin dashboard"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-2xl font-mono font-bold text-white">4</div>
              <div className="text-[11px] text-white/60 mt-1">Campus Blocks</div>
            </div>
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-2xl font-mono font-bold text-blue-400">148</div>
              <div className="text-[11px] text-white/60 mt-1">Mapped Rooms</div>
            </div>
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-2xl font-mono font-bold text-emerald-400">32</div>
              <div className="text-[11px] text-white/60 mt-1">QR Checkpoints</div>
            </div>
          </div>
          <p className="text-white/60 leading-relaxed">
            Spatial administration console for floorplan vector upload, room code assignments, occupant directory editing, and UTM 43N navigation network graph validation.
          </p>
        </div>
      </div>
    </div>
  );
}
