import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '../../lib/apiClient';
import { NAV_STATES } from '../../lib/navigationState';
import {
  campusBoundary,
  campusBuildings,
  campusPaths,
  campusFacilities,
  buildingMetadata,
  CAMPUS_CENTER,
} from '../../data';
import {
  getMapConfig,
  getSatelliteStyle,
  MAP_PROVIDERS,
} from '../../config/mapConfig';

export default function MapOutdoor({
  currentState,
  selectedBuilding,
  activeRoute,
  onSelectBuilding,
  onUpdateLocation,
  onBearingChange,
  mapRefOut,
  isTopView: isTopViewProp,
  onViewModeChange,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const watchIdRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);

  const mapConfig = getMapConfig();
  const [currentProvider, setCurrentProvider] = useState(
    mapConfig.imageryProvider || MAP_PROVIDERS.GOOGLE
  );
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [localTopView, setLocalTopView] = useState(false);
  const isTopView = isTopViewProp !== undefined ? isTopViewProp : localTopView;

  const handleSetViewMode = (mode) => {
    const map = mapRef.current;
    if (!map) return;
    const targetTop = mode === 'top';
    setLocalTopView(targetTop);
    if (onViewModeChange) {
      onViewModeChange(targetTop);
    }
    if (targetTop) {
      if (map.easeTo) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      } else if (map.flyTo) {
        map.flyTo({ pitch: 0, bearing: 0 });
      }
    } else {
      if (map.easeTo) {
        map.easeTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
          duration: 800,
        });
      } else if (map.flyTo) {
        map.flyTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
        });
      }
    }
  };

  // Helper to convert accuracy meters to pixels at given latitude and zoom level
  const getAccuracyPixelRadius = (accuracyMeters, lat, zoom) => {
    if (!accuracyMeters || !lat) return 20;
    const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
    return Math.max(10, Math.min(200, accuracyMeters / metersPerPixel));
  };

  // Reusable function to add/restore campus GIS layers
  const addCampusLayers = useCallback((map, buildingsOverride = null) => {
    if (!map || !map.isStyleLoaded()) return;

    // 1. Campus Boundary (Official perimeter from geojsonjss.geojson)
    if (!map.getSource('campus-boundary')) {
      map.addSource('campus-boundary', {
        type: 'geojson',
        data: campusBoundary,
      });

      map.addLayer({
        id: 'campus-boundary-fill',
        type: 'fill',
        source: 'campus-boundary',
        paint: {
          'fill-color': '#0284c7',
          'fill-opacity': 0.04,
        },
      });

      map.addLayer({
        id: 'campus-boundary-line',
        type: 'line',
        source: 'campus-boundary',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85,
        },
      });
    }

    // 2. Campus Facilities & Open Spaces (Sports Ground, Courts, Parking, Gardens)
    if (!map.getSource('campus-facilities')) {
      map.addSource('campus-facilities', {
        type: 'geojson',
        data: campusFacilities,
      });

      map.addLayer({
        id: 'campus-facilities-fill',
        type: 'fill',
        source: 'campus-facilities',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'match',
            ['get', 'category'],
            'Sports', '#166534',
            'Landscape', '#15803d',
            'Parking', '#334155',
            '#475569'
          ],
          'fill-opacity': [
            'match',
            ['get', 'category'],
            'Sports', 0.45,
            'Landscape', 0.4,
            'Parking', 0.55,
            0.35
          ],
        },
      });

      map.addLayer({
        id: 'campus-facilities-line',
        type: 'line',
        source: 'campus-facilities',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': [
            'match',
            ['get', 'category'],
            'Sports', '#22c55e',
            'Landscape', '#4ade80',
            'Parking', '#64748b',
            '#94a3b8'
          ],
          'line-width': 1.2,
          'line-opacity': 0.7,
        },
      });
    }

    // 3. Campus Roads and Pedestrian Walkways
    if (!map.getSource('campus-paths')) {
      map.addSource('campus-paths', {
        type: 'geojson',
        data: campusPaths,
      });

      map.addLayer({
        id: 'campus-paths-casing',
        type: 'line',
        source: 'campus-paths',
        paint: {
          'line-color': '#0f172a',
          'line-width': [
            'match',
            ['get', 'type'],
            'road', 5.5,
            'pedestrian', 3.5,
            3.0
          ],
          'line-opacity': 0.55,
        },
      });

      map.addLayer({
        id: 'campus-paths-surface',
        type: 'line',
        source: 'campus-paths',
        paint: {
          'line-color': [
            'match',
            ['get', 'type'],
            'road', '#cbd5e1',
            'pedestrian', '#fbbf24',
            '#e2e8f0'
          ],
          'line-width': [
            'match',
            ['get', 'type'],
            'road', 3.2,
            'pedestrian', 2.0,
            1.8
          ],
          'line-opacity': 0.85,
        },
      });
    }

    // 4. Campus 3D Buildings (Fill-Extrusion Layer on top of satellite)
    const buildingsData = buildingsOverride || campusBuildings;

    if (!map.getSource('campus-buildings')) {
      map.addSource('campus-buildings', {
        type: 'geojson',
        data: buildingsData,
      });

      // Layer 1: Existing Buildings (Clean 3D Extrusion using height_m)
      map.addLayer({
        id: 'existing-buildings-extrusion',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['==', ['get', 'status'], 'existing'],
        paint: {
          'fill-extrusion-color': [
            'case',
            ['==', ['get', 'verification'], 'verified'],
            '#2563eb',
            '#0284c7'
          ],
          'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
        },
      });

      // Layer 1b: Hover Highlight State (Subtle brightening)
      map.addLayer({
        id: 'hovered-building-extrusion',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'fill-extrusion-color': '#60a5fa',
          'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.98,
        },
      });

      // Layer 2: Highlighted Selected Building (Amber Glow)
      map.addLayer({
        id: 'selected-building-highlight',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'fill-extrusion-color': '#f59e0b',
          'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1.0,
        },
      });

      // Layer 3: Proposed Buildings
      map.addLayer({
        id: 'proposed-buildings-extrusion',
        type: 'fill-extrusion',
        source: 'campus-buildings',
        filter: ['==', ['get', 'status'], 'proposed'],
        paint: {
          'fill-extrusion-color': '#64748b',
          'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.45,
        },
      });
    }

    // Clear any markers so map labels are disabled
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Switch imagery provider at runtime
  const handleSwitchProvider = (newProvider) => {
    setCurrentProvider(newProvider);
    setShowProviderMenu(false);
    if (mapRef.current) {
      const newStyle = getSatelliteStyle(newProvider, mapConfig.apiKey);
      mapRef.current.setStyle(newStyle);
      mapRef.current.once('styledata', () => {
        addCampusLayers(mapRef.current);
      });
    }
  };

  // 1. Initialize MapLibre Map with High-Resolution Satellite Map Source
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const mapCenter = mapConfig.campusCoordinates || CAMPUS_CENTER;
    const initialStyle = getSatelliteStyle(currentProvider, mapConfig.apiKey);

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: mapCenter,
      zoom: mapConfig.initialZoom || 16.8,
      pitch: mapConfig.initialPitch || 45,
      bearing: mapConfig.initialBearing || -17.6,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
    });

    mapRef.current = map;
    if (mapRefOut) {
      mapRefOut.current = map;
    }

    // Camera rotation & bearing tracking
    map.on('rotate', () => {
      if (onBearingChange) {
        onBearingChange(map.getBearing());
      }
    });

    // Pitch tracking to synchronize Top View vs 3D View states
    map.on('pitch', () => {
      if (map.getPitch) {
        const top = map.getPitch() < 12;
        setLocalTopView(top);
        if (onViewModeChange) {
          onViewModeChange(top);
        }
      }
    });

    map.on('load', async () => {
      let finalBuildings = campusBuildings;
      try {
        const apiBuildings = await apiClient('/api/v1/buildings');
        if (apiBuildings && apiBuildings.features && apiBuildings.features.length > 0) {
          // Merge API status/heights with local rich GIS polygons
          finalBuildings = {
            type: 'FeatureCollection',
            features: campusBuildings.features.map((localFeat) => {
              const apiMatch = apiBuildings.features.find(
                (af) => af.id === localFeat.id || af.properties?.id === localFeat.id
              );
              return {
                ...localFeat,
                properties: {
                  ...localFeat.properties,
                  ...(apiMatch ? apiMatch.properties : {}),
                  height_m: apiMatch?.properties?.height_m || localFeat.properties.height_m || 15.0,
                  status: apiMatch?.properties?.status || localFeat.properties.status || 'existing',
                  verification: localFeat.properties.verification || 'verified',
                },
              };
            }),
          };
        }
      } catch {
        finalBuildings = campusBuildings;
      }

      addCampusLayers(map, finalBuildings);

      // Building hover state tracking
      let hoveredBuildingId = null;

      map.on('mousemove', 'existing-buildings-extrusion', (e) => {
        if (!e.features || e.features.length === 0) return;
        const bId = e.features[0].properties.id;
        map.getCanvas().style.cursor = 'pointer';
        if (bId !== hoveredBuildingId) {
          hoveredBuildingId = bId;
          if (map.getLayer && map.getLayer('hovered-building-extrusion')) {
            map.setFilter('hovered-building-extrusion', ['==', ['get', 'id'], bId]);
          }
        }
      });

      map.on('mouseleave', 'existing-buildings-extrusion', () => {
        hoveredBuildingId = null;
        map.getCanvas().style.cursor = '';
        if (map.getLayer && map.getLayer('hovered-building-extrusion')) {
          map.setFilter('hovered-building-extrusion', ['==', ['get', 'id'], '']);
        }
      });

      // Building click interaction (Unified with bottom-sheet selection)
      map.on('click', 'existing-buildings-extrusion', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const bProps = feature.properties;
        const meta = buildingMetadata[bProps.id] || buildingMetadata[bProps.code] || {};

        let centerCoord = meta.center || [e.lngLat.lng, e.lngLat.lat];
        if (!meta.center && feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates[0]) {
          const coords = feature.geometry.coordinates[0];
          let sumLng = 0;
          let sumLat = 0;
          const len = coords.length - 1;
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              sumLng += coords[i][0];
              sumLat += coords[i][1];
            }
            centerCoord = [sumLng / len, sumLat / len];
          }
        }

        const buildingObj = {
          id: bProps.id,
          name: bProps.name || meta.name || `Building ${bProps.id}`,
          code: bProps.code || meta.code || 'BLDG',
          category: bProps.category || meta.category || 'Academic',
          status: bProps.status || 'existing',
          verification: bProps.verification || meta.verification || 'estimated',
          height_m: bProps.height_m || meta.height_m || 15.0,
          floor_count: bProps.floor_count || meta.floor_count || 3,
          indoor_mapping_status: bProps.indoor_mapping_status || meta.indoor_mapping_status || 'planned',
          description: bProps.description || meta.description || '',
          departments: meta.departments || [],
          facilities: meta.facilities || [],
          operating_hours: meta.operating_hours || '',
          accessibility: meta.accessibility || '',
          center: centerCoord,
        };

        if (onSelectBuilding) {
          onSelectBuilding(buildingObj);
        }
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [addCampusLayers, onSelectBuilding, onBearingChange, onViewModeChange, mapRefOut, mapConfig]);

  // Synchronize camera when isTopView prop is toggled externally
  useEffect(() => {
    if (isTopViewProp === undefined || !mapRef.current) return;
    const map = mapRef.current;
    const currentPitch = map.getPitch ? map.getPitch() : 45;
    if (isTopViewProp && currentPitch > 10) {
      if (map.easeTo) map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      else if (map.flyTo) map.flyTo({ pitch: 0, bearing: 0 });
    } else if (!isTopViewProp && currentPitch < 10) {
      if (map.easeTo) {
        map.easeTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
          duration: 800,
        });
      } else if (map.flyTo) {
        map.flyTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
        });
      }
    }
  }, [isTopViewProp, mapConfig.initialPitch, mapConfig.initialBearing]);

  // 2. Camera Swoop & Highlight reacting to State Machine
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (currentState === NAV_STATES.BUILDING_FLOORS && selectedBuilding?.center) {
      map.flyTo({
        center: selectedBuilding.center,
        zoom: 18.5,
        pitch: 60,
        bearing: -20,
        speed: 1.2,
      });

      if (map.getLayer && map.getLayer('selected-building-highlight')) {
        map.setFilter('selected-building-highlight', ['==', ['get', 'id'], selectedBuilding.id]);
      }
    } else if (currentState === NAV_STATES.OVERVIEW) {
      map.flyTo({
        center: CAMPUS_CENTER,
        zoom: 16.8,
        pitch: 45,
        bearing: -17.6,
        speed: 1.2,
      });

      if (map.getLayer && map.getLayer('selected-building-highlight')) {
        map.setFilter('selected-building-highlight', ['==', ['get', 'id'], '']);
      }
    }
  }, [currentState, selectedBuilding]);

  // 3. Geolocation Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const loc = { latitude, longitude, accuracy };
        setUserLocation(loc);
        setGeoDenied(false);
        if (onUpdateLocation) {
          onUpdateLocation(loc);
        }
      },
      (error) => {
        console.warn('Geolocation error / permission denied:', error.message);
        setGeoDenied(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onUpdateLocation]);

  // 4. Update GPS Dot & Accuracy Circle on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !userLocation || geoDenied) return;

    const { latitude, longitude, accuracy } = userLocation;
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      ],
    };

    if (map.getSource('gps-location-source')) {
      map.getSource('gps-location-source').setData(geojson);
    } else {
      map.addSource('gps-location-source', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'gps-accuracy-circle',
        type: 'circle',
        source: 'gps-location-source',
        paint: {
          'circle-radius': getAccuracyPixelRadius(accuracy, latitude, map.getZoom()),
          'circle-color': '#3b82f6',
          'circle-opacity': 0.2,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#3b82f6',
          'circle-stroke-opacity': 0.5,
        },
      });

      map.addLayer({
        id: 'gps-location-dot',
        type: 'circle',
        source: 'gps-location-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#3b82f6',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    const handleZoom = () => {
      if (map.getLayer && map.getLayer('gps-accuracy-circle')) {
        map.setPaintProperty(
          'gps-accuracy-circle',
          'circle-radius',
          getAccuracyPixelRadius(accuracy, latitude, map.getZoom())
        );
      }
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [userLocation, geoDenied]);

  // 5. Render Animated Route Path Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const shouldShowRoute = currentState === NAV_STATES.ROUTE_PREVIEW || currentState === NAV_STATES.ROUTING_ACTIVE;

    if (shouldShowRoute) {
      const sampleRouteGeoJson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [77.5057, 12.9015],
            [77.5061, 12.9019],
            [77.5065, 12.9023],
          ],
        },
      };

      if (map.getSource('active-route-source')) {
        map.getSource('active-route-source').setData(sampleRouteGeoJson);
      } else {
        map.addSource('active-route-source', {
          type: 'geojson',
          data: sampleRouteGeoJson,
        });

        map.addLayer({
          id: 'active-route-line-casing',
          type: 'line',
          source: 'active-route-source',
          paint: {
            'line-color': '#0f172a',
            'line-width': 8,
            'line-opacity': 0.7,
          },
        });

        map.addLayer({
          id: 'active-route-line',
          type: 'line',
          source: 'active-route-source',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
          },
        });
      }
    } else {
      if (map.getLayer && map.getLayer('active-route-line')) map.removeLayer('active-route-line');
      if (map.getLayer && map.getLayer('active-route-line-casing')) map.removeLayer('active-route-line-casing');
      if (map.getSource && map.getSource('active-route-source')) map.removeSource('active-route-source');
    }
  }, [currentState, activeRoute]);

  // 6. Poll Nearest Building API
  useEffect(() => {
    if (!userLocation || geoDenied) return;

    let isSubscribed = true;
    const fetchNearest = async () => {
      try {
        const data = await apiClient(
          `/api/v1/buildings/nearest?lat=${userLocation.latitude}&lon=${userLocation.longitude}&accuracy_m=${userLocation.accuracy}`
        );
        if (isSubscribed) {
          setNearestInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch nearest building:', err);
      }
    };

    fetchNearest();
    const interval = setInterval(fetchNearest, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [userLocation, geoDenied]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-stone-950">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* Floating Top-Right Controls: View Mode Switcher + Satellite Provider */}
      <div className="absolute top-4 right-16 sm:right-28 z-20 flex items-center gap-2">
        {/* Top View (2D) / 3D Cross View Segmented Pill */}
        <div className="flex items-center bg-stone-900/85 backdrop-blur-xl border border-white/20 rounded-full p-0.5 shadow-lg">
          <button
            type="button"
            onClick={() => handleSetViewMode('top')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              isTopView
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            title="Top View (Flat 2D Overhead 0°)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span>Top View</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetViewMode('3d')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              !isTopView
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            title="3D Cross View (Tilted Perspective 45°)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>3D View</span>
          </button>
        </div>

        {/* Floating Satellite HD Imagery Quality Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            className="px-3 py-1.5 rounded-full bg-stone-900/85 backdrop-blur-xl border border-white/20 text-white/90 hover:text-white text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {currentProvider === MAP_PROVIDERS.GOOGLE
                ? 'Google Ultra-HD'
                : currentProvider === MAP_PROVIDERS.ESRI
                ? 'Esri 30cm HD'
                : 'MapTiler'}
            </span>
            <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProviderMenu && (
            <div className="absolute top-full right-0 mt-2 bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 w-52 z-30">
              <div className="px-2.5 py-1 text-[9px] font-mono text-white/40 uppercase tracking-wider">
                Satellite HD Provider
              </div>
              <button
                type="button"
                onClick={() => handleSwitchProvider(MAP_PROVIDERS.GOOGLE)}
                className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  currentProvider === MAP_PROVIDERS.GOOGLE
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-semibold">Google Ultra-HD</div>
                  <div className="text-[10px] opacity-70">Razor-sharp sub-meter (Clean)</div>
                </div>
                {currentProvider === MAP_PROVIDERS.GOOGLE && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchProvider(MAP_PROVIDERS.ESRI)}
                className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  currentProvider === MAP_PROVIDERS.ESRI
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-semibold">Esri World Imagery</div>
                  <div className="text-[10px] opacity-70">30cm Maxar aerial (Clean)</div>
                </div>
                {currentProvider === MAP_PROVIDERS.ESRI && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchProvider(MAP_PROVIDERS.MAPTILER)}
                className={`text-left p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  currentProvider === MAP_PROVIDERS.MAPTILER
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-semibold">MapTiler Satellite</div>
                  <div className="text-[10px] opacity-70">Clean satellite imagery</div>
                </div>
                {currentProvider === MAP_PROVIDERS.MAPTILER && <span>✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Geolocation Denied Notice (Restrained) */}
      {geoDenied && (
        <div className="absolute top-20 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-black/60 text-white/80 backdrop-blur-md border border-white/15 text-xs font-medium">
          GPS Location Unavailable (Manual exploration active)
        </div>
      )}

      {/* Nearest Location Pill */}
      {!geoDenied && nearestInfo && (
        <div className="absolute top-20 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-black/60 text-white/90 backdrop-blur-md border border-white/15 text-xs font-medium flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${nearestInfo.confidence === 'inside' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <span>
            {nearestInfo.confidence === 'inside' ? 'Inside' : 'Near'} <strong className="font-semibold text-white">{nearestInfo.building_name}</strong>
          </span>
        </div>
      )}

      {/* Minimal Map Attribution & Coordinates */}
      <div className="absolute bottom-2 left-4 z-10 text-[9px] font-mono text-white/40 tracking-wider pointer-events-none">
        {currentProvider === MAP_PROVIDERS.GOOGLE
          ? 'GOOGLE ULTRA-HD SATELLITE'
          : currentProvider === MAP_PROVIDERS.ESRI
          ? 'ESRI WORLD IMAGERY HD'
          : 'MAPTILER SATELLITE'}{' '}
        • 12.9015° N, 77.5057° E • JSSATE BENGALURU
      </div>
    </div>
  );
}
