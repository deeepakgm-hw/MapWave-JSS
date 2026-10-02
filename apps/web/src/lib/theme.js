// Stylized Isometric Theme Tokens (Inspired by BitSummit / Graphic Map UI)

export const THEME = {
  // Vibrant Color Palette
  colors: {
    skyBg: 'bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500',
    royalBlue: '#1D4ED8',     // blue-700
    royalDark: '#0F172A',     // slate-900
    cyberYellow: '#FACC15',   // yellow-400
    coralRed: '#FF4757',      // hot pink / coral red
    coralHover: '#FF6B81',
    zoneBorder: '#1E40AF',
  },
  
  // Card & Container Styling
  card: {
    glass: 'bg-white/95 backdrop-blur-md border-2 border-blue-900 shadow-[0_8px_0_0_#1E3A8A] rounded-2xl text-slate-900',
    headerBadge: 'bg-blue-950 text-white border-2 border-yellow-400 shadow-md rounded-2xl px-4 py-2 font-black',
    pillBadge: 'px-3 py-1 bg-white border-2 border-rose-500 text-rose-600 font-extrabold text-xs rounded-full shadow-sm',
    bottomShelf: 'bg-blue-950 border-t-4 border-yellow-400 shadow-[0_-10px_25px_rgba(0,0,0,0.3)] text-white',
  },

  // Floating Control Buttons (Pink/Coral D-Pad style)
  controlBtn: 'w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-90 text-white font-extrabold flex items-center justify-center border-2 border-white shadow-[0_4px_0_0_#9F1239] transition-all cursor-pointer select-none',

  // Tap Target Accessibility (Min 44px)
  tapTarget: 'min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer select-none transition-all',
};
