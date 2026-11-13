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
        return 'Google Ultra-HD';
      case MAP_PROVIDERS.ESRI:
        return 'Esri World Imagery';
      case MAP_PROVIDERS.MAPLIBRE:
        return 'MapLibre Maps';
      case MAP_PROVIDERS.MAPTILER:
        return 'MapTiler Satellite';
      case MAP_PROVIDERS.TOPO:
        return 'Campus 3D Models';
      default:
        return 'Google Ultra-HD';
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Reference White Glassmorphic Pill Button matching Image 2 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Map style selector"
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white active:bg-white text-slate-900 border border-white/85 shadow-[0_8px_25px_rgba(0,0,0,0.08)] text-xs font-semibold tracking-wide transition-all cursor-pointer min-h-[36px]"
      >
        {/* Emerald vertical pill indicator */}
        <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] shrink-0" />
        <span className="truncate max-w-[120px] font-semibold text-slate-900">{getStyleLabel()}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Satellite & Cartography
          </div>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.GOOGLE);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.GOOGLE
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div>
              <div className="font-semibold">Google Ultra-HD</div>
              <div className={`text-[10px] ${currentProvider === MAP_PROVIDERS.GOOGLE ? 'text-white/80' : 'text-slate-400'}`}>
                Sub-meter aerial satellite
              </div>
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
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div>
              <div className="font-semibold">Esri World Imagery</div>
              <div className={`text-[10px] ${currentProvider === MAP_PROVIDERS.ESRI ? 'text-white/80' : 'text-slate-400'}`}>
                30cm Maxar HD clarity
              </div>
            </div>
            {currentProvider === MAP_PROVIDERS.ESRI && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.MAPLIBRE);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.MAPLIBRE
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div>
              <div className="font-semibold flex items-center gap-1.5">
                <span>MapLibre Streets</span>
                <span className={`text-[9px] font-mono uppercase px-1 rounded font-bold ${
                  currentProvider === MAP_PROVIDERS.MAPLIBRE ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>OSM</span>
              </div>
              <div className={`text-[10px] ${currentProvider === MAP_PROVIDERS.MAPLIBRE ? 'text-white/80' : 'text-slate-400'}`}>
                Fast vector cartography
              </div>
            </div>
            {currentProvider === MAP_PROVIDERS.MAPLIBRE && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.MAPTILER);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.MAPTILER
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div>
              <div className="font-semibold">MapTiler Satellite</div>
              <div className={`text-[10px] ${currentProvider === MAP_PROVIDERS.MAPTILER ? 'text-white/80' : 'text-slate-400'}`}>
                Global cloudless satellite
              </div>
            </div>
            {currentProvider === MAP_PROVIDERS.MAPTILER && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchProvider(MAP_PROVIDERS.TOPO);
              setIsOpen(false);
            }}
            className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
              currentProvider === MAP_PROVIDERS.TOPO
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div>
              <div className="font-semibold flex items-center gap-1.5">
                <span>Campus 3D Models</span>
                <span className={`text-[9px] font-mono uppercase px-1 rounded font-bold ${
                  currentProvider === MAP_PROVIDERS.TOPO ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>GLB</span>
              </div>
              <div className={`text-[10px] ${currentProvider === MAP_PROVIDERS.TOPO ? 'text-white/80' : 'text-slate-400'}`}>
                3D building geometry
              </div>
            </div>
            {currentProvider === MAP_PROVIDERS.TOPO && <span>✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

export default MapStyleSelector;
