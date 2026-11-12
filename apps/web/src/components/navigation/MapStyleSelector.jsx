import React, { useState, useRef, useEffect } from 'react';
import { MAP_PROVIDERS } from '../../config/mapConfig';

export function MapStyleSelector({ currentProvider = MAP_PROVIDERS.GOOGLE, onSwitchProvider }) {
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

  if (!onSwitchProvider) return null;

  const getStyleLabel = () => {
    switch (currentProvider) {
      case MAP_PROVIDERS.GOOGLE:
        return 'Google Satellite';
      case MAP_PROVIDERS.ESRI:
        return 'Esri 30cm HD';
      case MAP_PROVIDERS.MAPLIBRE:
        return 'MapLibre Streets';
      case MAP_PROVIDERS.MAPTILER:
        return 'MapTiler Satellite';
      case MAP_PROVIDERS.TOPO:
        return '3D Interactive';
      default:
        return 'Satellite';
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Map style selector"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.18] text-white border border-white/10 text-xs font-semibold tracking-wide transition-all cursor-pointer min-h-[34px]"
      >
        <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span className="truncate max-w-[120px]">{getStyleLabel()}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-60 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 flex flex-col gap-1 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Satellite & Aerial
          </div>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.GOOGLE);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.GOOGLE
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <div>
              <div className="font-semibold text-white">Google Ultra-HD</div>
              <div className="text-[10px] text-slate-400">Sub-meter aerial satellite</div>
            </div>
            {currentProvider === MAP_PROVIDERS.GOOGLE && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.ESRI);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.ESRI
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <div>
              <div className="font-semibold text-white">Esri World Imagery</div>
              <div className="text-[10px] text-slate-400">30cm Maxar high-res aerial</div>
            </div>
            {currentProvider === MAP_PROVIDERS.ESRI && <span>✓</span>}
          </button>

          <div className="my-1 border-t border-white/10" />

          <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Vector & Cartography
          </div>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.MAPLIBRE);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.MAPLIBRE
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>MapLibre Streets</span>
                <span className="px-1 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">OSM</span>
              </div>
              <div className="text-[10px] text-slate-400">Clean OpenStreetMap cartography</div>
            </div>
            {currentProvider === MAP_PROVIDERS.MAPLIBRE && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.TOPO);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.TOPO
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>3D Interactive Mesh</span>
                <span className="px-1 rounded bg-amber-400 text-black text-[9px] font-mono font-bold">GLB</span>
              </div>
              <div className="text-[10px] text-slate-400">Three.js 3D campus model</div>
            </div>
            {currentProvider === MAP_PROVIDERS.TOPO && <span>✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
