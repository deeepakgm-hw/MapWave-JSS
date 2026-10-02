import React, { useState } from 'react';
import { MapOutdoor } from './features/map-outdoor';

export default function App() {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  const handleBuildingSelect = (buildingId) => {
    setSelectedBuildingId(buildingId);
    console.log('Building selected on 3D map:', buildingId);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-950 leading-tight">Campus Navigator</h1>
            <p className="text-xs text-gray-500">Interactive 3D Outdoor & Indoor Mapping</p>
          </div>
        </div>
        {selectedBuildingId && (
          <div className="text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200">
            Selected Building: {selectedBuildingId}
          </div>
        )}
      </header>

      {/* Main Map Content Viewport */}
      <main className="flex-1 relative w-full h-full p-4 bg-gray-100">
        <MapOutdoor onBuildingSelect={handleBuildingSelect} />
      </main>
    </div>
  );
}
