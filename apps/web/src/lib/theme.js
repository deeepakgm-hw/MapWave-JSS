// MapWave Design Tokens — Clean, Map-Led (Inspired by thekenyamap.com)

export const THEME = {
  colors: {
    // Restrained neutrals & subtle accents
    canvasBg: '#0c0a09',
    surface: 'rgba(15, 23, 42, 0.85)',
    surfaceBorder: 'rgba(255, 255, 255, 0.15)',
    surfaceHover: 'rgba(30, 41, 59, 0.95)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    accentBlue: '#3b82f6',
    accentBlueHover: '#2563eb',
    accentAmber: '#f59e0b',
  },

  // Minimalist Floating Card Style
  card: {
    floating: 'bg-slate-900/90 text-white backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl',
    compact: 'bg-slate-900/80 text-white backdrop-blur-md border border-white/15 rounded-xl shadow-lg',
  },

  // Floating Control Buttons
  controlBtn: 'w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95',

  // Touch Accessibility (Min 44px)
  tapTarget: 'min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer select-none',
};
