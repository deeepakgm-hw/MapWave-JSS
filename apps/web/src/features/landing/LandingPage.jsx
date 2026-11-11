import React, { useState, useEffect } from 'react';

export function LandingPage({ onExplore }) {
  const [selectedExperience, setSelectedExperience] = useState('3d');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Subtle interactive 3D cursor parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLaunch = () => {
    onExplore?.(selectedExperience);
  };

  const EXPERIENCES = [
    {
      id: '2d',
      title: '2D Campus',
      tagline: 'Orthographic View',
      description: 'Explore the campus from above.',
      badge: 'Fast & Clean',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: '3d',
      title: '3D Exploration',
      tagline: 'Interactive 3D Model',
      description: 'Discover campus buildings in three dimensions.',
      badge: 'FEATURED',
      isFeatured: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'indoor',
      title: 'Indoor Maps',
      tagline: 'Block C Floors 1–3 Mapped',
      description: 'Find classrooms, laboratories, and rooms inside buildings.',
      badge: 'Floorplans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#07111F] font-sans">
      {/* 1. Full-Viewport Aerial Campus Photography */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url('/jssate_campus_aerial.jpg')`,
          transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px) scale(1.04)`,
        }}
      />

      {/* 2. Cinematic Dark Gradient Overlay (Natural Depth & Contrast) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(7, 17, 31, 0.25) 0%, rgba(7, 17, 31, 0.6) 65%, rgba(4, 9, 18, 0.92) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-transparent to-[#07111F]/80 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(4,9,18,0.85)] pointer-events-none" />

      {/* 3. Subtle Edge Clouds (Outer Edges Only — Central Campus Completely Visible) */}
      {/* Outer Left Edge Cloud */}
      <div
        className="absolute -top-12 -left-28 sm:-left-20 pointer-events-none z-10 opacity-25 mix-blend-screen transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.2}px)`,
          maxWidth: '380px',
        }}
      >
        <div className="cloud-animate-left">
          <img
            src="/cloud_1.png"
            alt=""
            className="w-full h-auto filter blur-[1px] brightness-105"
            draggable="false"
          />
        </div>
      </div>

      {/* Outer Right Edge Cloud */}
      <div
        className="absolute top-4 -right-28 sm:-right-20 pointer-events-none z-10 opacity-25 mix-blend-screen transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.2}px)`,
          maxWidth: '400px',
        }}
      >
        <div className="cloud-animate-right">
          <img
            src="/cloud_1.png"
            alt=""
            className="w-full h-auto filter blur-[1px] brightness-105"
            draggable="false"
          />
        </div>
      </div>

      {/* 4. Top Navigation Bar */}
      <header className="absolute top-5 sm:top-6 inset-x-5 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-auto">
        {/* Left Side: Halfwave Brand & Campus Portal Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Halfwave Logo & Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/halfwave_logo.png"
              alt="Halfwave"
              className="h-6 sm:h-7 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            />
            <span className="hidden md:inline text-xs font-bold tracking-widest uppercase text-white/90">
              Halfwave
            </span>
          </div>

          {/* Refined Divider */}
          <div className="h-5 w-[1px] bg-white/20 shrink-0" />

          {/* Campus Identification */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[9px] font-mono tracking-widest text-blue-300 uppercase font-semibold">
                  Campus Portal
                </span>
                <span className="text-white/30 text-[9px]">•</span>
                <span className="text-[9px] tracking-wider text-slate-300 uppercase">
                  Bengaluru
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-white/95 tracking-wide whitespace-nowrap mt-0.5">
                JSS Academy of Technical Education (<span className="text-white font-bold">JSSATE</span>)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Coordinate Reference Pill */}
        <div className="hidden sm:flex items-center">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/45 backdrop-blur-md border border-white/15 text-slate-300 text-[10px] sm:text-[11px] font-mono tracking-wider flex items-center gap-2 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>12.9015° N, 77.5057° E • UTM 43N</span>
          </div>
        </div>
      </header>

      {/* 5. Central Hero & Experience Selector (Crystal-Clear Over Campus Center) */}
      <main className="relative z-20 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center max-w-4xl mx-auto animate-hero-fade-up">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase mb-2 sm:mb-3 drop-shadow">
          <span>JSS ACADEMY OF TECHNICAL EDUCATION</span>
          <span className="text-white/40">·</span>
          <span>BENGALURU</span>
        </div>

        {/* Primary Heading: MAPWAVE */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_12px_36px_rgba(0,0,0,0.9)] leading-none uppercase">
          MAPWAVE
        </h1>

        {/* Secondary Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/95 mt-2 sm:mt-3 tracking-tight drop-shadow-md">
          Explore your campus.
        </h2>

        {/* Supporting Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed drop-shadow">
          Discover buildings, find classrooms, and navigate your way around campus.
        </p>

        {/* Selector Prompt */}
        <p className="mt-5 sm:mt-7 text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">
          Please select your map experience.
        </p>

        {/* 6. Three Distinct Map Experience Selector Cards */}
        <div
          role="radiogroup"
          aria-label="Map Experience Selection"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full max-w-2xl mt-3.5"
        >
          {EXPERIENCES.map((exp) => {
            const isSelected = selectedExperience === exp.id;
            return (
              <div
                key={exp.id}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                onClick={() => setSelectedExperience(exp.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedExperience(exp.id);
                  }
                }}
                className={`relative group rounded-2xl p-3.5 sm:p-4 text-left cursor-pointer transition-all duration-200 backdrop-blur-md border ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 shadow-[0_0_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400/60 translate-y-[-2px]'
                    : 'bg-slate-950/40 hover:bg-slate-900/50 border-white/15 hover:border-white/30 text-white/70 hover:translate-y-[-1px]'
                }`}
              >
                {/* Header row inside card: Icon & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white'
                    }`}
                  >
                    {exp.icon}
                  </div>
                  {exp.isFeatured ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-blue-500/25 text-blue-300 border border-blue-400/30">
                      {exp.badge}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider">
                      {exp.badge}
                    </span>
                  )}
                </div>

                {/* Card Title */}
                <div className="flex items-center gap-1.5">
                  <h3
                    className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                      isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                    }`}
                  >
                    {exp.title}
                  </h3>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>

                {/* Card Tagline / Subtitle */}
                <div className="text-[10px] font-mono text-blue-300/80 mt-0.5">
                  {exp.tagline}
                </div>

                {/* Card Description */}
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {exp.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 7. Primary Action: Explore Button */}
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isTransitioning}
            className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-white bg-blue-600 hover:bg-blue-500 active:scale-98 shadow-[0_6px_28px_rgba(37,99,235,0.5)] border border-blue-400/40 transition-all duration-300 min-h-[48px] cursor-pointer hover:shadow-[0_8px_32px_rgba(37,99,235,0.65)]"
          >
            <span>{isTransitioning ? 'LAUNCHING...' : 'EXPLORE MAPWAVE'}</span>
            {!isTransitioning && (
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </main>

      {/* 8. Footer */}
      <footer className="absolute bottom-4 inset-x-0 text-center text-[10px] font-mono tracking-widest text-white/40 uppercase z-20 pointer-events-none">
        MapWave • Explore. Navigate. Discover. • Halfwave Platforms
      </footer>
    </div>
  );
}
