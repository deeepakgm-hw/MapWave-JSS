import React, { useState } from 'react';

/**
 * MapSetupScreen — Polished setup screen displayed when MapWave configuration is missing.
 *
 * Explains required environment variables (VITE_MAPTILER_KEY, VITE_CAMPUS_LAT, VITE_CAMPUS_LNG)
 * and provides interactive session override fields for quick local testing.
 */
export function MapSetupScreen({
  configStatus,
  onApplyOverrides,
  onActivateFallback,
}) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput] = useState('');
  const [showSessionInputs, setShowSessionInputs] = useState(false);

  const handleUsePreset = () => {
    // JSSATE Bangalore Campus center preset
    setLatInput('12.9015');
    setLngInput('77.5057');
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (onApplyOverrides) {
      onApplyOverrides({
        apiKey: apiKeyInput.trim(),
        lat: latInput.trim() ? parseFloat(latInput.trim()) : undefined,
        lng: lngInput.trim() ? parseFloat(lngInput.trim()) : undefined,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-stone-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-xl w-full bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header with MapWave Brand */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-blue-400 font-semibold">
                MAPWAVE 3D PLATFORM
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Map Foundation Setup Required
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold uppercase">
            Awaiting Credentials
          </span>
        </div>

        {/* Narrative Description */}
        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            To render the high-resolution 3D satellite campus map, MapWave requires a licensed satellite imagery provider key (<strong className="text-white">MapTiler</strong>) and verified geographic coordinates for your campus center.
          </p>
          <p className="text-slate-400">
            The mapping engine and 3D architectural extrusion pipeline are ready. Configure the environment variables below or enter session credentials to activate the interactive map.
          </p>
        </div>

        {/* Required Configuration Checklist */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
            Required Environment Settings
          </div>

          <div className="grid gap-2">
            {/* 1. MapTiler Key Item */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              configStatus.missingApiKey
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${configStatus.missingApiKey ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <code className="font-mono text-[11px] font-semibold text-white">VITE_MAPTILER_KEY</code>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {configStatus.missingApiKey ? 'Missing (Required)' : 'Configured'}
              </span>
            </div>

            {/* 2. Campus Latitude Item */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              configStatus.missingCoordinates
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${configStatus.missingCoordinates ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <code className="font-mono text-[11px] font-semibold text-white">VITE_CAMPUS_LAT</code>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {configStatus.missingCoordinates ? 'Missing (Required)' : 'Configured'}
              </span>
            </div>

            {/* 3. Campus Longitude Item */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              configStatus.missingCoordinates
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${configStatus.missingCoordinates ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <code className="font-mono text-[11px] font-semibold text-white">VITE_CAMPUS_LNG</code>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {configStatus.missingCoordinates ? 'Missing (Required)' : 'Configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup Instructions Box */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1.5">
          <div className="text-white/50 text-[10px] uppercase tracking-wider">
            How to configure via .env
          </div>
          <div className="text-slate-400"># 1. Create .env from .env.example</div>
          <div className="text-blue-300">VITE_MAPTILER_KEY=your_maptiler_api_key</div>
          <div className="text-blue-300">VITE_CAMPUS_LAT=12.9015</div>
          <div className="text-blue-300">VITE_CAMPUS_LNG=77.5057</div>
          <div className="text-slate-400"># 2. Restart dev server to activate</div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowSessionInputs(!showSessionInputs)}
            className="w-full sm:w-auto flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{showSessionInputs ? 'Hide Session Inputs' : 'Enter Test Credentials'}</span>
          </button>

          {onActivateFallback && (
            <button
              type="button"
              onClick={onActivateFallback}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Development Preview</span>
              <span className="text-[10px] opacity-75 font-mono">→</span>
            </button>
          )}
        </div>

        {/* Session Input Form (Optional Expandable Local Test Panel) */}
        {showSessionInputs && (
          <form onSubmit={handleApply} className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                Session Override (Stored in memory only)
              </span>
              <button
                type="button"
                onClick={handleUsePreset}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
              >
                Insert JSSATE Preset Coordinates
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                MapTiler API Key
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="e.g. your_maptiler_api_key"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="e.g. 12.9015"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="e.g. 77.5057"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Apply & Activate Map
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
