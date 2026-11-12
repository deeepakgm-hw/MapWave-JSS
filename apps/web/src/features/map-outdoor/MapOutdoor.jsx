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
import {
  getFloorData,
  isFloorMapped,
  calculatePolygonCentroid,
} from '../../data/campus-map/floorRegistry';
import { LabelLayer } from '../../components/map/LabelLayer';

export default function MapOutdoor({
  currentState,
  selectedBuilding,
  selectedFloor,
  selectedRoom,
  onSelectRoom,
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
  currentMode = 'CAMPUS_MODE',
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onSwitchMode,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const indoorMarkersRef = useRef([]);
  const labelLayerRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [userLocation, setUserLocation] = useState(gpsLocation || null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const hasAutoCentered = useRef(false);

  const onSelectRoomRef = useRef(onSelectRoom);
  onSelectRoomRef.current = onSelectRoom;

  const currentModeRef = useRef(currentMode);
  currentModeRef.current = currentMode;

  const onSwitchModeRef = useRef(onSwitchMode);
  onSwitchModeRef.current = onSwitchMode;

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
          'fill-color': '#06b6d4',
          'fill-opacity': 0.05,
        },
      });

      // Soft glow casing layer around authoritative boundary
      map.addLayer({
        id: 'campus-boundary-glow',
        type: 'line',
        source: 'campus-boundary',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 6,
          'line-opacity': 0.45,
          'line-blur': 2.5,
        },
      });

      // Crisp authoritative boundary perimeter line (Cyan, 2px)
      map.addLayer({
        id: 'campus-boundary-line',
        type: 'line',
        source: 'campus-boundary',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2.0,
          'line-opacity': 1.0,
        },
      });

      // Inner boundary highlight line
      map.addLayer({
        id: 'campus-boundary-inner',
        type: 'line',
        source: 'campus-boundary',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.2,
          'line-opacity': 0.85,
        },
      });
    } else {
      map.getSource('campus-boundary').setData(campusBoundary);
    }

    // 2. Campus Buildings (Invisible hit area for interactions, clean outline on selection)
    const buildingsData = buildingsOverride || campusBuildings;

    if (!map.getSource('campus-buildings')) {
      map.addSource('campus-buildings', {
        type: 'geojson',
        data: buildingsData,
      });

      // Layer 1: Invisible Interactive Footprint Layer (captures hover/click without blue 3D boxes)
      map.addLayer({
        id: 'existing-buildings-extrusion',
        type: 'fill',
        source: 'campus-buildings',
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.001,
        },
      });

      // Layer 1c: Animated Hover Glowing Perimeter Ring
      map.addLayer({
        id: 'hovered-building-glow',
        type: 'line',
        source: 'campus-buildings',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'line-color': '#38bdf8',
          'line-width': 3.5,
          'line-opacity': 0.95,
        },
      });

      // Layer 2: Highlighted Selected Building (Amber Perimeter Outline)
      map.addLayer({
        id: 'selected-building-highlight',
        type: 'line',
        source: 'campus-buildings',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'line-color': '#f59e0b',
          'line-width': 4.0,
          'line-opacity': 1.0,
        },
      });
    }

    // Clear any markers so map labels are disabled
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Synchronizes QGIS-generated indoor floor mapping layers (rooms, doors, paths, selected room, route)
  const syncIndoorLayers = useCallback((map) => {
    if (!map || !map.isStyleLoaded()) return;

    const buildingCode = selectedBuilding?.code || '';
    const isBlockA = buildingCode === 'BLOCK_A' || selectedBuilding?.name?.includes('Block A');
    const floorLevel = selectedFloor?.level_number || 2;
    const isMapped = isBlockA && isFloorMapped(buildingCode, floorLevel);

    // 1. Ensure all indoor sources exist
    if (!map.getSource('indoor-rooms')) {
      map.addSource('indoor-rooms', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('indoor-paths', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('indoor-doors', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('indoor-selected-room', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('indoor-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Layer 1: Rooms fill styled by room type
      map.addLayer({
        id: 'indoor-rooms-fill',
        type: 'fill',
        source: 'indoor-rooms',
        paint: {
          'fill-opacity': 0.88,
          'fill-color': [
            'match',
            ['downcase', ['to-string', ['coalesce', ['get', 'type'], '']]],
            'lab', '#9bd8b8',
            'classroom', '#a3bfff',
            'toilet', '#d4d4d4',
            'ladies toilet', '#d4d4d4',
            'gents toilet', '#d4d4d4',
            'corridor', '#eef1f6',
            'staircase', '#f6c98a',
            'stairs', '#f6c98a',
            'lift', '#f6c98a',
            'library', '#c4b5fd',
            'office', '#fed7aa',
            'faculty room', '#fed7aa',
            'sem hall', '#fed7aa',
            'server room', '#cbd5e1',
            '#bccaf2',
          ],
        },
      });

      // Layer 2: Rooms architectural outline
      map.addLayer({
        id: 'indoor-rooms-line',
        type: 'line',
        source: 'indoor-rooms',
        paint: {
          'line-color': '#14213d',
          'line-width': 1.2,
        },
      });

      // Layer 3: Selected room amber glow fill
      map.addLayer({
        id: 'indoor-rooms-selected-fill',
        type: 'fill',
        source: 'indoor-selected-room',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.45,
        },
      });

      // Layer 4: Selected room glow border
      map.addLayer({
        id: 'indoor-rooms-selected',
        type: 'line',
        source: 'indoor-selected-room',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 3.5,
        },
      });

      // Layer 5: Walkable corridors
      map.addLayer({
        id: 'indoor-paths-line',
        type: 'line',
        source: 'indoor-paths',
        paint: {
          'line-color': '#475569',
          'line-width': 2.0,
          'line-dasharray': [2, 2],
          'line-opacity': 0.75,
        },
      });

      // Layer 6: Route Casing / Drop Shadow
      map.addLayer({
        id: 'indoor-route-casing',
        type: 'line',
        source: 'indoor-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': 'rgba(0, 0, 0, 0.45)',
          'line-width': 9,
          'line-blur': 3,
        },
      });

      // Layer 7: Route Core Line (Amber dashed line)
      map.addLayer({
        id: 'indoor-route-line',
        type: 'line',
        source: 'indoor-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#f59e0b',
          'line-width': 5.0,
          'line-dasharray': [2, 1],
        },
      });

      // Layer 8: Door checkpoint markers
      map.addLayer({
        id: 'indoor-doors-circle',
        type: 'circle',
        source: 'indoor-doors',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-color': '#14213d',
          'circle-stroke-width': 2,
        },
      });

      // Click on room polygon
      map.on('click', 'indoor-rooms-fill', (e) => {
        if (!e.features || !e.features.length) return;
        const feat = e.features[0];
        const props = feat.properties || {};
        const ring = feat.geometry?.coordinates?.[0] || [];
        const center = calculatePolygonCentroid(ring);
        const roomCodeMatch = (props.name || '').match(/A\s*[-]?\s*(\d{3})/i);
        const roomCode = roomCodeMatch ? `A-${roomCodeMatch[1]}` : 'ROOM';

        const roomObj = {
          id: `room-${props.name}`,
          room_code: roomCode,
          name: props.name,
          floor: props.floor || 2,
          room_type: props.type || 'room',
          category: props.type || 'General',
          coordinates: center,
          geometry: feat.geometry,
          properties: props,
        };

        onSelectRoomRef.current?.(roomObj);
      });

      map.on('mouseenter', 'indoor-rooms-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'indoor-rooms-fill', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'indoor-doors-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'indoor-doors-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // Clear previous room label markers
    indoorMarkersRef.current.forEach((m) => m.remove());
    indoorMarkersRef.current = [];

    // 2. Synchronize datasets or clear when outside mapped floor
    if (isMapped) {
      const floorData = getFloorData(buildingCode, floorLevel);
      if (floorData?.datasets) {
        map.getSource('indoor-rooms')?.setData?.(floorData.datasets.rooms);
        map.getSource('indoor-paths')?.setData?.(floorData.datasets.paths);
        map.getSource('indoor-doors')?.setData?.(floorData.datasets.doors);

        // Prepare declutter-managed room labels with priority tiers
        const labelItems = [];
        floorData.datasets.rooms.features.forEach((feat) => {
          if (!feat.properties?.name) return;
          const coords = feat.geometry?.coordinates?.[0];
          if (!coords) return;
          const center = calculatePolygonCentroid(coords);
          const type = (feat.properties.type || '').toLowerCase();
          const priority = type.includes('lab') ? 2 : type.includes('corridor') ? 0 : 1;

          labelItems.push({
            text: feat.properties.name,
            coordinates: center,
            priority,
          });
        });

        if (labelLayerRef.current) {
          labelLayerRef.current.setLabels(labelItems);
        }

        // Set selected room highlight
        if (selectedRoom?.geometry) {
          map.getSource('indoor-selected-room')?.setData?.({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: selectedRoom.geometry, properties: selectedRoom.properties || {} }],
          });
        } else {
          map.getSource('indoor-selected-room')?.setData?.({ type: 'FeatureCollection', features: [] });
        }

        // Set active route
        if (activeRoute?.geojson) {
          map.getSource('indoor-route')?.setData?.(activeRoute.geojson);
        } else {
          map.getSource('indoor-route')?.setData?.({ type: 'FeatureCollection', features: [] });
        }
      }
    } else {
      labelLayerRef.current?.setLabels([]);
      map.getSource('indoor-rooms')?.setData?.({ type: 'FeatureCollection', features: [] });
      map.getSource('indoor-paths')?.setData?.({ type: 'FeatureCollection', features: [] });
      map.getSource('indoor-doors')?.setData?.({ type: 'FeatureCollection', features: [] });
      map.getSource('indoor-selected-room')?.setData?.({ type: 'FeatureCollection', features: [] });
      map.getSource('indoor-route')?.setData?.({ type: 'FeatureCollection', features: [] });
    }
  }, [selectedBuilding, selectedFloor, selectedRoom, activeRoute]);

  // Switch imagery provider at runtime
  const handleSwitchProvider = (newProvider) => {
    setCurrentProvider(newProvider);
    setShowProviderMenu(false);
    if (mapRef.current) {
      const newStyle = getSatelliteStyle(newProvider, mapConfig.apiKey);
      mapRef.current.setStyle(newStyle);
      mapRef.current.once('styledata', () => {
        addCampusLayers(mapRef.current);
        syncIndoorLayers(mapRef.current);
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
    labelLayerRef.current = new LabelLayer(map);

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

      // Building hover state tracking with real-time HUD details and area animation
      let hoveredBuildingId = null;

      const handleMapMouseMove = (e) => {
        const layers = ['existing-buildings-extrusion', 'hovered-building-extrusion', 'selected-building-highlight'];
        const existingLayers = layers.filter((l) => map.getLayer && map.getLayer(l));
        if (!existingLayers.length) return;

        const features = map.queryRenderedFeatures(e.point, { layers: existingLayers });

        if (features && features.length > 0) {
          const feature = features[0];
          const bProps = feature.properties || {};
          const bId = bProps.id || bProps.building_id;
          map.getCanvas().style.cursor = 'pointer';

          if (bId !== hoveredBuildingId) {
            hoveredBuildingId = bId;
            if (map.getLayer && map.getLayer('hovered-building-extrusion')) {
              map.setFilter('hovered-building-extrusion', ['==', ['get', 'id'], bId]);
            }
            if (map.getLayer && map.getLayer('hovered-building-glow')) {
              map.setFilter('hovered-building-glow', ['==', ['get', 'id'], bId]);
            }
          }

          const meta = buildingMetadata[bId] || buildingMetadata[bProps.code] || {};
          setHoveredBuilding({
            id: bId,
            name: bProps.name || meta.name || `Building ${bId}`,
            code: bProps.code || meta.code || 'ZONE',
            category: bProps.category || meta.category || 'Academic Complex',
            description: bProps.description || meta.description || '',
            departments: meta.departments || bProps.departments || [],
            facilities: meta.facilities || bProps.facilities || [],
            height_m: bProps.height_m || meta.height_m || 18.0,
            floor_count: bProps.floor_count || meta.floor_count || 3,
            verification: meta.verification || bProps.verification || 'verified',
            indoor_mapping_status: meta.indoor_mapping_status || bProps.indoor_mapping_status || 'available',
            cursorX: e.originalEvent.clientX,
            cursorY: e.originalEvent.clientY,
          });
        } else {
          if (hoveredBuildingId !== null) {
            hoveredBuildingId = null;
            map.getCanvas().style.cursor = '';
            if (map.getLayer && map.getLayer('hovered-building-extrusion')) {
              map.setFilter('hovered-building-extrusion', ['==', ['get', 'id'], '']);
            }
            if (map.getLayer && map.getLayer('hovered-building-glow')) {
              map.setFilter('hovered-building-glow', ['==', ['get', 'id'], '']);
            }
            setHoveredBuilding(null);
          }
        }
      };

      map.on('mousemove', handleMapMouseMove);

      map.on('mouseleave', () => {
        hoveredBuildingId = null;
        map.getCanvas().style.cursor = '';
        if (map.getLayer && map.getLayer('hovered-building-extrusion')) {
          map.setFilter('hovered-building-extrusion', ['==', ['get', 'id'], '']);
        }
        if (map.getLayer && map.getLayer('hovered-building-glow')) {
          map.setFilter('hovered-building-glow', ['==', ['get', 'id'], '']);
        }
        setHoveredBuilding(null);
      });

      // Building click interaction (Unified with bottom-sheet selection)
      map.on('click', (e) => {
        const layers = ['existing-buildings-extrusion', 'hovered-building-extrusion', 'selected-building-highlight'];
        const existingLayers = layers.filter((l) => map.getLayer && map.getLayer(l));
        if (!existingLayers.length) return;

        const features = map.queryRenderedFeatures(e.point, { layers: existingLayers });
        if (!features || features.length === 0) return;

        const feature = features[0];
        const bProps = feature.properties || {};
        const bId = bProps.id || bProps.building_id;
        const meta = buildingMetadata[bId] || buildingMetadata[bProps.code] || {};

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
          id: bId,
          name: bProps.name || meta.name || `Building ${bId}`,
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
      labelLayerRef.current?.destroy();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      indoorMarkersRef.current.forEach((m) => m.remove());
      indoorMarkersRef.current = [];
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
        syncIndoorLayers(mapRef.current);
      });
    }
  }, [providerProp, currentProvider, addCampusLayers, syncIndoorLayers, mapConfig.apiKey]);

  // Synchronize QGIS indoor layers whenever building, floor, room or route changes
  useEffect(() => {
    if (mapRef.current) {
      syncIndoorLayers(mapRef.current);
    }
  }, [syncIndoorLayers]);

  // 2. Camera Swoop & Highlight reacting to State Machine
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (
      (currentState === NAV_STATES.BUILDING_FLOORS || currentState === NAV_STATES.FLOOR_VIEW) &&
      selectedBuilding
    ) {
      const isBlockA = selectedBuilding.code === 'BLOCK_A' || selectedBuilding.name?.includes('Block A');
      const targetCenter = isBlockA ? [77.50456, 12.90282] : (selectedBuilding.center || CAMPUS_CENTER);

      map.flyTo({
        center: selectedRoom?.coordinates || targetCenter,
        zoom: selectedRoom?.coordinates ? 20.2 : isBlockA ? 19.3 : 18.5,
        pitch: isTopView ? 0 : isBlockA ? 25 : 60,
        bearing: isBlockA ? -20 : -20,
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
  }, [currentState, selectedBuilding, selectedRoom, isTopView]);

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
        console.warn('Geolocation error / permission check:', error.message);
        if (error.code === 1) {
          setGeoDenied(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onUpdateLocation]);

  // Auto-center camera on user location when GPS is activated or updated
  const prevGpsActiveRef = useRef(isGpsActive);
  useEffect(() => {
    const justActivated = isGpsActive && !prevGpsActiveRef.current;
    prevGpsActiveRef.current = isGpsActive;

    if (userLocation && mapRef.current && isGpsActive && (!hasAutoCentered.current || justActivated)) {
      hasAutoCentered.current = true;
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: distanceToCampus > 0.6 ? 16.5 : 18.2,
        pitch: isTopView ? 0 : 45,
        bearing: mapRef.current.getBearing() || 0,
        duration: 1200,
      });
    }
  }, [userLocation, isGpsActive, isTopView, distanceToCampus]);

  // 4. Update GPS Blue Dot Marker (HTML DOM Marker + GeoJSON accuracy circle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const { latitude, longitude, accuracy } = userLocation;

    // Create or update HTML DOM GPS Blue Dot Marker (Guaranteed always visible on top of all 3D layers)
    if (!gpsMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'mapwave-gps-blue-dot';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.pointerEvents = 'none';
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(96, 165, 250, 0.55);"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 0 16px rgba(37,99,235,1), 0 2px 6px rgba(0,0,0,0.6);"></div>
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

      {/* Interactive Animated Building Detail HUD Card on Cursor Hover */}
      {hoveredBuilding && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-75 select-none"
          style={{
            left: `${Math.min(Math.max(16, hoveredBuilding.cursorX || (window.innerWidth / 2)), window.innerWidth - 380)}px`,
            top: `${(hoveredBuilding.cursorY || 350) > 340 ? (hoveredBuilding.cursorY || 350) - 16 : (hoveredBuilding.cursorY || 350) + 24}px`,
            transform: (hoveredBuilding.cursorY || 350) > 340 ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
          }}
        >
          <div className="w-[360px] max-w-[calc(100vw-32px)] p-4 rounded-2xl bg-stone-900/95 backdrop-blur-2xl border border-sky-400/50 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col gap-2.5 pointer-events-auto">
            {/* Top Pill Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  {hoveredBuilding.code}
                </span>
                <span className="text-[10px] text-white/60 font-mono">
                  {hoveredBuilding.category}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified Campus Block</span>
              </span>
            </div>

            {/* Building Title */}
            <div>
              <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm">
                {hoveredBuilding.name}
              </h3>
              {hoveredBuilding.description && (
                <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                  {hoveredBuilding.description}
                </p>
              )}
            </div>

            {/* Departments Chips */}
            {hoveredBuilding.departments && hoveredBuilding.departments.length > 0 && (
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-[9px] font-mono tracking-widest uppercase text-sky-300 font-bold">
                  Housed Departments & Faculties
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredBuilding.departments.map((dept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-sky-950/70 text-sky-200 border border-sky-500/30 text-[11px] font-semibold shadow-sm"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities preview */}
            {hoveredBuilding.facilities && hoveredBuilding.facilities.length > 0 && (
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-[9px] font-mono tracking-widest uppercase text-white/45 font-bold">
                  Key Laboratories & Infrastructure
                </span>
                <div className="text-[11px] text-white/80 space-y-0.5">
                  {hoveredBuilding.facilities.slice(0, 3).map((fac, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-sky-400" />
                      <span className="truncate">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/60 font-mono">
              <div className="flex items-center gap-2">
                <span>{hoveredBuilding.height_m}m Height</span>
                <span>•</span>
                <span>{hoveredBuilding.floor_count} Floors</span>
              </div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <span>✓ Indoor Maps Ready</span>
              </span>
            </div>

            {/* Direct Click Action */}
            <button
              type="button"
              onClick={() => {
                onSelectBuildingRef.current?.(hoveredBuilding);
              }}
              className="mt-1 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40"
            >
              <span>Explore Floorplans & Classrooms</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimal Map Attribution & Coordinates */}
      <div className="absolute bottom-2 left-4 z-10 text-[9px] font-mono text-white/40 tracking-wider pointer-events-none">
        {currentProvider === MAP_PROVIDERS.GOOGLE
          ? 'GOOGLE ULTRA-HD SATELLITE'
          : currentProvider === MAP_PROVIDERS.ESRI
          ? 'ESRI WORLD IMAGERY HD'
          : currentProvider === MAP_PROVIDERS.MAPLIBRE
          ? 'MAPLIBRE OPENSTREETMAP'
          : 'MAPTILER SATELLITE'}{' '}
        • 12.9015° N, 77.5057° E • JSSATE BENGALURU
      </div>
    </div>
  );
}
