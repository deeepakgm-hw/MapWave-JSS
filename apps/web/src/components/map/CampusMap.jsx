import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  getMapConfig,
  getMapConfigStatus,
  getFallbackRasterStyle,
  buildMapStyleUrl,
  MAP_VIEWS,
} from '../../config/mapConfig';
import { MapSetupScreen } from './MapSetupScreen';
import {
  campusBoundary as staticBoundary,
  campusBuildings as staticBuildings,
  campusPaths as staticPaths,
  campusFacilities as staticFacilities,
  buildingMetadata,
  CAMPUS_CENTER as DEFAULT_CAMPUS_CENTER,
} from '../../data';

/**
 * CampusMap — Core 3D Satellite Campus Map Component for MapWave
 *
 * Implements MapLibre GL JS map rendering, MapTiler satellite imagery,
 * 3D fill-extrusions, GeoJSON layers, compact search, scale indicator,
 * and responsive controls.
 */
export function CampusMap({
  configOverrides,
  selectedBuilding: propSelectedBuilding,
  onSelectBuilding,
  onUpdateLocation,
  onBearingChange,
  mapRefOut,
  className = '',
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const watchIdRef = useRef(null);

  // Runtime config and override state
  const [sessionOverrides, setSessionOverrides] = useState(configOverrides || null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [currentStyleMode, setCurrentStyleMode] = useState(MAP_VIEWS.HYBRID);

  // Map state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [imageryError, setImageryError] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(propSelectedBuilding || null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [show3dExtrusions, setShow3dExtrusions] = useState(true);

  // Active configuration calculation
  const effectiveOverrides = {
    ...sessionOverrides,
    ...(useFallbackMode ? {
      lat: sessionOverrides?.lat || DEFAULT_CAMPUS_CENTER[1],
      lng: sessionOverrides?.lng || DEFAULT_CAMPUS_CENTER[0],
      apiKey: sessionOverrides?.apiKey || 'dev-fallback',
    } : {}),
  };

  const mapConfig = getMapConfig(effectiveOverrides);
  const configStatus = getMapConfigStatus(mapConfig);

  // Synchronize external selected building prop
  useEffect(() => {
    if (propSelectedBuilding !== undefined) {
      setSelectedBuilding(propSelectedBuilding);
    }
  }, [propSelectedBuilding]);

  // Load GeoJSON data helper (attempts public /data/ first, falls back to bundled static data)
  const loadGeoJsonDataset = async (publicPath, fallbackData) => {
    try {
      const res = await fetch(publicPath);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to static bundled GeoJSON
    }
    return fallbackData;
  };

  // Add all campus data sources and visualization layers to map
  const addCampusLayers = useCallback(async (map) => {
    try {
      const [boundaryData, buildingsData, pathsData, facilitiesData] = await Promise.all([
        loadGeoJsonDataset('/data/campus-boundary.geojson', staticBoundary),
        loadGeoJsonDataset('/data/buildings.geojson', staticBuildings),
        loadGeoJsonDataset('/data/walkable-paths.geojson', staticPaths),
        loadGeoJsonDataset('/data/facilities.geojson', staticFacilities),
      ]);

      // 1. Campus Boundary
      if (!map.getSource('campus-boundary') && boundaryData) {
        map.addSource('campus-boundary', {
          type: 'geojson',
          data: boundaryData,
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

      // 2. Facilities & Grounds
      if (!map.getSource('campus-facilities') && facilitiesData) {
        map.addSource('campus-facilities', {
          type: 'geojson',
          data: facilitiesData,
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

      // 3. Walkable Paths & Roadways
      if (!map.getSource('campus-paths') && pathsData) {
        map.addSource('campus-paths', {
          type: 'geojson',
          data: pathsData,
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

      // 4. 3D Building Extrusions
      if (!map.getSource('campus-buildings') && buildingsData) {
        map.addSource('campus-buildings', {
          type: 'geojson',
          data: buildingsData,
        });

        // 3D Extruded Building Volumes
        map.addLayer({
          id: 'campus-buildings-extrusion',
          type: 'fill-extrusion',
          source: 'campus-buildings',
          paint: {
            'fill-extrusion-color': [
              'match',
              ['get', 'verified'],
              true, '#2563eb',
              '#0284c7'
            ],
            'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
            'fill-extrusion-base': ['coalesce', ['get', 'base_height_m'], 0],
            'fill-extrusion-opacity': 0.82,
          },
        });

        // Hover Brightening Layer
        map.addLayer({
          id: 'campus-buildings-hover',
          type: 'fill-extrusion',
          source: 'campus-buildings',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'fill-extrusion-color': '#60a5fa',
            'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
            'fill-extrusion-base': ['coalesce', ['get', 'base_height_m'], 0],
            'fill-extrusion-opacity': 0.98,
          },
        });

        // Selection Highlight Layer (Golden Amber)
        map.addLayer({
          id: 'campus-buildings-selected',
          type: 'fill-extrusion',
          source: 'campus-buildings',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'fill-extrusion-color': '#f59e0b',
            'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 15.0],
            'fill-extrusion-base': ['coalesce', ['get', 'base_height_m'], 0],
            'fill-extrusion-opacity': 1.0,
          },
        });
      }

      // 5. Interactive HTML Markers for Campus Landmarks
      if (maplibregl.Marker && buildingsData?.features) {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        buildingsData.features.forEach((feat) => {
          const props = feat.properties || {};
          const meta = buildingMetadata[props.building_id || props.id] || buildingMetadata[props.code] || {};
          let center = meta.center;

          if (!center && feat.geometry?.coordinates?.[0]) {
            const coords = feat.geometry.coordinates[0];
            let sumLng = 0;
            let sumLat = 0;
            const len = coords.length - 1;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                sumLng += coords[i][0];
                sumLat += coords[i][1];
              }
              center = [sumLng / len, sumLat / len];
            }
          }

          if (center) {
            const el = document.createElement('div');
            el.className = 'campus-marker-pill pointer-events-auto cursor-pointer select-none';
            el.innerHTML = `
              <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 9999px; padding: 2px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px;">
                <span style="width: 5px; height: 5px; border-radius: 9999px; background: ${props.verified ? '#38bdf8' : '#a855f7'};"></span>
                <span style="color: #f8fafc; font-size: 10px; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap;">${props.name || 'Building'}</span>
              </div>
            `;

            const buildingObj = {
              id: props.building_id || props.id,
              building_id: props.building_id || props.id,
              name: props.name || meta.name || 'Building',
              code: props.code || meta.code || 'BLDG',
              category: props.category || meta.category || 'Academic',
              status: props.status || 'existing',
              verified: Boolean(props.verified),
              verification: props.verification || (props.verified ? 'verified' : 'estimated'),
              height_m: props.height_m || meta.height_m || 15.0,
              base_height_m: props.base_height_m || 0,
              floor_count: props.floor_count || meta.floor_count || 3,
              indoor_mapping_status: props.indoor_mapping_status || meta.indoor_mapping_status || 'not_started',
              description: props.description || meta.description || '',
              departments: meta.departments || [],
              facilities: meta.facilities || [],
              operating_hours: meta.operating_hours || '',
              accessibility: meta.accessibility || '',
              center,
            };

            el.addEventListener('click', (ev) => {
              ev.stopPropagation();
              handleSelectBuildingInternal(buildingObj);
            });

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat(center)
              .addTo(map);

            markersRef.current.push(marker);
          }
        });
      }
    } catch (err) {
      console.error('Error adding campus map layers:', err);
    }
  }, []);

  // Internal building selection handler
  const handleSelectBuildingInternal = useCallback((building) => {
    setSelectedBuilding(building);
    if (onSelectBuilding) {
      onSelectBuilding(building);
    }

    if (mapRef.current && building.center) {
      mapRef.current.flyTo({
        center: building.center,
        zoom: Math.max(mapRef.current.getZoom(), 18.0),
        pitch: 60,
        bearing: -20,
        speed: 1.2,
      });

      if (mapRef.current.getLayer && mapRef.current.getLayer('campus-buildings-selected')) {
        mapRef.current.setFilter('campus-buildings-selected', ['==', ['get', 'id'], building.id]);
      }
    }
  }, [onSelectBuilding]);

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!configStatus.isReady) {
      return;
    }

    if (mapRef.current || !mapContainer.current) {
      return;
    }

    setImageryError(null);

    const initialCenter = mapConfig.campusCoordinates || DEFAULT_CAMPUS_CENTER;

    const mapStyle = useFallbackMode
      ? getFallbackRasterStyle()
      : mapConfig.styleUrl || buildMapStyleUrl(mapConfig.apiKey, currentStyleMode);

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: initialCenter,
      zoom: mapConfig.initialZoom,
      pitch: mapConfig.initialPitch,
      bearing: mapConfig.initialBearing,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
    });

    mapRef.current = map;
    if (mapRefOut) {
      mapRefOut.current = map;
    }

    // Add metric scale indicator
    if (maplibregl.ScaleControl) {
      const scale = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      });
      map.addControl(scale, 'bottom-left');
    }

    // Camera rotation & bearing tracker
    map.on('rotate', () => {
      const curBearing = map.getBearing();
      setBearing(curBearing);
      if (onBearingChange) {
        onBearingChange(curBearing);
      }
    });

    // Handle map style error / 401 unauthenticated MapTiler key
    map.on('error', (e) => {
      if (e?.error?.status === 401 || e?.error?.status === 403 || e?.sourceId === 'maptiler') {
        console.warn('Map imagery authentication error:', e.error);
        setImageryError('Invalid MapTiler API key or unauthorized request. Please check your credentials.');
      }
    });

    // Map loaded handler
    map.on('load', async () => {
      setMapLoaded(true);
      await addCampusLayers(map);

      // Wire interactive extrusion hover & click events
      let hoveredId = null;

      map.on('mousemove', 'campus-buildings-extrusion', (e) => {
        if (!e.features?.length) return;
        const bId = e.features[0].properties.id;
        map.getCanvas().style.cursor = 'pointer';
        if (bId !== hoveredId) {
          hoveredId = bId;
          if (map.getLayer && map.getLayer('campus-buildings-hover')) {
            map.setFilter('campus-buildings-hover', ['==', ['get', 'id'], bId]);
          }
        }
      });

      map.on('mouseleave', 'campus-buildings-extrusion', () => {
        hoveredId = null;
        map.getCanvas().style.cursor = '';
        if (map.getLayer && map.getLayer('campus-buildings-hover')) {
          map.setFilter('campus-buildings-hover', ['==', ['get', 'id'], '']);
        }
      });

      map.on('click', 'campus-buildings-extrusion', (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const bProps = feature.properties;
        const meta = buildingMetadata[bProps.building_id || bProps.id] || buildingMetadata[bProps.code] || {};

        let centerCoord = meta.center || [e.lngLat.lng, e.lngLat.lat];
        if (!meta.center && feature.geometry?.coordinates?.[0]) {
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
          id: bProps.building_id || bProps.id,
          building_id: bProps.building_id || bProps.id,
          name: bProps.name || meta.name || 'Building',
          code: bProps.code || meta.code || 'BLDG',
          category: bProps.category || meta.category || 'Academic',
          status: bProps.status || 'existing',
          verified: Boolean(bProps.verified),
          verification: bProps.verification || (bProps.verified ? 'verified' : 'estimated'),
          height_m: bProps.height_m || meta.height_m || 15.0,
          base_height_m: bProps.base_height_m || 0,
          floor_count: bProps.floor_count || meta.floor_count || 3,
          indoor_mapping_status: bProps.indoor_mapping_status || meta.indoor_mapping_status || 'not_started',
          description: bProps.description || meta.description || '',
          departments: meta.departments || [],
          facilities: meta.facilities || [],
          operating_hours: meta.operating_hours || '',
          accessibility: meta.accessibility || '',
          center: centerCoord,
        };

        handleSelectBuildingInternal(buildingObj);
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [configStatus.isReady, useFallbackMode, currentStyleMode, addCampusLayers, handleSelectBuildingInternal]);

  // Toggle 3D extrusion layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const visibility = show3dExtrusions ? 'visible' : 'none';
    if (map.getLayer && map.getLayer('campus-buildings-extrusion')) {
      map.setLayoutProperty('campus-buildings-extrusion', 'visibility', visibility);
    }
    if (map.getLayer && map.getLayer('campus-buildings-hover')) {
      map.setLayoutProperty('campus-buildings-hover', 'visibility', visibility);
    }
    if (map.getLayer && map.getLayer('campus-buildings-selected')) {
      map.setLayoutProperty('campus-buildings-selected', 'visibility', visibility);
    }
  }, [show3dExtrusions, mapLoaded]);

  // Camera reset to north
  const handleResetNorth = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({ bearing: 0, pitch: 45 });
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  // Locate me with permission handling
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const loc = { latitude, longitude, accuracy };
        setUserLocation(loc);
        setGeoDenied(false);

        if (onUpdateLocation) {
          onUpdateLocation(loc);
        }

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 18,
            speed: 1.2,
          });
        }
      },
      (error) => {
        console.warn('Geolocation denied or timed out:', error.message);
        setGeoDenied(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  };

  // Search filter over static and loaded features
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = query.toLowerCase();
    const allBuildings = staticBuildings?.features || [];
    const allFacilities = staticFacilities?.features || [];

    const matchedBuildings = allBuildings.filter((f) => {
      const p = f.properties || {};
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    }).map((f) => ({
      type: 'building',
      id: f.properties.building_id || f.properties.id,
      name: f.properties.name,
      code: f.properties.code,
      category: f.properties.category,
      feature: f,
    }));

    const matchedFacilities = allFacilities.filter((f) => {
      const p = f.properties || {};
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }).map((f) => ({
      type: 'facility',
      id: f.properties.id,
      name: f.properties.name,
      category: f.properties.category,
      feature: f,
    }));

    const results = [...matchedBuildings, ...matchedFacilities].slice(0, 8);
    setSearchResults(results);
    setIsSearchOpen(results.length > 0);
  };

  const handleSelectSearchResult = (result) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (result.type === 'building') {
      const p = result.feature.properties || {};
      const meta = buildingMetadata[p.building_id || p.id] || {};
      let center = meta.center;
      if (!center && result.feature.geometry?.coordinates?.[0]) {
        const coords = result.feature.geometry.coordinates[0];
        center = [coords[0][0], coords[0][1]];
      }

      handleSelectBuildingInternal({
        id: p.building_id || p.id,
        name: p.name,
        code: p.code,
        category: p.category,
        verified: p.verified,
        height_m: p.height_m,
        floor_count: p.floor_count,
        indoor_mapping_status: p.indoor_mapping_status,
        description: p.description,
        departments: meta.departments || [],
        facilities: meta.facilities || [],
        center,
      });
    } else if (result.type === 'facility') {
      const coords = result.feature.geometry?.coordinates;
      let center = null;
      if (Array.isArray(coords)) {
        center = Array.isArray(coords[0]) ? coords[0][0] : coords;
      }
      if (center && mapRef.current) {
        mapRef.current.flyTo({
          center,
          zoom: 18,
          speed: 1.2,
        });
      }
    }
  };

  // If configuration is missing and no fallback mode active: render polished setup screen
  if (!configStatus.isReady && !useFallbackMode) {
    return (
      <div className={`relative w-full h-full min-h-[500px] ${className}`}>
        <MapSetupScreen
          configStatus={configStatus}
          onApplyOverrides={(newOverrides) => {
            setSessionOverrides(newOverrides);
          }}
          onActivateFallback={() => {
            setUseFallbackMode(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden bg-stone-950 select-none ${className}`}>
      {/* 1. MapLibre Canvas Viewport */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* 2. Floating Search Bar (thekenyamap.com Style) */}
      <div className="absolute top-4 left-4 z-20 max-w-sm w-[calc(100%-110px)] sm:w-80">
        <div className="relative">
          <div className="flex items-center bg-stone-900/85 backdrop-blur-xl border border-white/15 rounded-full px-3.5 py-2 shadow-xl focus-within:border-blue-500/80 transition-all">
            <svg className="w-4 h-4 text-white/50 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search buildings & campus..."
              className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="text-white/40 hover:text-white p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete Results Drawer */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 max-h-64 overflow-y-auto z-30">
              {searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-white/50">
                        {item.category} {item.code && `• ${item.code}`}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Right Control Cluster */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
        {/* Style & Layer Switcher Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            title="Layer Settings"
            className="w-10 h-10 rounded-full bg-stone-900/85 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>

          {showStyleMenu && (
            <div className="absolute top-0 right-12 bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 w-48 z-30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 px-1">
                Map View Style
              </span>

              <div className="flex flex-col gap-1">
                {[
                  { id: MAP_VIEWS.HYBRID, label: 'Hybrid Satellite' },
                  { id: MAP_VIEWS.SATELLITE, label: 'Pure Satellite' },
                  { id: MAP_VIEWS.STREETS, label: 'Outdoor Topo' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setCurrentStyleMode(mode.id);
                      setShowStyleMenu(false);
                      if (mapRef.current && !useFallbackMode && mapConfig.apiKey) {
                        mapRef.current.setStyle(buildMapStyleUrl(mapConfig.apiKey, mode.id));
                      }
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentStyleMode === mode.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between px-1">
                <span className="text-[11px] text-white/70">3D Buildings</span>
                <button
                  type="button"
                  onClick={() => setShow3dExtrusions(!show3dExtrusions)}
                  className={`w-8 h-4 rounded-full transition-colors p-0.5 ${
                    show3dExtrusions ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    show3dExtrusions ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset North Compass */}
        <button
          type="button"
          onClick={handleResetNorth}
          title="Reset Bearing (North)"
          className="w-10 h-10 rounded-full bg-stone-900/85 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <div
            style={{ transform: `rotate(${-bearing}deg)` }}
            className="transition-transform duration-150"
          >
            <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
        </button>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          title="Locate My Position"
          className="w-10 h-10 rounded-full bg-stone-900/85 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Zoom In & Out Cluster */}
        <div className="flex flex-col rounded-full bg-stone-900/85 backdrop-blur-xl border border-white/15 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Selected Building Contextual Information Panel (Unobtrusive) */}
      {selectedBuilding && (
        <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:w-96 z-20 bg-stone-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedBuilding.verified ? 'bg-sky-400' : 'bg-purple-400'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                  {selectedBuilding.category || 'Academic'} • {selectedBuilding.verified ? 'Verified Footprint' : 'Estimated Footprint'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {selectedBuilding.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBuilding(null)}
              className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {selectedBuilding.description || 'Campus academic and research block at JSSATE Bangalore.'}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[9px] text-white/40 uppercase">Height</div>
              <div className="text-xs font-semibold text-white">{selectedBuilding.height_m}m</div>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[9px] text-white/40 uppercase">Floors</div>
              <div className="text-xs font-semibold text-white">{selectedBuilding.floor_count || 3}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[9px] text-white/40 uppercase">Indoor CAD</div>
              <div className="text-xs font-semibold text-blue-400 capitalize">
                {selectedBuilding.indoor_mapping_status === 'verified' || selectedBuilding.indoor_mapping_status === 'available'
                  ? 'Ready'
                  : 'In Queue'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Recoverable Imagery Error Banner */}
      {imageryError && (
        <div className="absolute top-16 left-4 right-4 sm:right-auto sm:max-w-md z-30 p-3.5 bg-rose-950/90 backdrop-blur-xl border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start justify-between shadow-2xl">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong className="font-semibold block text-white">Satellite Imagery Error</strong>
              <span className="text-[11px] text-rose-200/90">{imageryError}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setImageryError(null);
              setUseFallbackMode(true);
            }}
            className="ml-3 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-mono uppercase whitespace-nowrap cursor-pointer"
          >
            Use Fallback
          </button>
        </div>
      )}

      {/* 6. Geolocation Denied Notice */}
      {geoDenied && (
        <div className="absolute bottom-16 left-4 z-10 px-3 py-1.5 rounded-xl bg-black/70 text-white/80 backdrop-blur-md border border-white/15 text-xs font-medium">
          GPS Unavailable (Manual navigation mode active)
        </div>
      )}

      {/* 7. Minimal Map Attribution & Coordinates */}
      <div className="absolute bottom-2 right-4 z-10 text-[9px] font-mono text-white/40 tracking-wider pointer-events-none">
        {useFallbackMode ? 'ESRI WORLD IMAGERY' : 'MAPTILER SATELLITE'} • 12.9015° N, 77.5057° E
      </div>
    </div>
  );
}
