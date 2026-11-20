import React, { useState } from 'react';

/**
 * MapWave White-Themed Frosted Glassmorphic Login
 * Implements the exact luminous glass aesthetic from the reference mockup (Image 1):
 * - Radiant white frosted glass card with glowing translucent border
 * - 100% Crisp white typography for maximum legibility and zero muddy blending
 * - Translucent frosted pill input fields with white outline icons
 * - Perfectly color-matched electric Halfwave Blue primary action button
 * - Seamless frosted Google OAuth option & matching top-bar pills
 */
export function LoginPage({ onLoginSuccess, onGoogleLogin, onBackToLanding, onSkip }) {
  const [username, setUsername] = useState('deepak.gm@jssateb.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess?.({ username });
    }, 600);
  };

  const handleGoogleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onGoogleLogin?.();
    }, 500);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      {/* 1. Full-Bleed Campus Background Image (JSSATE Main Building) with Natural Vibrant Sunlight */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 filter brightness-[0.96] contrast-[1.03] transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('/images/jssate_main_building.jpg')`,
        }}
      />

      {/* 2. Soft Atmospheric Ambient Scrim for Flawless Contrast without Gloomy Tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.40) 0%, rgba(15, 23, 42, 0.22) 40%, rgba(15, 23, 42, 0.48) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Top Left Navigation Pill */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBackToLanding}
          title="Return to Introduction"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.50)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="tracking-wide">Back</span>
        </button>
      </div>

      {/* Top Right Skip / Demo Option Pill */}
      {onSkip && (
        <div className="absolute top-5 right-5 z-20">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 rounded-full text-white text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.50)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            }}
          >
            Explore as Guest →
          </button>
        </div>
      )}

      {/* 3. Luminous Frosted White Glassmorphism Login Card (Direct Image 1 Match) */}
      <div
        className="relative z-10 w-full max-w-[420px] p-8 sm:p-9 rounded-[32px] animate-in fade-in zoom-in-95 duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.10) 100%)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1.5px solid rgba(255, 255, 255, 0.65)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.40), inset 0 1px 1px rgba(255, 255, 255, 0.60)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-start gap-1 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-md"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.4}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <span
              className="text-[11px] font-mono font-bold tracking-widest uppercase"
              style={{ color: '#93c5fd', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              MAPWAVE • JSSATE
            </span>
          </div>

          {/* Crisp Pure White Heading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            Login
          </h1>
          <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.88)' }}>
            Welcome back, please login to your campus account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* User Name Input */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'rgba(255, 255, 255, 0.92)' }}
              htmlFor="username"
            >
              User Name or USN
            </label>
            <div className="relative flex items-center">
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your USN or email"
                className="w-full h-12 pl-4 pr-11 rounded-2xl text-white placeholder-white/60 text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1.5px solid rgba(255, 255, 255, 0.38)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.22)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.85)';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.38)';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.15)';
                }}
              />
              <div className="absolute right-3.5 text-white/70 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-semibold tracking-wide"
                style={{ color: 'rgba(255, 255, 255, 0.92)' }}
                htmlFor="password"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your college registered email!')}
                className="text-[11px] font-semibold hover:underline cursor-pointer transition-colors"
                style={{ color: '#93c5fd' }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 pl-4 pr-11 rounded-2xl text-white placeholder-white/60 text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1.5px solid rgba(255, 255, 255, 0.38)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.22)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.85)';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.38)';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.15)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox with Pure White Label */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-white/60 bg-white/20 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium cursor-pointer select-none"
              style={{ color: 'rgba(255, 255, 255, 0.92)' }}
            >
              Remember me
            </label>
          </div>

          {/* Primary Login Button (Color-Matched Halfwave Electric Blue Gradient) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-1 rounded-2xl text-white font-bold text-sm tracking-wide active:scale-[0.985] transition-all cursor-pointer flex items-center justify-center gap-2 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* OR Divider with Glass Pill Badge */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-white/25" />
          <span
            className="absolute px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            OR
          </span>
        </div>

        {/* Login with Google Option Button (Polished White Glass Pill) */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="w-full h-12 rounded-2xl font-semibold text-sm active:scale-[0.985] transition-all cursor-pointer flex items-center justify-center gap-3 group hover:brightness-105"
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
            color: '#0f172a',
          }}
        >
          {/* Official Multicolor Google G Icon */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.86c2.26-2.09 3.68-5.17 3.68-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.04c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.13C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.62H1.28C.46 8.24 0 10.06 0 12s.46 3.76 1.28 5.38l3.99-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.62l3.99 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <span className="tracking-tight font-bold">Sign in with Google</span>
        </button>

        {/* Signup Footer Link with Crisp White & Sky Blue Highlight */}
        <div className="mt-6 text-center text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onLoginSuccess?.({ username: 'new_student@jssateb.ac.in' })}
            className="font-bold hover:underline cursor-pointer transition-colors"
            style={{ color: '#93c5fd' }}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
