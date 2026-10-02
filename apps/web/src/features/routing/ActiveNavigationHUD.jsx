import React, { useState } from 'react';

const STEPS = [
  { text: 'Head north along Outdoor Quadrangle path for 50 meters', dist: '50m' },
  { text: 'Enter Block C Main Glass Entrance door', dist: '10m' },
  { text: 'Take elevator/stairs to Floor 2', dist: 'Vertical' },
  { text: 'Turn right at corridor junction towards Room C-201', dist: '15m' },
  { text: 'Destination C-201 is on your left!', dist: 'Arrived' },
];

export function ActiveNavigationHUD({ destination, lastAnchor, onTriggerReanchor, onFinish }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const currentStep = STEPS[currentStepIdx];
  const isFinalStep = currentStepIdx === STEPS.length - 1;

  const handleNextStep = () => {
    if (isFinalStep) {
      onFinish();
    } else {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Live Accessibility Screen Reader Announcement Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Navigation step ${currentStepIdx + 1} of ${STEPS.length}: ${currentStep.text}`}
      </div>

      {/* Active Instruction Header Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl font-bold text-blue-300 shrink-0">
            ➔
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
              Step {currentStepIdx + 1} of {STEPS.length}
            </span>
            <h3 className="text-sm font-bold text-white leading-snug">
              {currentStep.text}
            </h3>
          </div>
        </div>
        <div className="text-right shrink-0 pl-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            {currentStep.dist}
          </span>
        </div>
      </div>

      {/* Anchor Status Indicator */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className={`w-2 h-2 rounded-full ${lastAnchor?.source === 'qr' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`} />
          <span>
            {lastAnchor?.source === 'qr' ? 'QR Checkpoint Anchored' : 'GPS Location Tracking'}
          </span>
        </div>
        <button
          type="button"
          onClick={onTriggerReanchor}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 underline min-h-[44px] px-2 flex items-center"
        >
          Scan QR Checkpoint
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
          disabled={currentStepIdx === 0}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            currentStepIdx === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="min-h-[44px] flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <span>{isFinalStep ? '🏁 Arrived at Destination' : 'Next Step →'}</span>
        </button>
      </div>
    </div>
  );
}
