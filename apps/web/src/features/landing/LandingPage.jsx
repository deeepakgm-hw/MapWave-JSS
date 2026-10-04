import React, { useState, useEffect } from 'react';

export function LandingPage({ onExplore }) {
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive 3D cursor parallax effect
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
    <div className="relative w-screen h-screen overflow-hidden select-none bg-stone-950 font-sans">
      {/* 1. JSSATE Bangalore Campus Aerial Photo Background (Second Image) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
        style={{
          backgroundImage: `url('/jssate_campus_bg.png')`,
          transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px) scale(1.06)`,
        }}
      />

      {/* Cinematic Earthy Vignette & Lighting Filter matching Reference Site */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(30, 20, 10, 0.15) 0%, rgba(20, 12, 6, 0.6) 70%, rgba(12, 7, 3, 0.88) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/60 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* 2. REAL VOLUMETRIC CLOUDS WITH AUTHENTIC ANIMATIONS (from thekenyamap.com) */}
      {/* High-Altitude Drifting Background Cloud */}
      <div
        className="absolute top-6 left-0 pointer-events-none opacity-40 mix-blend-screen z-10 cloud-animate-drift"
        style={{
          width: '420px',
        }}
      >
        <img
          src="/cloud_1.png"
          alt=""
          className="w-full h-auto filter blur-[1px] brightness-110"
        />
      </div>

      {/* Real Cloud 1: Giant Volumetric Fluffy Cloud Bank (Left Side) */}
      <div
        className="absolute -top-6 -left-16 sm:-left-12 md:left-2 pointer-events-none z-10 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.4}px)`,
        }}
      >
        <div
          className="cloud-animate-left"
          style={{
            width: 'clamp(340px, 45vw, 680px)',
          }}
        >
          <img
            src="/cloud_1.png"
            alt="Atmospheric cloud"
            className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)] brightness-105 contrast-105 select-none"
            draggable="false"
          />
        </div>
      </div>

      {/* Real Cloud 2: Giant Volumetric Fluffy Cloud Bank (Right Side) */}
      <div
        className="absolute top-1/4 sm:top-1/3 -right-20 sm:-right-12 md:right-0 pointer-events-none z-10 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.45}px, ${mousePos.y * 0.5}px)`,
        }}
      >
        <div
          className="cloud-animate-right"
          style={{
            width: 'clamp(360px, 50vw, 760px)',
          }}
        >
          <img
            src="/cloud_1.png"
            alt="Atmospheric cloud"
            className="w-full h-auto drop-shadow-[0_25px_40px_rgba(0,0,0,0.45)] brightness-105 contrast-105 select-none"
            draggable="false"
          />
        </div>
      </div>

      {/* 3. Top-Left Header: Halfwave Platform Logo beside JSSATE Bangalore */}
      <div className="absolute top-6 sm:top-7 left-6 sm:left-7 z-20 flex items-center gap-3 sm:gap-4 text-white/90">
        {/* Halfwave Platform Brand Logo */}
        <div className="flex items-center">
          <img
            src="/halfwave_logo.png"
            alt="Halfwave"
            className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Minimalist Vertical Divider matching Reference Site */}
        <div className="h-6 w-[1px] bg-white/25 shrink-0" />

        {/* JSSATE Bangalore Campus Entity */}
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest text-amber-200/90 uppercase font-bold">
                Campus Portal
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] tracking-wider text-white/70 uppercase">
                Bengaluru
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-white/95 tracking-wide whitespace-nowrap drop-shadow-sm">
              JSS Academy of Technical Education
            </span>
          </div>
        </div>
      </div>

      {/* Top-Right Geographic Tag */}
      <div className="absolute top-7 right-7 z-20 hidden sm:flex items-center">
        <div className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/75 text-[10px] font-mono tracking-widest">
          12.9015° N, 77.5057° E • UTM 43N
        </div>
      </div>

      {/* 4. Center Hero Section: Chunky Stylized Title Matching First Image */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div
          className="relative flex flex-col items-center cursor-default transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -0.2}deg) rotateY(${mousePos.x * 0.2}deg)`,
          }}
        >
          {/* Main Title Stack in Chunky Kenya-Kortet Style Font */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Word 1: MAPWAVE with Integrated Navigation Arrow */}
            <div className="relative flex items-center justify-center">
              <span className="font-kenya-title text-6xl sm:text-8xl md:text-9xl text-white tracking-wider drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] select-none">
                MAPWAVE
              </span>
              {/* Bent Navigation Arrow */}
              <svg
                className="absolute -bottom-3 sm:-bottom-4 right-1 sm:right-4 w-28 sm:w-36 md:w-44 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] pointer-events-none"
                viewBox="0 0 160 32"
                fill="currentColor"
              >
                <path d="M10 16 L120 16 L114 8 L148 16 L114 24 L120 18 L10 18 Z" />
              </svg>
            </div>

            {/* Word 2: JSSATE with Horizontal Lower Navigation Arrow */}
            <div className="relative flex items-center justify-center -mt-2 sm:-mt-4">
              <span className="font-kenya-title text-6xl sm:text-8xl md:text-9xl text-white tracking-wider drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] select-none">
                JSSATE
              </span>
              {/* Long Bottom Navigation Arrow */}
              <svg
                className="absolute -bottom-4 sm:-bottom-6 left-2 sm:left-6 w-44 sm:w-60 md:w-72 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] pointer-events-none"
                viewBox="0 0 240 32"
                fill="currentColor"
              >
                <path d="M0 6 L180 6 L174 0 L216 10 L174 20 L180 14 L0 14 Z" />
              </svg>
            </div>
          </div>

          {/* Subtitle from First Image: Serif Italic */}
          <p className="mt-8 sm:mt-10 text-base sm:text-lg text-white/95 font-serif italic tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Please select your map experience.
          </p>

          {/* 5. Mountain Topographic Elevation Contour Wireframe Graphic */}
          <div className="w-64 sm:w-72 h-14 relative flex items-center justify-center mt-3 mb-1">
            <svg
              viewBox="0 0 240 70"
              className="w-full h-full text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
              fill="none"
              stroke="currentColor"
            >
              {/* Layer 1: Base Contour */}
              <path
                d="M5 60 Q 40 56, 80 50 T 150 48 T 235 60"
                strokeWidth={1}
                className="opacity-40"
              />
              {/* Layer 2: Lower Ridge */}
              <path
                d="M15 60 Q 55 52, 95 38 T 165 36 T 225 60"
                strokeWidth={1.2}
                className="opacity-60"
              />
              {/* Layer 3: Mid Ridge */}
              <path
                d="M30 60 Q 75 42, 115 24 T 175 22 T 210 60"
                strokeWidth={1.5}
                className={selectedQuality !== 'Low' ? 'opacity-85 text-amber-100' : 'opacity-40'}
              />
              {/* Layer 4: Mountain Peak Ridge */}
              <path
                d="M55 60 Q 95 30, 120 10 T 155 12 T 185 60"
                strokeWidth={1.8}
                className={selectedQuality === 'High' ? 'text-amber-200 opacity-100' : 'opacity-40'}
              />
              {/* Layer 5: Summit Pin */}
              <path
                d="M80 60 Q 110 20, 120 6 T 135 12 T 160 60"
                strokeWidth={2}
                className={selectedQuality === 'High' ? 'text-white opacity-100' : 'opacity-30'}
              />
            </svg>
          </div>

          {/* 6. Resolution Fidelity Selector (Low / Medium / High) */}
          <div className="flex items-center justify-between w-60 px-3 py-1 text-sm font-semibold text-white">
            {['Low', 'Medium', 'High'].map((quality) => {
              const isActive = selectedQuality === quality;
              return (
                <div
                  key={quality}
                  onClick={() => setSelectedQuality(quality)}
                  className={`resolution_picker px-2 py-1 ${
                    isActive ? 'active text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <span className="font-serif text-sm sm:text-base tracking-wide drop-shadow-md">
                    {quality}
                  </span>
                  <div className={`selected_underline ${isActive ? 'scale-x-100' : ''}`} />
                </div>
              );
            })}
          </div>

          {/* 7. Primary Action: Capsule Ghost Button from Reference */}
          <div className="mt-8 sm:mt-10">
            <button
              type="button"
              onClick={() => onExplore(selectedQuality)}
              className="ghostbutton min-h-[44px] px-10 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300"
            >
              EXPLORE
            </button>
          </div>
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="absolute bottom-5 inset-x-0 text-center text-[10px] font-mono tracking-widest text-white/40 uppercase z-20">
        MapWave • Explore. Navigate. Discover.
      </div>
    </div>
  );
}
