import React, { useReducer, useState } from 'react';
import {
  NAV_STATES,
  INITIAL_NAV_STATE,
  navigationReducer,
} from './lib/navigationState';
import { TopBar } from './components/TopBar';
import { RoomSearchModal } from './components/RoomSearchModal';
import { BottomSheet } from './components/BottomSheet';
import { FloatingControls } from './components/FloatingControls';
import { MapOutdoor } from './features/map-outdoor';
import { IndoorMapView } from './features/map-indoor';
import { RoutePreviewCard, ActiveNavigationHUD } from './features/routing';
import { QRScannerModal } from './features/qr-checkpoint';
import { AdminDashboard } from './features/admin';

export default function App() {
  const [state, dispatch] = useReducer(navigationReducer, INITIAL_NAV_STATE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const {
    currentState,
    selectedBuilding,
    selectedFloor,
    selectedRoom,
    destination,
    activeRoute,
    isAccessibleMode,
    lastAnchor,
    gpsLocation,
    errorMessage,
  } = state;

  const getBottomSheetSummary = () => {
    switch (currentState) {
      case NAV_STATES.OVERVIEW:
        return '⚡ TAP A ZONE OR SEARCH A ROOM TO BEGIN NAVIGATING';
      case NAV_STATES.BUILDING_FLOORS:
        return `🏢 ZONE: ${selectedBuilding?.name || 'Building Selected'} • SELECT FLOOR`;
      case NAV_STATES.FLOOR_VIEW:
        return `🗺️ FLOOR ${selectedFloor?.level_number || 1} • SELECT ROOM`;
      case NAV_STATES.ROUTE_PREVIEW:
        return `🚶 ROUTE TO ${destination?.name || destination?.room_code || 'Destination'} • 3 MIN`;
      case NAV_STATES.ROUTING_ACTIVE:
        return `🏁 NAVIGATION ACTIVE • ${destination?.room_code || 'Destination'}`;
      case NAV_STATES.QR_PROMPT:
        return '📷 SCAN QR CHECKPOINT TAG';
      case NAV_STATES.ARRIVED:
        return '🎉 YOU HAVE ARRIVED!';
      default:
        return 'CAMPUS NAVIGATOR';
    }
  };

  const handleSelectBuilding = (building) => {
    dispatch({ type: 'SELECT_BUILDING', payload: building });
  };

  const handleSelectFloor = (floor) => {
    dispatch({ type: 'SELECT_FLOOR', payload: floor });
  };

  const handleSelectRoom = (room) => {
    dispatch({
      type: 'SELECT_ROOM_DESTINATION',
      payload: { room, destination: room },
    });
  };

  const handleSearchResultSelect = ({ room, building, floor }) => {
    dispatch({
      type: 'SEARCH_ROOM',
      payload: { room, building, floor },
    });
  };

  const handleLocateMe = () => {
    if (gpsLocation && gpsLocation.accuracy > 15.0 && (currentState === NAV_STATES.FLOOR_VIEW || currentState === NAV_STATES.ROUTING_ACTIVE)) {
      dispatch({ type: 'TRIGGER_REANCHOR' });
    } else {
      console.log('Recentering camera on GPS position:', gpsLocation);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 text-slate-900 font-sans overflow-hidden">
      {/* BitSummit Styled Top Bar */}
      <TopBar
        state={state}
        onBack={(targetLevel) => dispatch({ type: 'BACK', payload: targetLevel })}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Stylized Viewport */}
      <main className="flex-1 relative w-full h-full p-4 bg-transparent">
        <MapOutdoor
          currentState={currentState}
          selectedBuilding={selectedBuilding}
          activeRoute={activeRoute}
          onSelectBuilding={handleSelectBuilding}
          onUpdateLocation={(loc) => dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc })}
        />

        {/* Floating Controller D-Pad */}
        <FloatingControls
          onLocateMe={handleLocateMe}
          onZoomIn={() => console.log('Zoom in')}
          onZoomOut={() => console.log('Zoom out')}
          isAccessibleMode={isAccessibleMode}
          onToggleAccessible={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
          geoDenied={false}
        />
      </main>

      {/* Stylized Bottom Shelf */}
      <BottomSheet summary={getBottomSheetSummary()}>
        {currentState === NAV_STATES.OVERVIEW && (
          <div className="flex flex-col gap-4 py-3">
            <h4 className="text-xs font-black text-yellow-400 uppercase tracking-widest">
              ⚡ Campus Zones & Department Hubs
            </h4>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Explore 3D outdoor building zones, view indoor floorplans, or search for any faculty office or laboratory across campus.
            </p>

            {/* Quick Department Zone Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black border border-blue-700"
              >
                💻 Computer Science & AI
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black border border-blue-700"
              >
                📚 Central Library
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black border border-blue-700"
              >
                🏛️ Main Auditorium
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black border-2 border-white shadow-[0_4px_0_0_#9F1239] min-h-[44px]"
              >
                SEARCH DESTINATION ROOM 🔍
              </button>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="px-4 py-3 bg-blue-900 hover:bg-blue-800 text-yellow-300 rounded-2xl text-xs font-black border-2 border-yellow-400 min-h-[44px]"
              >
                ADMIN ⚙️
              </button>
            </div>
          </div>
        )}

        {(currentState === NAV_STATES.BUILDING_FLOORS || currentState === NAV_STATES.FLOOR_VIEW) && (
          <IndoorMapView
            selectedBuilding={selectedBuilding}
            selectedFloor={selectedFloor}
            onSelectFloor={handleSelectFloor}
            onSelectRoom={handleSelectRoom}
          />
        )}

        {currentState === NAV_STATES.ROUTE_PREVIEW && (
          <RoutePreviewCard
            destination={destination || selectedRoom}
            isAccessibleMode={isAccessibleMode}
            errorMessage={errorMessage}
            onStartNavigation={() => dispatch({ type: 'START_NAVIGATION' })}
            onBack={() => dispatch({ type: 'BACK' })}
          />
        )}

        {currentState === NAV_STATES.ROUTING_ACTIVE && (
          <ActiveNavigationHUD
            destination={destination || selectedRoom}
            lastAnchor={lastAnchor}
            onTriggerReanchor={() => dispatch({ type: 'TRIGGER_REANCHOR' })}
            onFinish={() => dispatch({ type: 'DESTINATION_REACHED' })}
          />
        )}

        {currentState === NAV_STATES.ARRIVED && (
          <div className="flex flex-col gap-4 py-4 text-center items-center">
            <div className="w-16 h-16 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center text-3xl font-black shadow-lg animate-bounce border-2 border-white">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-black text-yellow-400 uppercase tracking-wider">You Have Arrived!</h3>
              <p className="text-xs text-slate-300 font-bold mt-1">
                Destination <strong className="text-yellow-300">{destination?.name || destination?.room_code || 'Room'}</strong> reached.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'DISMISS' })}
              className="min-h-[44px] w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl border-2 border-white shadow-[0_4px_0_0_#065F46] transition-all"
            >
              DONE & RETURN TO CAMPUS OVERVIEW
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Global Search Modal */}
      <RoomSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRoom={handleSearchResultSelect}
      />

      {/* QR Checkpoint Modal */}
      <QRScannerModal
        isOpen={currentState === NAV_STATES.QR_PROMPT}
        onScanSuccess={(node_id) => dispatch({ type: 'SCAN_SUCCESS', payload: { node_id } })}
        onSkipScan={() => dispatch({ type: 'SKIP_SCAN' })}
      />

      {/* Admin Dashboard */}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
