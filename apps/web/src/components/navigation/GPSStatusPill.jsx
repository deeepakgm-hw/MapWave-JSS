import React, { useState, useRef, useEffect } from 'react';

export function GPSStatusPill({
  isGpsActive = false,
  isGpsLoading = false,
  gpsLocation = null,
  onLocateMe,
  onToggleGps,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const accuracy = gpsLocation?.accuracy ? Math.round(gpsLocation.accuracy) : null;

  return (
    <div className="relative inline-flex items-center shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isGpsActive ? 'GPS is active. Click for location details.' : 'Click to view GPS status.'}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/75 hover:bg-slate-900/90 active:bg-slate-900 text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg transition-all cursor-pointer text-xs"
      >
        <span className="relative flex items-center justify-center">
          {isGpsActive && (
            <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 opacity-60 animate-ping" />
          )}
          <span
            className={`w-2 h-2 rounded-full ${
              isGpsLoading
                ? 'bg-blue-400 animate-pulse'
                : isGpsActive
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : 'bg-slate-400'
            }`}
          />
        </span>

        <span className="font-semibold text-white tracking-tight">
          {isGpsLoading
            ? 'Detecting GPS...'
            : isGpsActive
            ? 'GPS Active'
            : 'GPS Inactive'}
        </span>

        {isGpsActive && accuracy !== null && (
          <>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold">
              ±{accuracy}m
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 text-slate-200 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-xs font-bold text-white">Geolocation Telemetry</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                isGpsActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isGpsActive ? 'High Accuracy' : 'Offline'}
            </span>
          </div>

          {gpsLocation ? (
            <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Latitude:</span>
                <span className="font-semibold">{gpsLocation.latitude.toFixed(5)}° N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Longitude:</span>
                <span className="font-semibold">{gpsLocation.longitude.toFixed(5)}° E</span>
              </div>
              {accuracy !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Accuracy Radius:</span>
                  <span className="text-emerald-400 font-semibold">±{accuracy} meters</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              GPS location permission has not been granted yet, or signal is acquiring. Click below to enable tracking.
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onToggleGps) onToggleGps();
                else if (onLocateMe) onLocateMe();
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              {isGpsActive ? 'Recenter on Me' : 'Turn on GPS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
