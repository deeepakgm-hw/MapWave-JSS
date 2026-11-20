import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { IdCardScanPage } from './IdCardScanPage';
import { SAMPLE_STUDENT_PROFILE } from './authService';

export function AuthFlow({
  onAuthComplete,
  onBackToLanding,
  onSkip,
  initialStep = 'LOGIN',
}) {
  const [step, setStep] = useState(initialStep); // 'LOGIN' | 'SCAN_ID'

  const handleLoginSuccess = (credentials) => {
    console.log('[AuthFlow] Logged in with credentials:', credentials);
    setStep('SCAN_ID');
  };

  const handleGoogleLogin = () => {
    console.log('[AuthFlow] Authenticated via Google OAuth');
    setStep('SCAN_ID');
  };

  const handleVerificationComplete = (userProfile) => {
    console.log('[AuthFlow] ID Verification Complete:', userProfile);
    onAuthComplete?.(userProfile);
  };

  if (step === 'LOGIN') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoogleLogin={handleGoogleLogin}
        onBackToLanding={onBackToLanding}
        onSkip={onSkip}
      />
    );
  }

  if (step === 'SCAN_ID') {
    return (
      <IdCardScanPage
        onVerificationComplete={handleVerificationComplete}
        onBackToLogin={() => setStep('LOGIN')}
      />
    );
  }

  return null;
}

export default AuthFlow;
