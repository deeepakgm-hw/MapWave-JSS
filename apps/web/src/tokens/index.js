// MapWave Apple-Maps/Linear-grade Design Tokens
// Single source of truth for presentation layer

export const TOKENS = {
  space: {
    unit: 4,
    grid: 8,
    insetSm: 16,
    insetLg: 24,
  },
  radius: {
    sm: 8,
    control: 12,
    card: 16,
    panel: 24,
    pill: 9999,
  },
  font: {
    ui: 'var(--font-ui)',
    mono: 'var(--font-mono)',
  },
  colors: {
    accent: '#3B82F6',
    accentHover: '#2563EB',
    route: '#F59E0B',
    boundary: '#06B6D4',
    boundaryGlow: 'rgba(6, 182, 212, 0.35)',
    success: '#10B981',
    warn: '#F59E0B',
    error: '#EF4444',
  },
  glass: {
    dark: {
      bg: 'rgba(14, 17, 26, 0.55)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.70)',
      textMuted: 'rgba(255, 255, 255, 0.45)',
      childBg: 'rgba(255, 255, 255, 0.08)',
      childHover: 'rgba(255, 255, 255, 0.14)',
    },
    light: {
      bg: 'rgba(255, 255, 255, 0.62)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.70)',
      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.90)',
      text: '#0F172A',
      textSecondary: 'rgba(15, 23, 42, 0.72)',
      textMuted: 'rgba(15, 23, 42, 0.48)',
      childBg: 'rgba(0, 0, 0, 0.05)',
      childHover: 'rgba(0, 0, 0, 0.09)',
    },
  },
  motion: {
    duration: '240ms',
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
};
