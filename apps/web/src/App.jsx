import React, { useReducer, useState, useRef, useEffect } from 'react';
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
import { Interactive3DMap } from './features/map-3d';
import { IndoorMapView } from './features/map-indoor';
import { RoutePreviewCard, ActiveNavigationHUD } from './features/routing';
import { QRScannerModal } from './features/qr-checkpoint';
import { AdminDashboard } from './features/admin';
import { LandingPage } from './features/landing';
import { ContextPanel, FloatingMapOverlay } from './components/dashboard';
import { DetailPanel } from './components/dashboard/DetailPanel';
import { CommandStack } from './components/navigation/CommandStack';
import { MapControls } from './components/navigation/MapControls';
import { FloorSwitcher } from './components/navigation/FloorSwitcher';
import { buildingMetadata, CAMPUS_CENTER } from './data';
import { getMapConfig, MAP_PROVIDERS } from './config/mapConfig';
import { useGeofence } from './hooks/useGeofence';
import { APP_MODES } from './services/geofenceService';
import { findIndoorRoute } from './services/indoorNavigationGraph';

export const PILOT_BUILDINGS = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Block A (CSE, ISE, Robotics, Mechanical)',
    shortName: 'Block A',
    code: 'BLOCK_A',
    status: 'existing',
    height_m: 22.0,
    center: [77.5057, 12.9015],
  },
  {
    id: 'b3000000-0000-0000-0000-000000000003',
    name: 'Block B (ECE, EIE & Library)',
    shortName: 'Block B',
    code: 'BLOCK_B',
    status: 'existing',
    height_m: 18.0,
    center: [77.50495, 12.9027],
  },
  {
    id: 'b2000000-0000-0000-0000-000000000002',
    name: 'Civil Block',
    shortName: 'Civil Block',
    code: 'BLOCK_CIVIL',
    status: 'existing',
    height_m: 20.0,
    center: [77.5068, 12.9022],
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
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimerRef = useRef(null);
  const simulationIndexRef = useRef(0);
  const mapRef = useRef(null);
  const topo3DRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
    return 'dark';
  });
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isGridAudit, setIsGridAudit] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsPanelOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGridAudit((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Authoritative Geofencing (Turf.js PIP + Browser Geolocation + 3-reading Hysteresis)
  const {
    mode: currentMode,
    isInsideCampus,
    userLocation: geofenceLoc,
    distanceToCampusKm,
    gpsStatus,
    accuracyValid,
    consecutiveCount,
    startWatching,
    stopWatching,
    processGpsFix,
    manualSetMode,
  } = useGeofence({
    initialMode: APP_MODES.CAMPUS_MODE,
    onLocationUpdate: (loc) => {
      dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc });
    },
    onModeSwitch: (newMode, coords) => {
      console.log(`[Geofence] Mode switched to ${newMode} at:`, coords);
    },
  });

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
    if (currentMode === APP_MODES.EXPLORE_MODE) {
      return `EXPLORE MODE • OUTSIDE CAMPUS (${distanceToCampusKm.toFixed(1)} KM)`;
    }

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
    if (building?.enterCampus) {
      manualSetMode(APP_MODES.CAMPUS_MODE);
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: CAMPUS_CENTER,
          zoom: 17.6,
          pitch: 45,
          duration: 1500,
        });
      }
      return;
    }
    const meta = buildingMetadata[building.id] || buildingMetadata[building.code] || {};
    const isBlockA = building.code === 'BLOCK_A' || building.name?.includes('Block A');
    const enriched = {
      ...meta,
      ...building,
      departments: building.departments || meta.departments || [],
      facilities: building.facilities || meta.facilities || [],
      verification: building.verification || meta.verification || 'verified',
      indoor_mapping_status: building.indoor_mapping_status || meta.indoor_mapping_status || 'available',
      center: isBlockA ? [77.50456, 12.90282] : (building.center || meta.center),
    };
    dispatch({ type: 'SELECT_BUILDING', payload: enriched });
  };

  const handleSelectFloor = (floor) => {
    dispatch({ type: 'SELECT_FLOOR', payload: floor });
  };

  const handleSelectRoom = (room) => {
    dispatch({ type: 'SELECT_ROOM', payload: room });
  };

  const handleStartRoomRoute = (room) => {
    const isBlockA = selectedBuilding?.code === 'BLOCK_A' || selectedBuilding?.name?.includes('Block A');
    let route = null;
    if (isBlockA && (selectedFloor?.level_number === 2 || !selectedFloor)) {
      const startPos = gpsLocation ? [gpsLocation.longitude, gpsLocation.latitude] : null;
      route = findIndoorRoute('BLOCK_A', 2, startPos, room);
    }

    dispatch({
      type: 'SELECT_ROOM_DESTINATION',
      payload: { room, destination: room, route },
    });
  };

  const handleSearchResultSelect = ({ room, building, floor }) => {
    const isBlockA = building?.code === 'BLOCK_A' || building?.name?.includes('Block A');
    let route = null;
    if (isBlockA && (floor?.level_number === 2 || !floor)) {
      const startPos = gpsLocation ? [gpsLocation.longitude, gpsLocation.latitude] : null;
      route = findIndoorRoute('BLOCK_A', 2, startPos, room);
    }
    dispatch({
      type: 'SEARCH_ROOM',
      payload: { room, building, floor, route },
    });
  };

  const CAMPUS_SIMULATION_WAYPOINTS = [
    { name: 'Central Quadrangle (Inside Boundary)', latitude: 12.90247, longitude: 77.50546, accuracy: 4.0 },
    { name: 'Block A (CSE & Robotics)', latitude: 12.90150, longitude: 77.50570, accuracy: 3.5 },
    { name: 'Block B (ECE & Library)', latitude: 12.90260, longitude: 77.50495, accuracy: 3.0 },
    { name: 'Outside Campus - Uttarahalli Road (Step 1)', latitude: 12.89800, longitude: 77.50100, accuracy: 5.0 },
    { name: 'Outside Campus - Uttarahalli Road (Step 2)', latitude: 12.89800, longitude: 77.50100, accuracy: 5.0 },
    { name: 'Outside Campus - Uttarahalli Road (Step 3 -> EXPLORE_MODE)', latitude: 12.89800, longitude: 77.50100, accuracy: 5.0 },
    { name: 'Re-entering Main Campus Gate', latitude: 12.90080, longitude: 77.50420, accuracy: 4.5 },
    { name: 'Central Quadrangle (Inside - Step 1)', latitude: 12.90247, longitude: 77.50546, accuracy: 4.0 },
    { name: 'Central Quadrangle (Inside - Step 2)', latitude: 12.90247, longitude: 77.50546, accuracy: 4.0 },
    { name: 'Central Quadrangle (Inside - Step 3 -> CAMPUS_MODE)', latitude: 12.90247, longitude: 77.50546, accuracy: 4.0 },
  ];

  const handleToggleSimulateCampus = () => {
    if (isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setIsGpsActive(true);
    simulationIndexRef.current = 0;
    const firstWp = CAMPUS_SIMULATION_WAYPOINTS[0];
    dispatch({ type: 'UPDATE_GPS_LOCATION', payload: firstWp });
    processGpsFix(firstWp);

    if (currentProvider === MAP_PROVIDERS.TOPO) {
      topo3DRef.current?.recenter?.();
    } else if (mapRef.current) {
      mapRef.current.flyTo({
        center: [firstWp.longitude, firstWp.latitude],
        zoom: 18.2,
        pitch: isTopView ? 0 : 45,
        duration: 1200,
      });
    }

    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    simulationTimerRef.current = setInterval(() => {
      simulationIndexRef.current = (simulationIndexRef.current + 1) % CAMPUS_SIMULATION_WAYPOINTS.length;
      const wp = CAMPUS_SIMULATION_WAYPOINTS[simulationIndexRef.current];
      dispatch({ type: 'UPDATE_GPS_LOCATION', payload: wp });
      processGpsFix(wp);
      if (currentProvider === MAP_PROVIDERS.TOPO) {
        topo3DRef.current?.recenter?.();
      } else if (mapRef.current) {
        mapRef.current.easeTo({
          center: [wp.longitude, wp.latitude],
          zoom: 18.2,
          duration: 1000,
        });
      }
    }, 3200);
  };

  const handleLocateMe = () => {
    setIsGpsActive(true);
    if (isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsSimulating(false);
    }

    // Start background geofencing watcher
    startWatching();

    // If coordinates are already cached, immediately fly to them
    if (gpsLocation) {
      if (currentProvider === MAP_PROVIDERS.TOPO) {
        topo3DRef.current?.recenter?.();
      } else if (mapRef.current) {
        mapRef.current.flyTo({
          center: [gpsLocation.longitude, gpsLocation.latitude],
          zoom: 18.2,
          pitch: isTopView ? 0 : 45,
          duration: 1200,
        });
      }
    }

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by this browser');
      const fallbackLoc = { latitude: CAMPUS_CENTER[1], longitude: CAMPUS_CENTER[0], accuracy: 8 };
      dispatch({ type: 'UPDATE_GPS_LOCATION', payload: fallbackLoc });
      processGpsFix(fallbackLoc);
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc });
        processGpsFix(loc);

        if (currentProvider === MAP_PROVIDERS.TOPO) {
          setTimeout(() => topo3DRef.current?.recenter?.(), 100);
        } else if (mapRef.current) {
          mapRef.current.flyTo({
            center: [loc.longitude, loc.latitude],
            zoom: 18.2,
            pitch: isTopView ? 0 : 45,
            duration: 1200,
          });
        }
      },
      (err) => {
        console.warn('Geolocation error / permission denied / timeout:', err);
        setIsGpsLoading(false);
        // Fallback: If device or browser blocks or times out geolocation (common on desktop/wifi),
        // ensure the blue dot is immediately placed on campus so the user can see and test!
        if (!gpsLocation) {
          const campusFallback = { latitude: CAMPUS_CENTER[1], longitude: CAMPUS_CENTER[0], accuracy: 10 };
          dispatch({ type: 'UPDATE_GPS_LOCATION', payload: campusFallback });
          processGpsFix(campusFallback);
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [campusFallback.longitude, campusFallback.latitude],
              zoom: 18.2,
              pitch: isTopView ? 0 : 45,
              duration: 1200,
            });
          }
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleToggleGps = () => {
    handleLocateMe();
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

  // Trigger map resize when switching from landing page to split-screen view
  useEffect(() => {
    if (!isLandingOpen && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLandingOpen]);

  return (
    <div className="relative flex flex-col h-screen w-screen bg-stone-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Immersive 3D Interactive Landing Page (thekenyamap.com Style) */}
      {isLandingOpen ? (
        <LandingPage onExplore={handleExplore} />
      ) : (
        <div className="relative h-full w-full overflow-hidden bg-stone-950 font-sans" style={{ fontFamily: 'var(--font-ui)' }}>
          {isGridAudit && <div className="grid-audit-overlay" />}

          {/* Map Scrims for Top & Bottom satellite legibility */}
          <div className="map-scrim-top" />
          <div className="map-scrim-bottom" />

          {/* Full-bleed Map Viewport Canvas */}
          <main className="absolute inset-0 w-full h-full bg-stone-950 z-0">
            {currentProvider === MAP_PROVIDERS.TOPO ? (
              <Interactive3DMap
                ref={topo3DRef}
                currentState={currentState}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={handleSelectBuilding}
                onBearingChange={setBearing}
                isTopView={isTopView}
                gpsLocation={gpsLocation}
                onSimulateCampusWalk={handleToggleSimulateCampus}
                isSimulating={isSimulating}
              />
            ) : (
              <MapOutdoor
                currentState={currentState}
                selectedBuilding={selectedBuilding}
                selectedFloor={selectedFloor}
                selectedRoom={selectedRoom}
                onSelectRoom={handleSelectRoom}
                activeRoute={activeRoute}
                onSelectBuilding={handleSelectBuilding}
                onUpdateLocation={(loc) => dispatch({ type: 'UPDATE_GPS_LOCATION', payload: loc })}
                onBearingChange={setBearing}
                mapRefOut={mapRef}
                currentProvider={currentProvider}
                isTopView={isTopView}
                gpsLocation={gpsLocation}
                isGpsActive={isGpsActive}
                onToggleGps={handleToggleGps}
                onSimulateCampusWalk={handleToggleSimulateCampus}
                isSimulating={isSimulating}
                currentMode={currentMode}
                isInsideCampus={isInsideCampus}
                distanceToCampusKm={distanceToCampusKm}
                onSwitchMode={manualSetMode}
              />
            )}
          </main>

          {/* Top-Left Command Stack (420px column, 12px gap, 16px inset) */}
          <div className="fixed top-4 left-4 xl:top-6 xl:left-6 z-30 pointer-events-none">
            <CommandStack
              selectedBuilding={selectedBuilding}
              onClearBuilding={() => dispatch({ type: 'BACK', payload: 'OVERVIEW' })}
              currentMode={currentMode}
              isInsideCampus={isInsideCampus}
              distanceToCampusKm={distanceToCampusKm}
              onSwitchMode={manualSetMode}
              isTopView={isTopView}
              onToggleViewMode={handleToggleViewMode}
              currentProvider={currentProvider}
              onSwitchProvider={setCurrentProvider}
              onLocateMe={handleLocateMe}
              isGpsActive={isGpsActive}
              isGpsLoading={isGpsLoading}
              bearing={bearing}
              onResetNorth={() => {
                if (currentProvider === MAP_PROVIDERS.TOPO) {
                  topo3DRef.current?.resetNorth?.();
                } else {
                  mapRef.current?.easeTo?.({ bearing: 0, pitch: isTopView ? 0 : 45 });
                }
              }}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAdmin={() => setIsAdminOpen(true)}
              onOpenIntro={() => setIsLandingOpen(true)}
              theme={theme}
              onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              isGridAudit={isGridAudit}
              onToggleGridAudit={() => setIsGridAudit((g) => !g)}
            />
          </div>

          {/* Desktop Right Detail Panel (400px floating panel, 16px inset, radius 24) */}
          <div className="hidden lg:block">
            <DetailPanel
              isOpen={isPanelOpen}
              onClose={() => setIsPanelOpen(false)}
              onToggleOpen={() => setIsPanelOpen((prev) => !prev)}
              selectedBuilding={selectedBuilding}
              selectedFloor={selectedFloor}
              selectedRoom={selectedRoom}
              destination={destination}
              activeRoute={activeRoute}
              currentState={currentState}
              currentMode={currentMode}
              isInsideCampus={isInsideCampus}
              distanceToCampusKm={distanceToCampusKm}
              gpsLocation={gpsLocation}
              isGpsActive={isGpsActive}
              isAccessibleMode={isAccessibleMode}
              onSelectBuilding={handleSelectBuilding}
              onSelectFloor={handleSelectFloor}
              onSelectRoom={handleSelectRoom}
              onNavigateToRoom={handleStartRoomRoute}
              onClearRoom={() => dispatch({ type: 'CLEAR_SELECTED_ROOM' })}
              onStartNavigation={() => dispatch({ type: 'START_NAVIGATION' })}
              onCancelRoute={() => dispatch({ type: 'DISMISS' })}
              onToggleAccessible={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
              onResetToCampus={() => dispatch({ type: 'BACK', payload: 'OVERVIEW' })}
              onOpenSearch={() => setIsSearchOpen(true)}
              onLocateMe={handleLocateMe}
              pilotBuildings={PILOT_BUILDINGS}
              otherFacilities={OTHER_CAMPUS_FACILITIES}
            />
          </div>

          {/* Bottom-Right Floating Map Controls Dock (Pill, animated offset) */}
          <MapControls
            bearing={bearing}
            onResetNorth={() => {
              if (currentProvider === MAP_PROVIDERS.TOPO) {
                topo3DRef.current?.resetNorth?.();
              } else {
                mapRef.current?.easeTo?.({ bearing: 0, pitch: isTopView ? 0 : 45 });
              }
            }}
            onZoomIn={() => {
              if (currentProvider === MAP_PROVIDERS.TOPO) {
                topo3DRef.current?.zoomIn?.();
              } else {
                mapRef.current?.zoomIn?.();
              }
            }}
            onZoomOut={() => {
              if (currentProvider === MAP_PROVIDERS.TOPO) {
                topo3DRef.current?.zoomOut?.();
              } else {
                mapRef.current?.zoomOut?.();
              }
            }}
            onLocateMe={handleLocateMe}
            isGpsActive={isGpsActive}
            isGpsLoading={isGpsLoading}
            isPanelOpen={isPanelOpen}
          />

          {/* Bottom-Left Floor Switcher & Telemetry Strip */}
          <FloorSwitcher
            currentFloor={selectedFloor?.level_number || 2}
            onSelectFloor={(fl) => handleSelectFloor({ level_number: fl, name: `Floor ${fl}` })}
            coordinates={gpsLocation ? [gpsLocation.longitude, gpsLocation.latitude] : CAMPUS_CENTER}
            zoom={18}
          />

          {/* Mobile Bottom Sheet (<1024w) */}
          <div className="lg:hidden">
            <BottomSheet
              summary={getBottomSheetSummary()}
              onClose={() => dispatch({ type: 'BACK', payload: 'OVERVIEW' })}
            >
              {currentMode === APP_MODES.EXPLORE_MODE ? (
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Explore Mode Active
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                      Outside Geofence
                    </span>
                  </div>

                  <p className="text-xs text-white/70 font-normal leading-relaxed">
                    You are currently <strong className="text-amber-300 font-semibold">{distanceToCampusKm.toFixed(1)} km</strong> from JSS Academy of Technical Education. Real-time outdoor GPS tracking is active. Indoor building models and floor navigation are disabled until entering campus.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        manualSetMode(APP_MODES.CAMPUS_MODE);
                        if (mapRef.current) {
                          mapRef.current.flyTo({
                            center: CAMPUS_CENTER,
                            zoom: 17.6,
                            pitch: 45,
                            duration: 1500,
                          });
                        }
                      }}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px] cursor-pointer"
                    >
                      <span>🏫 Enter Campus 3D Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLocateMe}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20 flex items-center justify-center gap-1.5 min-h-[44px] transition-colors cursor-pointer"
                    >
                      <span>My Location</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {currentState === NAV_STATES.OVERVIEW && (
                    <div className="flex flex-col gap-3 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">
                          Campus Overview
                        </h4>
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                          JSSATE Bangalore
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                          Pilot 3D Buildings
                        </span>
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
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(true)}
                          className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px] cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Search Rooms</span>
                        </button>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={isAccessibleMode}
                          onClick={() => dispatch({ type: 'TOGGLE_ACCESSIBLE' })}
                          className={`px-3 py-2.5 rounded-full text-xs font-medium border flex items-center gap-1.5 min-h-[44px] cursor-pointer ${
                            isAccessibleMode ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/10 text-white border-white/20'
                          }`}
                        >
                          <span>♿</span>
                          <span>Accessible</span>
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
                        <p className="text-xs text-white/70 font-medium mt-1">
                          Destination reached.
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
                </>
              )}
            </BottomSheet>
          </div>
        </div>
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
