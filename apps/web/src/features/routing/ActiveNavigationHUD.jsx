import React, { useState } from 'react';

const STEPS = [
  { text: 'Walk along Central Walkway towards Block C for 50 meters', dist: '50m' },
  { text: 'Enter Block C Main Glass Entrance', dist: '10m' },
  { text: 'Proceed to elevator or staircase to Floor 2', dist: 'Floor transition' },
  { text: 'Turn right at corridor junction towards Room C-201', dist: '15m' },
  { text: 'Arrive at destination Room C-201 on your left', dist: 'Arrived' },
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
    <div className="flex flex-col gap-3.5">
      {/* Live Accessibility Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${currentStepIdx + 1} of ${STEPS.length}: ${currentStep.text}`}
      </div>

      {/* Turn-by-Turn Card */}
      <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-blue-300">
              Step {currentStepIdx + 1} of {STEPS.length}
            </div>
            <div className="text-xs font-semibold text-white leading-snug">
              {currentStep.text}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 pl-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-emerald-500/30">
            {currentStep.dist}
          </span>
        </div>
      </div>

      {/* Checkpoint Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${lastAnchor?.source === 'qr' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
          <span className="text-[11px]">
            {lastAnchor?.source === 'qr' ? 'Indoor QR Checkpoint Anchored' : 'Outdoor GPS Tracking'}
          </span>
        </div>

        <button
          type="button"
          onClick={onTriggerReanchor}
          className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline cursor-pointer"
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
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentStepIdx === 0
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
          }`}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="min-h-[44px] flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{isFinalStep ? 'Arrived at Destination' : 'Next Step'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
