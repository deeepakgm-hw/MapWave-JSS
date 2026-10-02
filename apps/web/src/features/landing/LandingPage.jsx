import React, { useState, useEffect } from 'react';

export function LandingPage({ onExplore }) {
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveredExplore, setIsHoveredExplore] = useState(false);

  // Subtle interactive parallax effect based on cursor position
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* 1. Dramatic Aerial Earth / Satellite Texture Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%), url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3796/5826')`,
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px) scale(1.08)`,
        }}
      />

      {/* Earth Texture & Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-amber-950/30 to-stone-950/80 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] pointer-events-none" />

      {/* 2. Atmospheric Drifting Soft Clouds (Left & Right) */}
      <div
        className="absolute -left-20 top-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out animate-pulse"
        style={{
          transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)`,
        }}
      />
      <div
        className="absolute -right-20 top-1/3 w-[32rem] h-[32rem] bg-white/25 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px)`,
        }}
      />

      {/* 3. Top-Left Institutional Logos & Information */}
      <div className="absolute top-8 left-8 z-20 flex items-start gap-4 text-white/90">
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-xl shadow-lg">
          🏛️
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              JSS Mahavidyapeetha
            </span>
            <span className="text-white/40">•</span>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              Autonomous
            </span>
          </div>
          <h2 className="text-xs font-extrabold text-white tracking-wide">
            JSS Academy of Technical Education, Bangalore
          </h2>
          <p className="text-[10px] text-white/60 tracking-wider">
            Campus Spatial Intelligence & 3D Navigation Platform
          </p>
        </div>
      </div>

      {/* Top-Right Coordinates & Info Badge */}
      <div className="absolute top-8 right-8 z-20 hidden sm:flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 text-[10px] font-mono tracking-widest">
          12.9015° N, 77.5057° E • UTM 43N
        </div>
      </div>

      {/* 4. Center Hero Section: "MAPWAVE - JSSATE" with Custom Typographic Arrows */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        {/* Main Display Title */}
        <div
          className="relative flex flex-col items-center cursor-default transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
          }}
        >
          {/* MAPWAVE Line 1 */}
          <div className="relative flex items-center justify-center">
            <span className="text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] select-none">
              MAPWAVE
            </span>
            {/* Navigational curved arrow motif */}
            <svg
              className="absolute -right-8 -top-4 w-16 h-16 sm:w-24 sm:h-24 text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          {/* JSSATE Line 2 */}
          <div className="relative -mt-3 sm:-mt-6 flex items-center justify-center">
            {/* Left reverse directional arrow */}
            <svg
              className="absolute -left-8 -bottom-2 w-14 h-14 sm:w-20 sm:h-20 text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] select-none">
              JSSATE
            </span>
          </div>
        </div>

        {/* 5. Experience Fidelity Selector */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center max-w-md w-full">
          <p className="text-xs sm:text-sm font-medium text-white/80 italic tracking-wide mb-4 font-serif">
            Please select your map experience.
          </p>

          {/* Topographic Contour Wireframe Graphic */}
          <div className="w-48 sm:w-64 h-14 relative flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 200 60"
              className="w-full h-full text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              fill="none"
              stroke="currentColor"
            >
              {/* Topographic contour curves */}
              <path
                d="M10 50 Q 50 48, 100 25 T 190 50"
                strokeWidth={1}
                className="opacity-40"
              />
              <path
                d="M20 50 Q 65 42, 100 18 T 180 50"
                strokeWidth={1.2}
                className="opacity-60"
              />
              <path
                d="M35 50 Q 75 35, 100 12 T 165 50"
                strokeWidth={1.5}
                className="opacity-80"
              />
              <path
                d="M55 50 Q 85 28, 100 6 T 145 50"
                strokeWidth={1.8}
                className="text-amber-300 opacity-90"
              />
            </svg>
          </div>

          {/* Quality Mode Selectors (Low / Medium / High) */}
          <div className="flex items-center justify-between w-48 sm:w-64 px-2 py-1 border-t border-white/20 text-xs font-semibold">
            {['Low', 'Medium', 'High'].map((quality) => {
              const isActive = selectedQuality === quality;
              return (
                <button
                  key={quality}
                  type="button"
                  onClick={() => setSelectedQuality(quality)}
                  className={`min-h-[44px] px-2 py-1 cursor-pointer transition-all ${
                    isActive
                      ? 'text-white font-black scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <span className={isActive ? 'border-b-2 border-white pb-0.5' : ''}>
                    {quality}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 6. Capsule Pill Explore Button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => onExplore(selectedQuality)}
              onMouseEnter={() => setIsHoveredExplore(true)}
              onMouseLeave={() => setIsHoveredExplore(false)}
              className="min-h-[44px] px-10 py-2.5 rounded-full border border-white/70 bg-white/10 hover:bg-white text-white hover:text-black font-extrabold text-xs tracking-widest uppercase backdrop-blur-md transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95 flex items-center gap-2 group cursor-pointer"
            >
              <span>EXPLORE</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1 font-bold">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Subtle Attribution Text */}
      <div className="absolute bottom-4 inset-x-0 text-center text-[10px] font-medium text-white/40 tracking-wider z-20">
        POWERED BY ESRI HIGH-RES SATELLITE • AUTONOMOUS CAMPUS SPATIAL GRAPH
      </div>
    </div>
  );
}
