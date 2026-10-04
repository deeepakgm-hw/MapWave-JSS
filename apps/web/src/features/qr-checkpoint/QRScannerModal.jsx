import React, { useState } from 'react';

const MOCK_CHECKPOINTS = [
  { node_id: 'node-block-c-entrance', label: 'Block C Main Entrance QR Tag' },
  { node_id: 'node-block-c-fl2-lift', label: 'Block C Floor 2 Elevator QR Tag' },
  { node_id: 'node-block-c-fl2-stair', label: 'Block C Floor 2 Staircase Landing QR Tag' },
];

export function QRScannerModal({ isOpen, onScanSuccess, onSkipScan }) {
  const [selectedNode, setSelectedNode] = useState(MOCK_CHECKPOINTS[0].node_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-950 text-white w-full max-w-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Indoor QR Checkpoint</h3>
              <p className="text-[11px] text-white/50">Pinpoint floor position indoors</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSkipScan}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          <p className="text-white/70 leading-relaxed">
            GPS accuracy decreases inside physical structures. Scan a wall QR checkpoint tag to pinpoint your exact floor location.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
              Simulated Checkpoint Waypoint
            </label>
            {MOCK_CHECKPOINTS.map((cp) => (
              <button
                key={cp.node_id}
                type="button"
                onClick={() => setSelectedNode(cp.node_id)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all min-h-[44px] flex items-center justify-between cursor-pointer ${
                  selectedNode === cp.node_id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{cp.label}</span>
                {selectedNode === cp.node_id && (
                  <span className="text-blue-400 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onSkipScan}
              className="min-h-[44px] flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Skip Checkpoint
            </button>
            <button
              type="button"
              onClick={() => onScanSuccess(selectedNode)}
              className="min-h-[44px] flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-lg"
            >
              Confirm Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
