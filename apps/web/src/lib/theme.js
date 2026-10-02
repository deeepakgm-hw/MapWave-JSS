// Unified Design System Tokens for Campus Navigator

export const THEME = {
  // Primary Accent Color Palette (Deep Blue / Indigo)
  accent: {
    primary: '#1E40AF',     // blue-800
    primaryLight: '#3B82F6',// blue-500
    primaryDark: '#1E3A8A', // blue-900
    primaryBg: '#EFF6FF',   // blue-50
    gradient: 'from-blue-900 via-indigo-900 to-blue-950',
  },
  
  // Card Glassmorphism Tokens
  card: {
    glass: 'bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl text-slate-800',
    glassHeader: 'bg-slate-900/90 text-white backdrop-blur-md border-b border-slate-800 shadow-md',
    compact: 'bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-3',
  },

  // Tap Target Accessibility (Min 44px)
  tapTarget: 'min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.98]',

  // Status Colors
  status: {
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-rose-500 text-white',
    info: 'bg-blue-500 text-white',
  }
};
