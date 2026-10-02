import React from 'react';

export function CardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-4 bg-slate-100/80 rounded-xl border border-slate-200">
      <div className="h-5 bg-slate-300 rounded w-1/2" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-4 bg-slate-300 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
