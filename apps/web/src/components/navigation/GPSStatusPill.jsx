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
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white active:bg-white text-slate-800 border border-white/85 backdrop-blur-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all cursor-pointer text-xs min-h-[36px]"
      >
        <span className="relative flex items-center justify-center shrink-0">
          {isGpsActive && (
            <span className="absolute w-3 h-3 rounded-full bg-emerald-400 opacity-60 animate-ping" />
          )}
          <span
            className={`w-2 h-2 rounded-full ${
              isGpsLoading
                ? 'bg-blue-600 animate-pulse'
                : isGpsActive
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : 'bg-slate-400'
            }`}
          />
        </span>

        <span className="font-bold text-slate-900 tracking-tight">
          {isGpsLoading
            ? 'Detecting GPS...'
            : isGpsActive
            ? 'GPS Active'
            : 'GPS Inactive'}
        </span>

        {isGpsActive && accuracy !== null && (
          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full font-semibold">
            ±{accuracy}m
          </span>
        )}

        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
          Click to Recenter
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 text-slate-800 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">GPS Telemetry</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                isGpsActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isGpsActive ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-slate-800">
                {isGpsActive ? 'Hardware Geolocation Active' : 'Off / Permission Needed'}
              </span>
            </div>
            {isGpsActive && accuracy !== null && (
              <div className="flex justify-between">
                <span className="text-slate-400">Horizontal Radius:</span>
                <span className="font-mono font-semibold text-emerald-600">±{accuracy} meters</span>
              </div>
            )}
            {gpsLocation?.latitude && (
              <div className="flex justify-between font-mono text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                <span>Lat: {gpsLocation.latitude.toFixed(5)}</span>
                <span>Lng: {gpsLocation.longitude.toFixed(5)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onLocateMe?.();
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
            >
              Recenter
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleGps?.();
                setIsOpen(false);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              {isGpsActive ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GPSStatusPill;
