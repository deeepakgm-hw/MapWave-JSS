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

  // Compute BottomSheet single-line summary badge string based on currentState
  const getBottomSheetSummary = () => {
    switch (currentState) {
      case NAV_STATES.OVERVIEW:
        return '📍 Tap a campus building or search a room to start';
      case NAV_STATES.BUILDING_FLOORS:
        return `🏢 ${selectedBuilding?.name || 'Building Selected'} • Select a floor`;
      case NAV_STATES.FLOOR_VIEW:
        return `🗺️ Floor ${selectedFloor?.level_number || 1} • Select a destination room`;
      case NAV_STATES.ROUTE_PREVIEW:
        return `🚶 Route to ${destination?.name || destination?.room_code || 'Destination'} • 3 min walk (185m)`;
      case NAV_STATES.ROUTING_ACTIVE:
        return `🏁 Turn-by-Turn Navigation Active • ${destination?.room_code || 'Destination'}`;
      case NAV_STATES.QR_PROMPT:
        return '📷 Scan Indoor QR Checkpoint Tag';
      case NAV_STATES.ARRIVED:
        return '🎉 Arrived at Destination!';
      default:
        return 'Campus Navigator';
    }
  };

  // Handle building selection on 3D Outdoor Map
  const handleSelectBuilding = (building) => {
    dispatch({ type: 'SELECT_BUILDING', payload: building });
  };

  // Handle floor selection inside building
  const handleSelectFloor = (floor) => {
    dispatch({ type: 'SELECT_FLOOR', payload: floor });
  };

  // Handle room destination selection
  const handleSelectRoom = (room) => {
    dispatch({
      type: 'SELECT_ROOM_DESTINATION',
      payload: { room, destination: room },
    });
  };

  // Handle global search result room selection
  const handleSearchResultSelect = ({ room, building, floor }) => {
    dispatch({
      type: 'SEARCH_ROOM',
      payload: { room, building, floor },
    });
  };

  // Handle Locate Me button tap
  const handleLocateMe = () => {
    if (gpsLocation && gpsLocation.accuracy > 15.0 && (currentState === NAV_STATES.FLOOR_VIEW || currentState === NAV_STATES.ROUTING_ACTIVE)) {
      // Low GPS confidence indoors triggers QR prompt
      dispatch({ type: 'TRIGGER_REANCHOR' });
    } else {
      console.log('Recentering camera on GPS position:', gpsLocation);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Top Navigation Bar with Breadcrumbs & Search */}
      <TopBar
        state={state}
        onBack={(targetLevel) => dispatch({ type: 'BACK', payload: targetLevel })}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Map Viewport */}
      <main className="flex-1 relative w-full h-full p-3 bg-slate-200">
        <MapOutdoor
          currentState={currentState}
          selectedBuilding={selectedBuilding}
          activeRoute={activeRoute}
          onSelectBuilding={handleSelectBuilding}
          onUpdateLocation={(loc) => dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc })}
        />

        {/* Persistent Floating Controls (Locate me & Accessible route toggle) */}
        <FloatingControls
          onLocateMe={handleLocateMe}
          isAccessibleMode={isAccessibleMode}
          onToggleAccessible={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
          geoDenied={false}
        />
      </main>

      {/* Mobile-First Reusable Bottom Sheet */}
      <BottomSheet summary={getBottomSheetSummary()}>
        {currentState === NAV_STATES.OVERVIEW && (
          <div className="flex flex-col gap-3 py-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Campus Overview
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Explore 3D outdoor building footprints, view indoor floorplans, or search for any faculty office or laboratory across campus.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-extrabold shadow-md min-h-[44px]"
              >
                Search Destination Room 🔍
              </button>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 min-h-[44px]"
              >
                Admin ⚙️
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
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-extrabold animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">You Have Arrived!</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Destination <strong className="text-emerald-700">{destination?.name || destination?.room_code || 'Room'}</strong> reached.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'DISMISS' })}
              className="min-h-[44px] w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Done & Return to Campus Overview
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Global Room Search Modal */}
      <RoomSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRoom={handleSearchResultSelect}
      />

      {/* Indoor QR Re-Anchor Checkpoint Modal */}
      <QRScannerModal
        isOpen={currentState === NAV_STATES.QR_PROMPT}
        onScanSuccess={(node_id) => dispatch({ type: 'SCAN_SUCCESS', payload: { node_id } })}
        onSkipScan={() => dispatch({ type: 'SKIP_SCAN' })}
      />

      {/* Admin Dashboard Modal */}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
