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
  currentProvider: providerProp,
  isTopView = false,
  gpsLocation = null,
  isGpsActive = false,
  onToggleGps,
  onSimulateCampusWalk,
  isSimulating = false,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const gpsMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [userLocation, setUserLocation] = useState(gpsLocation || null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const hasAutoCentered = useRef(false);

  // Sync external gpsLocation prop
  useEffect(() => {
    if (gpsLocation) {
      setUserLocation(gpsLocation);
      setGeoDenied(false);
    }
  }, [gpsLocation]);

  const onSelectBuildingRef = useRef(onSelectBuilding);
  onSelectBuildingRef.current = onSelectBuilding;

  const onBearingChangeRef = useRef(onBearingChange);
  onBearingChangeRef.current = onBearingChange;

  const onUpdateLocationRef = useRef(onUpdateLocation);
  onUpdateLocationRef.current = onUpdateLocation;

  const prevBuildingRef = useRef(selectedBuilding);
  const isFirstRender = useRef(true);

  const mapConfig = getMapConfig();
  const [currentProvider, setCurrentProvider] = useState(
    providerProp || mapConfig.imageryProvider || MAP_PROVIDERS.GOOGLE
  );

  // Distance calculation helper (Haversine formula in km)
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceToCampus = userLocation
    ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, CAMPUS_CENTER[1], CAMPUS_CENTER[0])
    : 0;

  const handleCenterOnUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 18.2,
      pitch: isTopView ? 0 : 45,
      bearing: mapRef.current.getBearing() || 0,
      duration: 1200,
    });
  };

  const handleFlyToCampus = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: CAMPUS_CENTER,
      zoom: 16.8,
      pitch: isTopView ? 0 : 45,
      bearing: isTopView ? 0 : -17.6,
      duration: 1200,
    });
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
      onBearingChangeRef.current?.(map.getBearing());
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

        onSelectBuildingRef.current?.(buildingObj);
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (gpsMarkerRef.current) {
        gpsMarkerRef.current.remove();
        gpsMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Initialize map once on mount

  // React to Top View / 3D Cross View toggle with smooth camera transition
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    if (isTopView) {
      if (map.easeTo) map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      else if (map.flyTo) map.flyTo({ pitch: 0, bearing: 0 });
    } else {
      if (map.easeTo) {
        map.easeTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
          duration: 600,
        });
      } else if (map.flyTo) {
        map.flyTo({
          pitch: mapConfig.initialPitch || 45,
          bearing: mapConfig.initialBearing || -17.6,
        });
      }
    }
  }, [isTopView, mapConfig.initialPitch, mapConfig.initialBearing]);

  // Synchronize imagery provider changes from top bar
  useEffect(() => {
    if (!providerProp || !mapRef.current) return;
    if (providerProp !== currentProvider) {
      setCurrentProvider(providerProp);
      const newStyle = getSatelliteStyle(providerProp, mapConfig.apiKey);
      mapRef.current.setStyle(newStyle);
      mapRef.current.once('styledata', () => {
        addCampusLayers(mapRef.current);
      });
    }
  }, [providerProp, currentProvider, addCampusLayers, mapConfig.apiKey]);

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
    } else if (currentState === NAV_STATES.OVERVIEW && prevBuildingRef.current) {
      map.flyTo({
        center: CAMPUS_CENTER,
        zoom: 16.8,
        pitch: isTopView ? 0 : 45,
        bearing: isTopView ? 0 : -17.6,
        speed: 1.2,
      });

      if (map.getLayer && map.getLayer('selected-building-highlight')) {
        map.setFilter('selected-building-highlight', ['==', ['get', 'id'], '']);
      }
    }
    prevBuildingRef.current = selectedBuilding;
  }, [currentState, selectedBuilding, isTopView]);

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
        onUpdateLocationRef.current?.(loc);
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

  // Auto-center camera on user location when GPS is activated or updated
  useEffect(() => {
    if (userLocation && mapRef.current && isGpsActive && !hasAutoCentered.current) {
      hasAutoCentered.current = true;
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 18.2,
        pitch: isTopView ? 0 : 45,
        bearing: mapRef.current.getBearing() || 0,
        duration: 1200,
      });
    }
  }, [userLocation, isGpsActive, isTopView]);

  // 4. Update GPS Blue Dot Marker (HTML DOM Marker + GeoJSON accuracy circle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const { latitude, longitude, accuracy } = userLocation;

    // Create or update HTML DOM GPS Blue Dot Marker (Guaranteed always visible on top of all 3D layers)
    if (!gpsMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'mapwave-gps-blue-dot';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.pointerEvents = 'none';
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background: rgba(96, 165, 250, 0.5);"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 0 14px rgba(37,99,235,1), 0 2px 6px rgba(0,0,0,0.6);"></div>
        </div>
      `;
      gpsMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([longitude, latitude])
        .addTo(map);
    } else {
      gpsMarkerRef.current.setLngLat([longitude, latitude]);
    }

    // Also update GeoJSON accuracy circle layer if style is loaded
    if (map.isStyleLoaded && map.isStyleLoaded()) {
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
            'circle-opacity': 0.15,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#3b82f6',
            'circle-stroke-opacity': 0.5,
          },
        });
      }
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
  }, [userLocation]);

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


      {/* Geolocation Denied Notice (Restrained) */}
      {geoDenied && (
        <div className="absolute top-20 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-black/60 text-white/80 backdrop-blur-md border border-white/15 text-xs font-medium">
          GPS Location Unavailable (Manual exploration active)
        </div>
      )}

      {/* GPS Off-Campus Locator HUD (if user is outside campus boundary) */}
      {!geoDenied && userLocation && distanceToCampus > 0.6 && (
        <div className="absolute top-20 left-4 z-10 max-w-sm px-4 py-2.5 rounded-2xl bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-white">
                Live GPS Located
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/60">
              ±{Math.round(userLocation.accuracy || 10)}m accuracy
            </span>
          </div>
          <div className="text-[11px] text-white/80">
            You are currently <strong className="text-amber-300 font-semibold">{distanceToCampus.toFixed(1)} km</strong> from JSSATE Campus.
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={handleCenterOnUser}
              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
              </svg>
              <span>My Location</span>
            </button>
            <button
              type="button"
              onClick={handleFlyToCampus}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🏫 Campus</span>
            </button>
            {onSimulateCampusWalk && (
              <button
                type="button"
                onClick={onSimulateCampusWalk}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isSimulating
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                <span>{isSimulating ? '⏹ Stop Demo' : '🚶 Campus Demo Walk'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* GPS On-Campus Locator HUD (if user is physically inside/near campus boundary) */}
      {!geoDenied && userLocation && distanceToCampus <= 0.6 && (
        <div className="absolute top-20 left-4 z-10 px-3.5 py-2 rounded-2xl bg-black/80 text-white backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Live Campus GPS</span>
              <span className="text-[10px] font-mono text-emerald-400">±{Math.round(userLocation.accuracy || 5)}m</span>
            </div>
            {nearestInfo ? (
              <div className="text-[11px] text-white/80">
                {nearestInfo.confidence === 'inside' ? 'Inside' : 'Near'} <strong className="font-semibold text-white">{nearestInfo.building_name}</strong>
              </div>
            ) : (
              <div className="text-[10px] text-white/50">Tracking campus movement...</div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCenterOnUser}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer ml-1"
            title="Recenter camera on my position"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </button>
        </div>
      )}

      {/* Legacy Fallback Nearest Location Pill (for unit tests / mock positions) */}
      {!geoDenied && !userLocation && nearestInfo && (
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
