import React, { useRef, useEffect } from 'react';

export function UserProfileModal({
  user,
  isOpen,
  onClose,
  onLogout,
  onRescanId,
  onNavigateToDept,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="User Profile"
        className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.3)] p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Profile"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* User Identity Header */}
        <div className="flex items-center gap-4 pr-8">
          {/* Avatar Photo */}
          <div className="relative w-16 h-18 rounded-2xl overflow-hidden border-2 border-blue-600 shadow-md bg-slate-100 shrink-0">
            <img
              src={user.photo || '/images/student_photo.jpg'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[8px] font-mono font-bold uppercase text-center py-0.5">
              {user.role}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="inline-flex items-center gap-1.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {user.name}
              </h2>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm" title="Verified ID">
                ✓
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 tracking-wide mt-0.5">
              USN: {user.usn}
            </span>
            <span className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {user.departmentFullName || user.dept} • {user.institution}
            </span>
          </div>
        </div>

        {/* Official Card Details Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                SR NUMBER
              </span>
              <div className="font-bold text-slate-800 font-mono text-sm mt-0.5">
                {user.srNo}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                DEPARTMENT
              </span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {user.dept}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                PRIMARY BLOCK
              </span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {user.academicBlock || 'Academic Block A'}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                VERIFIED STATUS
              </span>
              <div className="font-bold text-emerald-600 text-sm mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Session
              </div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-[2px] h-5">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2].map((w, i) => (
                  <div key={i} className="bg-slate-800 h-full" style={{ width: `${w * 1.4}px` }} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest">
                {user.barcode || user.usn}
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
              JSSATE ACCESS PASSPORT
            </span>
          </div>
        </div>

        {/* Quick Navigation Action for Student's Department */}
        <button
          type="button"
          onClick={() => {
            onNavigateToDept?.(user.academicBlock || 'Block A');
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/25 active:scale-[0.985] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Navigate to {user.dept} Dept (Block A Floor 2)</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => {
              onRescanId?.();
              onClose();
            }}
            className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer transition-colors"
          >
            Re-scan ID Card
          </button>

          <button
            type="button"
            onClick={() => {
              onLogout?.();
              onClose();
            }}
            className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
