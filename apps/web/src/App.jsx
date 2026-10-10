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
import { buildingMetadata, CAMPUS_CENTER } from './data';
import { getMapConfig, MAP_PROVIDERS } from './config/mapConfig';

export const PILOT_BUILDINGS = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Block C (CS & AI)',
    status: 'existing',
    height_m: 22.0,
    center: [77.5057, 12.9015],
  },
  {
    id: 'b2000000-0000-0000-0000-000000000002',
    name: 'Admin Block A',
    status: 'existing',
    height_m: 18.0,
    center: [77.5068, 12.9022],
  },
  {
    id: 'b3000000-0000-0000-0000-000000000003',
    name: 'Library Block B',
    status: 'existing',
    height_m: 15.0,
    center: [77.5048, 12.9026],
  },
];

export const OTHER_CAMPUS_FACILITIES = [
  {
    id: 'b4000000-0000-0000-0000-000000000004',
    name: 'Workshops (Mech & Civil)',
    status: 'existing',
    height_m: 12.0,
    center: [77.5063, 12.8997],
  },
  {
    id: 'b5000000-0000-0000-0000-000000000005',
    name: 'STEP Incubation',
    status: 'existing',
    height_m: 16.0,
    center: [77.5060, 12.9036],
  },
  {
    id: 'b6000000-0000-0000-0000-000000000006',
    name: 'Boys Hostel',
    status: 'existing',
    height_m: 20.0,
    center: [77.5047, 12.8992],
  },
  {
    id: 'b7000000-0000-0000-0000-000000000007',
    name: 'Girls Hostel',
    status: 'existing',
    height_m: 20.0,
    center: [77.5039, 12.8998],
  },
  {
    id: 'b8000000-0000-0000-0000-000000000008',
    name: 'Cafeteria',
    status: 'existing',
    height_m: 8.0,
    center: [77.5054, 12.9022],
  },
];

export default function App() {
  const [state, dispatch] = useReducer(navigationReducer, INITIAL_NAV_STATE);
  const [isLandingOpen, setIsLandingOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showAllBuildings, setShowAllBuildings] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [isTopView, setIsTopView] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(
    getMapConfig().imageryProvider || MAP_PROVIDERS.GOOGLE
  );
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
    const meta = buildingMetadata[building.id] || buildingMetadata[building.code] || {};
    const enriched = {
      ...meta,
      ...building,
      departments: building.departments || meta.departments || [],
      facilities: building.facilities || meta.facilities || [],
      verification: building.verification || meta.verification || 'estimated',
      indoor_mapping_status: building.indoor_mapping_status || meta.indoor_mapping_status || 'planned',
      center: building.center || meta.center,
    };
    dispatch({ type: 'SELECT_BUILDING', payload: enriched });
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

  const handleSetViewMode = (mode) => {
    const targetTop = mode === 'top';
    setIsTopView(targetTop);
    const map = mapRef.current;
    if (!map) return;
    if (targetTop) {
      if (map.easeTo) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      } else if (map.flyTo) {
        map.flyTo({ pitch: 0, bearing: 0 });
      }
    } else {
      if (map.easeTo) {
        map.easeTo({ pitch: 45, bearing: -17.6, duration: 600 });
      } else if (map.flyTo) {
        map.flyTo({ pitch: 45, bearing: -17.6 });
      }
    }
  };

  const handleToggleViewMode = () => {
    handleSetViewMode(isTopView ? '3d' : 'top');
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
            onResetNorth={() => mapRef.current?.easeTo?.({ bearing: 0, pitch: isTopView ? 0 : 45 })}
            isTopView={isTopView}
            onSetViewMode={handleSetViewMode}
            currentProvider={currentProvider}
            onSwitchProvider={setCurrentProvider}
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
              currentProvider={currentProvider}
              isTopView={isTopView}
            />

            {/* Floating Controller Cluster (Compass, Zoom In/Out, Locate Me, Accessible Toggle, 2D/3D View) */}
            <FloatingControls
              onLocateMe={handleLocateMe}
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              isAccessibleMode={isAccessibleMode}
              onToggleAccessible={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
              geoDenied={false}
              bearing={bearing}
              onResetNorth={() => mapRef.current?.easeTo?.({ bearing: 0, pitch: isTopView ? 0 : 45 })}
              isTopView={isTopView}
              onToggleViewMode={handleToggleViewMode}
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

                {/* Pilot Building Selection Pills */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                      Pilot 3D Zones
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllBuildings(!showAllBuildings)}
                      className="text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      {showAllBuildings ? 'Show Pilot Only' : '+ All Facilities'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PILOT_BUILDINGS.map((building) => (
                      <button
                        key={building.id}
                        type="button"
                        onClick={() => handleSelectBuilding(building)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium border border-white/15 transition-colors cursor-pointer"
                      >
                        {building.name}
                      </button>
                    ))}
                  </div>

                  {showAllBuildings && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10 mt-1">
                      {OTHER_CAMPUS_FACILITIES.map((facility) => (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() => handleSelectBuilding(facility)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/15 text-slate-300 rounded-full text-[11px] font-medium border border-white/10 transition-colors cursor-pointer"
                        >
                          {facility.name}
                        </button>
                      ))}
                    </div>
                  )}
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
