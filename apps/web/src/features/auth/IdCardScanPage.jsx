import React, { useState, useRef, useEffect } from 'react';
import { parseIdCardScan, cropFaceFromIdCard } from './authService';

export function IdCardScanPage({ onVerificationComplete, onBackToLogin }) {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'FACULTY'
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields state
  const [editableName, setEditableName] = useState('');
  const [editableUsn, setEditableUsn] = useState('');
  const [editableDept, setEditableDept] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-start live camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
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
        videoRef.current.play().catch((err) => console.warn('Video play error:', err));
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('[Camera] Failed to access camera:', err);
      setCameraError('Camera access unavailable. You can upload an ID photo or use reference test.');
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

  /**
   * Captures live frame from camera canvas and runs real OCR + face crop
   */
  const handleCaptureLiveCamera = async () => {
    if (!videoRef.current) return;
    setIsScanning(true);
    setScanProgress(20);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      setScanProgress(50);
      const userProfile = await parseIdCardScan(canvas, role);

      setScanProgress(100);
      setIsScanning(false);
      setScannedUser(userProfile);
      setEditableName(userProfile.name);
      setEditableUsn(userProfile.usn);
      setEditableDept(userProfile.dept);
      stopCamera();
    } catch (err) {
      console.error('[Scanner] Capture error:', err);
      setIsScanning(false);
    }
  };

  /**
   * Scans an uploaded ID photo or sample reference image
   */
  const handleScanCard = async (imgSrc) => {
    setIsScanning(true);
    setScanProgress(20);

    const timer = setTimeout(() => setScanProgress(70), 300);

    try {
      const userProfile = await parseIdCardScan(imgSrc, role);
      clearTimeout(timer);
      setScanProgress(100);
      setIsScanning(false);
      setScannedUser(userProfile);
      setEditableName(userProfile.name);
      setEditableUsn(userProfile.usn);
      setEditableDept(userProfile.dept);
      stopCamera();
    } catch (err) {
      console.error('[Scanner] OCR error:', err);
      setIsScanning(false);
    }
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
      const finalUser = {
        ...scannedUser,
        name: editableName || scannedUser.name,
        usn: editableUsn || scannedUser.usn,
        dept: editableDept || scannedUser.dept,
      };
      onVerificationComplete?.(finalUser);
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
            Hold your physical JSSATE badge up to the camera or upload a photo to auto-extract credentials and unlock indoor navigation.
          </p>
        </div>

        {/* Role Selector Tabs (Student vs Faculty) */}
        <div className="flex items-center justify-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 w-full max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              role === 'STUDENT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student ID
          </button>
          <button
            type="button"
            onClick={() => setRole('FACULTY')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              role === 'FACULTY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty / Staff
          </button>
        </div>

        {/* 3. Live Camera Viewfinder or Extracted Badge */}
        {!scannedUser ? (
          <div className="flex flex-col gap-4">
            {/* Viewfinder Card */}
            <div className="relative w-full aspect-[1.586/1] max-h-[300px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-400 flex items-center justify-center shadow-inner group">
              {/* Live Video Feed */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : previewImage ? (
                /* Uploaded Photo Preview */
                <img
                  src={previewImage}
                  alt="Uploaded ID Card Preview"
                  className="w-full h-full object-contain filter contrast-[1.03]"
                />
              ) : (
                /* Camera Prompt Placeholder */
                <div className="flex flex-col items-center justify-center text-center p-6 gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-1">
                    <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-semibold">Live Camera Ready</span>
                  <span className="text-white/60 text-xs max-w-xs">Align your physical ID card squarely within the viewfinder</span>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-2 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {/* Viewfinder Overlay Reticle (Corner Brackets) */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                {/* Laser Sweep Line */}
                <div
                  className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none ${
                    isScanning ? 'animate-laser' : cameraActive ? 'top-1/2 -translate-y-1/2 opacity-75' : 'hidden'
                  }`}
                />
              </div>

              {/* Status Banner */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono border border-white/15">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  {isScanning ? `Analyzing OCR Data (${scanProgress}%)...` : cameraActive ? 'Live Camera Active • Hold Card Still' : previewImage ? 'Photo Loaded' : 'Camera Standby'}
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
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Primary Live Capture / Scan Button */}
              {cameraActive ? (
                <button
                  type="button"
                  onClick={handleCaptureLiveCamera}
                  disabled={isScanning}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.985] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{isScanning ? 'Extracting ID Details...' : 'Capture & Scan Physical ID'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isScanning}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Open Live Camera</span>
                </button>
              )}

              {/* Secondary Options: Upload Card & Reference Sample */}
              <div className="grid grid-cols-2 gap-2.5">
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
                  <span>Upload ID Photo</span>
                </button>

                {/* Reference ID Test Button */}
                <button
                  type="button"
                  onClick={() => handleScanCard('/images/sample_student_id.jpg')}
                  disabled={isScanning}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Use reference student badge for instant simulation"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Scan Sample ID</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 4. Extracted Credentials Card with Live Photo Crop & Edit Capability */
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
                {/* Left: Metadata Details (with Edit capability) */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                      FULL NAME
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        className="w-full text-base font-bold text-slate-900 border-b border-blue-500 outline-none pb-0.5 bg-blue-50/50"
                      />
                    ) : (
                      <div className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {editableName}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">SR NO</span>
                      <div className="font-bold text-slate-800 font-mono">{scannedUser.srNo}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">USN</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableUsn}
                          onChange={(e) => setEditableUsn(e.target.value.toUpperCase())}
                          className="font-bold text-blue-600 font-mono border-b border-blue-500 outline-none bg-blue-50/50"
                        />
                      ) : (
                        <div className="font-bold text-blue-600 font-mono">{editableUsn}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">DEPARTMENT</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableDept}
                          onChange={(e) => setEditableDept(e.target.value.toUpperCase())}
                          className="font-bold text-slate-800 border-b border-blue-500 outline-none bg-blue-50/50"
                        />
                      ) : (
                        <div className="font-bold text-slate-800">{editableDept}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">BUILDING</span>
                      <div className="font-bold text-emerald-700">{scannedUser.academicBlock} (F{scannedUser.preferredFloor})</div>
                    </div>
                  </div>
                </div>

                {/* Right: Scanned Live Photo Crop */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100">
                    <img
                      src={scannedUser.photo}
                      alt={editableName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    PHOTO ID
                  </span>
                </div>
              </div>

              {/* Barcode & Edit Toggle Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-[2px] h-6">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                      <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold tracking-widest">
                    {editableUsn}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>{isEditing ? 'Save Changes' : 'Edit Details'}</span>
                </button>
              </div>
            </div>

            {/* Department Association Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                🏛️
              </div>
              <div className="flex flex-col text-xs text-blue-950 leading-snug">
                <span className="font-bold">
                  Department Recognized: {scannedUser.departmentFullName} ({editableDept})
                </span>
                <span className="text-blue-700 text-[11px] mt-0.5">
                  {scannedUser.academicBlock} (Floor {scannedUser.preferredFloor} labs, classrooms & corridors) will be prioritized on your campus map.
                </span>
              </div>
            </div>

            {/* Action Buttons: Confirm & Enter / Rescan */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setScannedUser(null);
                  setPreviewImage(null);
                  startCamera();
                }}
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
