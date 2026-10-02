import React from 'react';

export function RoutePreviewCard({
  destination,
  isAccessibleMode,
  errorMessage,
  onStartNavigation,
  onBack,
}) {
  const mockRoute = {
    distance_m: 185,
    duration_min: 3,
    floors_traversed: 2,
    lift_used: isAccessibleMode,
    steps: [
      'Walk along Outdoor Quadrangle (50m)',
      'Enter Block C Main Entrance',
      isAccessibleMode ? 'Take Elevator to Floor 2' : 'Take Stairs to Floor 2',
      `Turn right and arrive at ${destination?.name || destination?.room_code || 'Destination'}`,
    ],
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <div className="flex items-center gap-3 text-rose-800 font-bold text-sm">
          <span className="text-xl">⚠️</span>
          <span>No Route Available</span>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] w-full py-2 bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-900 transition-colors"
        >
          Choose Different Destination
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Route Header Info */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
        <div>
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Destination
          </span>
          <h3 className="text-base font-extrabold truncate">
            {destination?.name || destination?.room_code || 'Selected Room'}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {destination?.room_code} {destination?.building_name && `• ${destination.building_name}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-extrabold text-emerald-400">
            {mockRoute.duration_min} min
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {mockRoute.distance_m}m walk
          </div>
        </div>
      </div>

      {/* Traversal Badges */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
          🚶 {mockRoute.distance_m} meters
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
          🏢 {mockRoute.floors_traversed} Floors
        </span>
        {isAccessibleMode && (
          <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            ♿ Elevator Route
          </span>
        )}
      </div>

      {/* Step Preview List */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Route Overview
        </h4>
        <div className="flex flex-col gap-2 pl-2 border-l-2 border-blue-500">
          {mockRoute.steps.map((step, idx) => (
            <div key={idx} className="text-xs font-medium text-slate-700 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Navigation Action Button */}
      <button
        type="button"
        onClick={onStartNavigation}
        className="min-h-[44px] w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>▶ Start Turn-by-Turn Navigation</span>
      </button>
    </div>
  );
}
