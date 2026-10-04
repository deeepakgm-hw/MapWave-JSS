import React, { useReducer, useState, useRef } from 'react';
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
import { LandingPage } from './features/landing';

export default function App() {
  const [state, dispatch] = useReducer(navigationReducer, INITIAL_NAV_STATE);
  const [isLandingOpen, setIsLandingOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [bearing, setBearing] = useState(0);
  const mapRef = useRef(null);

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
        return 'CAMPUS OVERVIEW • SELECT A BUILDING OR SEARCH';
      case NAV_STATES.BUILDING_FLOORS:
        return `ZONE: ${selectedBuilding?.name || 'BUILDING SELECTED'} • SELECT FLOOR`;
      case NAV_STATES.FLOOR_VIEW:
        return `FLOOR ${selectedFloor?.level_number || 1} • SELECT ROOM`;
      case NAV_STATES.ROUTE_PREVIEW:
        return `ROUTE TO ${destination?.name || destination?.room_code || 'DESTINATION'} • 3 MIN`;
      case NAV_STATES.ROUTING_ACTIVE:
        return `ACTIVE GUIDANCE • ${destination?.room_code || 'DESTINATION'}`;
      case NAV_STATES.QR_PROMPT:
        return 'SCAN INDOOR CHECKPOINT';
      case NAV_STATES.ARRIVED:
        return 'DESTINATION REACHED';
      default:
        return 'MAPWAVE - JSSATE';
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
      if (gpsLocation && mapRef.current) {
        mapRef.current.easeTo({
          center: [gpsLocation.longitude, gpsLocation.latitude],
          zoom: 18,
        });
      }
    }
  };

  const handleExplore = (quality) => {
    console.log('Entering MapWave 3D Campus Experience in quality:', quality);
    setIsLandingOpen(false);
  };

  return (
    <div className="relative flex flex-col h-screen w-screen bg-stone-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Immersive 3D Interactive Landing Page (thekenyamap.com Style) */}
      {isLandingOpen ? (
        <LandingPage onExplore={handleExplore} />
      ) : (
        <>
          {/* Top Bar with MapWave Minimal Branding & Return to Intro */}
          <TopBar
            state={state}
            onBack={(targetLevel) => dispatch({ type: 'BACK', payload: targetLevel })}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenLanding={() => setIsLandingOpen(true)}
            bearing={bearing}
            onResetNorth={() => mapRef.current?.easeTo({ bearing: 0, pitch: 45 })}
          />

          {/* Main 3D Satellite Map Viewport - Full Bleed */}
          <main className="flex-1 relative w-full h-full bg-stone-950">
            <MapOutdoor
              currentState={currentState}
              selectedBuilding={selectedBuilding}
              activeRoute={activeRoute}
              onSelectBuilding={handleSelectBuilding}
              onUpdateLocation={(loc) => dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc })}
              onBearingChange={setBearing}
              mapRefOut={mapRef}
            />

            {/* Floating Controller Cluster (Compass, Zoom In/Out, Locate Me, Accessible Toggle) */}
            <FloatingControls
              onLocateMe={handleLocateMe}
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              isAccessibleMode={isAccessibleMode}
              onToggleAccessible={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
              geoDenied={false}
              bearing={bearing}
              onResetNorth={() => mapRef.current?.easeTo({ bearing: 0, pitch: 45 })}
            />
          </main>

          {/* Sleek Bottom Sheet */}
          <BottomSheet
            summary={getBottomSheetSummary()}
            onClose={() => dispatch({ type: 'BACK', payload: 'OVERVIEW' })}
          >
            {currentState === NAV_STATES.OVERVIEW && (
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">
                    Campus Zones & Navigation
                  </h4>
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                    JSSATE Bangalore
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  Explore 3D outdoor building zones, view indoor floorplans, or search for faculty offices and laboratories across JSS Academy of Technical Education.
                </p>

                {/* Quick Department Zone Filter Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium border border-white/15 transition-colors cursor-pointer"
                  >
                    Block C (CS & AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium border border-white/15 transition-colors cursor-pointer"
                  >
                    Admin Block A
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium border border-white/15 transition-colors cursor-pointer"
                  >
                    Library Block B
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px] cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Rooms & Labs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(true)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white/90 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20 flex items-center gap-1.5 min-h-[44px] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin</span>
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
              <div className="flex flex-col gap-3 py-3 text-center items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    You Have Arrived
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Destination <span className="text-amber-300 font-semibold">{destination?.name || destination?.room_code || 'Room'}</span> reached.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'DISMISS' })}
                  className="min-h-[44px] w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-full border border-white/20 shadow-lg transition-colors cursor-pointer mt-1"
                >
                  Done & Return to Campus Overview
                </button>
              </div>
            )}
          </BottomSheet>
        </>
      )}

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
