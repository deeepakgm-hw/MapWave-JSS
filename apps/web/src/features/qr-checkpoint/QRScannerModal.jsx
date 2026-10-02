import React, { useState } from 'react';

const MOCK_CHECKPOINTS = [
  { node_id: 'node-block-c-entrance', label: 'Block C Main Entrance Wall Checkpoint' },
  { node_id: 'node-block-c-fl2-lift', label: 'Block C Floor 2 Elevator Pillar' },
  { node_id: 'node-block-c-fl2-stair', label: 'Block C Floor 2 Staircase Landing' },
];

export function QRScannerModal({ isOpen, onScanSuccess, onSkipScan }) {
  const [selectedNode, setSelectedNode] = useState(MOCK_CHECKPOINTS[0].node_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl">
              📷
            </div>
            <div>
              <h3 className="text-base font-extrabold">Indoor QR Re-Anchor</h3>
              <p className="text-xs text-blue-200">Low GPS Confidence Detected Indoors</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed font-medium">
            ⚠️ Standard GPS signals are weak inside building structures. Scan a wall QR checkpoint tag to pinpoint your exact floor location.
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Simulated Checkpoint Node:
            </label>
            {MOCK_CHECKPOINTS.map((cp) => (
              <button
                key={cp.node_id}
                type="button"
                onClick={() => setSelectedNode(cp.node_id)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all min-h-[44px] flex items-center justify-between ${
                  selectedNode === cp.node_id
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cp.label}</span>
                {selectedNode === cp.node_id && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onSkipScan}
              className="min-h-[44px] flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Skip (Degraded GPS)
            </button>
            <button
              type="button"
              onClick={() => onScanSuccess(selectedNode)}
              className="min-h-[44px] flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Confirm Scan ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
