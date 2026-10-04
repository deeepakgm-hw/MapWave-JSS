import React, { useState, useEffect } from 'react';

export function LandingPage({ onExplore }) {
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle interactive parallax effect based on cursor position
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 15;
      const y = (e.clientY / innerHeight - 0.5) * 15;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-stone-950 font-sans">
      {/* 1. Aerial Satellite Earth Terrain Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(15, 23, 42, 0.15) 0%, rgba(12, 10, 9, 0.75) 100%), url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3796/5826')`,
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px) scale(1.06)`,
        }}
      />

      {/* Earth Texture & Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-amber-950/20 to-stone-950/75 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* 2. Soft Atmospheric Drifting Clouds */}
      <div
        className="absolute -left-24 top-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px)`,
        }}
      />
      <div
        className="absolute -right-24 top-1/3 w-[30rem] h-[30rem] bg-white/15 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
        }}
      />

      {/* 3. Top-Left Header: Institutional Information */}
      <div className="absolute top-8 left-8 z-20 flex items-start gap-3.5 text-white/90">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shadow-lg">
          <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-200/90 uppercase">
              JSSATE
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] tracking-wider text-white/60 uppercase">
              Autonomous
            </span>
          </div>
          <h2 className="text-xs font-semibold text-white tracking-wide">
            JSS Academy of Technical Education, Bangalore
          </h2>
        </div>
      </div>

      {/* Top-Right Geographic Tag */}
      <div className="absolute top-8 right-8 z-20 hidden sm:flex items-center">
        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/70 text-[10px] font-mono tracking-widest">
          12.9015° N, 77.5057° E • UTM 43N
        </div>
      </div>

      {/* 4. Center Hero Section: MAPWAVE */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div
          className="relative flex flex-col items-center cursor-default transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -0.25}deg) rotateY(${mousePos.x * 0.25}deg)`,
          }}
        >
          {/* Main Title: MAPWAVE with Navigation Wave Arrow Motif */}
          <div className="relative flex items-center justify-center">
            <span className="text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-tight uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] select-none">
              MAPWAVE
            </span>
            <svg
              className="absolute -right-6 -top-3 w-14 h-14 sm:w-20 sm:h-20 text-white/80 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* Subtitle from Master Prompt */}
          <h3 className="mt-2 text-xl sm:text-2xl font-serif text-white/90 italic tracking-wide">
            Explore your campus.
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-md font-sans tracking-wide">
            Find buildings, discover rooms, and navigate your way around campus.
          </p>
        </div>

        {/* 5. Experience Fidelity Selector (Reference Site Pattern) */}
        <div className="mt-10 sm:mt-14 flex flex-col items-center max-w-xs w-full">
          <p className="text-xs sm:text-sm text-white/80 font-serif italic tracking-wide mb-3">
            Please select your map experience.
          </p>

          {/* Topographic Contour Mountain Elevation Wireframe Graphic */}
          <div className="w-56 h-12 relative flex items-center justify-center mb-2">
            <svg viewBox="0 0 200 60" className="w-full h-full text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" fill="none" stroke="currentColor">
              <path d="M10 50 Q 50 48, 100 25 T 190 50" strokeWidth={1} className="opacity-40" />
              <path d="M20 50 Q 65 42, 100 18 T 180 50" strokeWidth={1.2} className="opacity-60" />
              <path d="M35 50 Q 75 35, 100 12 T 165 50" strokeWidth={1.5} className="opacity-80" />
              <path d="M55 50 Q 85 28, 100 6 T 145 50" strokeWidth={1.75} className="text-amber-200 opacity-95" />
            </svg>
          </div>

          {/* Quality Mode Pickers (Low / Medium / High) */}
          <div className="flex items-center justify-between w-56 px-2 py-1 text-xs font-semibold text-white">
            {['Low', 'Medium', 'High'].map((quality) => {
              const isActive = selectedQuality === quality;
              return (
                <div
                  key={quality}
                  onClick={() => setSelectedQuality(quality)}
                  className={`resolution_picker ${isActive ? 'active text-white' : 'text-white/60'}`}
                >
                  <span className="font-serif text-sm tracking-wide">{quality}</span>
                  <div className="selected_underline" />
                </div>
              );
            })}
          </div>

          {/* 6. Primary Action: Explore Campus (Ghost Button Aesthetic from Reference) */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => onExplore(selectedQuality)}
              className="ghostbutton min-h-[44px] px-8 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase cursor-pointer transition-all duration-300"
            >
              Explore Campus
            </button>
          </div>
        </div>
      </div>

      {/* Footer Subtle Tagline */}
      <div className="absolute bottom-5 inset-x-0 text-center text-[10px] font-mono tracking-widest text-white/40 uppercase z-20">
        MapWave • Explore. Navigate. Discover.
      </div>
    </div>
  );
}
