import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_STUDENT_PROFILE, SAMPLE_FACULTY_PROFILE, parseIdCardScan } from './authService';

export function IdCardScanPage({ onVerificationComplete, onBackToLogin }) {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'FACULTY'
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState('/images/sample_student_id.jpg');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('[Camera] Failed to access camera:', err);
      setCameraError('Camera access unavailable. You can use sample card scan or upload a photo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScanCard = async (imgSrc = previewImage) => {
    setIsScanning(true);
    setScanProgress(15);

    const timer1 = setTimeout(() => setScanProgress(55), 300);
    const timer2 = setTimeout(() => setScanProgress(90), 600);

    const userProfile = await parseIdCardScan(imgSrc, role);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScannedUser(userProfile);
      stopCamera();
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      stopCamera();
      handleScanCard(url);
    }
  };

  const handleConfirmAndEnter = () => {
    if (scannedUser) {
      onVerificationComplete?.(scannedUser);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      {/* 1. Full-Bleed Campus Background with Natural Vibrant Sunlight */}
      <div
        className="fixed inset-0 bg-cover bg-center filter brightness-[0.96] contrast-[1.03]"
        style={{
          backgroundImage: `url('/images/jssate_main_building.jpg')`,
        }}
      />
      <div
        className="fixed inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.40) 0%, rgba(15, 23, 42, 0.22) 40%, rgba(15, 23, 42, 0.48) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Back Button */}
      <div className="fixed top-5 left-5 z-20">
        <button
          type="button"
          onClick={onBackToLogin}
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
          <span className="tracking-wide">Back to Login</span>
        </button>
      </div>

      {/* 2. Main White-Themed Glassmorphism Container */}
      <div
        className="relative z-10 w-full max-w-xl my-8 p-6 sm:p-8 rounded-[32px] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>MapWave Security Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan Your Campus ID Card
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md">
            Scan your physical JSSATE ID card to auto-fetch your department credentials and unlock indoor navigation.
          </p>
        </div>

        {/* Role Selector Tabs (Student vs Faculty) */}
        <div className="flex items-center justify-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 w-full max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              if (scannedUser) setScannedUser(SAMPLE_STUDENT_PROFILE);
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              role === 'STUDENT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student ID
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('FACULTY');
              if (scannedUser) setScannedUser(SAMPLE_FACULTY_PROFILE);
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              role === 'FACULTY'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty / Staff
          </button>
        </div>

        {/* 3. Scanner Viewfinder or Scanned Badge Preview */}
        {!scannedUser ? (
          <div className="flex flex-col gap-4">
            {/* Viewfinder Card */}
            <div className="relative w-full aspect-[1.586/1] max-h-[280px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner group">
              {/* Camera Video Feed */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Static Image Preview of ID Card (Image 3) */
                <img
                  src={previewImage}
                  alt="JSSATE ID Card Preview"
                  className="w-full h-full object-cover filter contrast-[1.03] transition-opacity"
                />
              )}

              {/* Viewfinder Overlay Reticle (Corner Brackets) */}
              <div className="absolute inset-4 pointer-events-none">
                {/* Top-Left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                {/* Top-Right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                {/* Bottom-Left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                {/* Bottom-Right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                {/* Laser Sweep Line */}
                <div
                  className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none ${
                    isScanning ? 'animate-laser' : 'top-1/2 -translate-y-1/2 opacity-60'
                  }`}
                />
              </div>

              {/* Status Banner */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono border border-white/15">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  {isScanning ? `Analyzing OCR Data (${scanProgress}%)...` : cameraActive ? 'Camera Active • Align ID' : 'Sample Card Ready'}
                </span>
                <span className="text-white/60 uppercase">JSSATE-CR80</span>
              </div>
            </div>

            {/* Error Message if camera failed */}
            {cameraError && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-center">
                {cameraError}
              </p>
            )}

            {/* Scanner Controls / Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Scan Sample Card Button (Image 3: Deepak G M) */}
              <button
                type="button"
                onClick={() => handleScanCard('/images/sample_student_id.jpg')}
                disabled={isScanning}
                className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 col-span-1 sm:col-span-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{isScanning ? 'Scanning...' : 'Scan Sample ID'}</span>
              </button>

              {/* Upload Card Image */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold text-xs border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Card</span>
              </button>

              {/* Toggle Live Camera */}
              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCamera}
                disabled={isScanning}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold text-xs border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{cameraActive ? 'Stop Camera' : 'Live Camera'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4. Extracted Credentials Card (Auto-Fetched from ID Scan) */
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-250">
            {/* Holographic Digital Student ID Card */}
            <div className="relative p-5 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col gap-4">
              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                    <img src="/halfwave_icon.png" alt="JSSATE Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      JSS MAHAVIDYAPEETHA
                    </div>
                    <div className="text-base font-extrabold tracking-wider text-rose-800 leading-tight">
                      JSSATE BENGALURU
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-300">
                    ✓ Verified
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 font-bold tracking-widest uppercase">
                    {scannedUser.role}
                  </span>
                </div>
              </div>

              {/* Student Details & Photo Row */}
              <div className="flex items-start justify-between gap-4">
                {/* Left: Metadata Details */}
                <div className="flex flex-col gap-2 flex-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                      FULL NAME
                    </span>
                    <div className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {scannedUser.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">SR NO</span>
                      <div className="font-bold text-slate-800 font-mono">{scannedUser.srNo}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">USN</span>
                      <div className="font-bold text-blue-600 font-mono">{scannedUser.usn}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">DEPARTMENT</span>
                      <div className="font-bold text-slate-800">{scannedUser.dept}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">BUILDING</span>
                      <div className="font-bold text-emerald-700">Block A (F2)</div>
                    </div>
                  </div>
                </div>

                {/* Right: Student Photo extracted from ID card */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100">
                    <img
                      src={scannedUser.photo}
                      alt={scannedUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    PHOTO ID
                  </span>
                </div>
              </div>

              {/* Barcode & Signature Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {/* Barcode Graphic */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-[2px] h-6">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold tracking-widest">
                    {scannedUser.barcode}
                  </span>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="text-xs font-serif italic text-slate-700 font-semibold">
                    Dr. H. R. Purushothama
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    PRINCIPAL
                  </span>
                </div>
              </div>
            </div>

            {/* Department Association Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                🏛️
              </div>
              <div className="flex flex-col text-xs text-blue-950 leading-snug">
                <span className="font-bold">
                  Department Recognized: {scannedUser.departmentFullName} ({scannedUser.dept})
                </span>
                <span className="text-blue-700 text-[11px] mt-0.5">
                  Academic Block A (Floor 2 labs, classrooms & corridors) will be prioritized on your campus map.
                </span>
              </div>
            </div>

            {/* Action Buttons: Confirm & Enter / Rescan */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScannedUser(null)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Re-Scan Card
              </button>
              <button
                type="button"
                onClick={handleConfirmAndEnter}
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 active:scale-[0.985] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Confirm & Enter MapWave Portal</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdCardScanPage;
