// MapWave Apple-Maps/Linear-grade Design Tokens
// Single source of truth for mobile-first presentation layer

export const TOKENS = {
  space: {
    unit: 4,
    grid: 8,
    insetMobile: 12,
    insetDesktop: 16,
    insetLg: 24,
    gapSm: 8,
    gapMd: 12,
  },
  zLayer: {
    map: 0,
    scrim: 10,
    controls: 20,
    sheet: 30,
    modal: 40,
  },
  radius: {
    sm: 8,
    control: 12,
    card: 16,
    panel: 24,
    pill: 9999,
  },
  typography: {
    scale: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 20,
      xl: 28,
    },
    ui: 'var(--font-ui)',
    mono: 'var(--font-mono)',
    minInputSize: 16, // prevents iOS auto-zoom
  },
  colors: {
    accent: '#3B82F6',
    accentHover: '#2563EB',
    route: '#F59E0B',
    boundary: '#06B6D4',
    boundaryGlow: 'rgba(6, 182, 212, 0.45)',
    success: '#10B981',
    warn: '#F59E0B',
    error: '#EF4444',
  },
  glass: {
    dark: {
      bg: 'rgba(16, 19, 28, 0.62)',
      backdropFilter: 'blur(20px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.72)',
      textMuted: 'rgba(255, 255, 255, 0.48)',
      childBg: 'rgba(255, 255, 255, 0.08)',
      childHover: 'rgba(255, 255, 255, 0.14)',
    },
    light: {
      bg: 'rgba(255, 255, 255, 0.70)',
      backdropFilter: 'blur(20px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.75)',
      boxShadow: '0 12px 36px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.90)',
      text: '#0F172A',
      textSecondary: 'rgba(15, 23, 42, 0.72)',
      textMuted: 'rgba(15, 23, 42, 0.48)',
      childBg: 'rgba(0, 0, 0, 0.05)',
      childHover: 'rgba(0, 0, 0, 0.09)',
    },
  },
  touch: {
    minTargetSize: 44, // WCAG AA minimum 44x44
    gap: 8,
    activeScale: 0.97,
  },
  motion: {
    spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    durationMs: 240,
  },
};

export default TOKENS;
