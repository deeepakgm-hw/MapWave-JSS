import React from 'react';

/**
 * Apple-Maps/Linear-grade Glassmorphic Surface
 * Strictly enforces single backdrop-filter layer.
 * Radii tokens: control (12px), card (16px), panel (24px), pill (9999px).
 */
export function GlassSurface({
  children,
  className = '',
  as: Component = 'div',
  radius = 'card', // 'control' | 'card' | 'panel' | 'pill' | 'none'
  interactive = false,
  onClick,
  style = {},
  ...props
}) {
  const radiusClasses = {
    control: 'rounded-[12px]',
    card: 'rounded-[16px]',
    panel: 'rounded-[24px]',
    pill: 'rounded-full',
    sm: 'rounded-[8px]',
    none: 'rounded-none',
  };

  const interactiveClasses = interactive
    ? 'hover:brightness-105 active:scale-[0.985] transition-all duration-200 cursor-pointer'
    : '';

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`glass-surface ${radiusClasses[radius] || radiusClasses.card} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlassSurface;
