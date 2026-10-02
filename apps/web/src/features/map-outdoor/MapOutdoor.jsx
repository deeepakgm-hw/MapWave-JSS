import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '../../lib/apiClient';
import { NAV_STATES } from '../../lib/navigationState';

// JSS Academy of Technical Education (JSSATE), Bangalore coordinates
const JSSATE_BANGALORE_CENTER = [77.5057, 12.9015];

export default function MapOutdoor({
  currentState,
  selectedBuilding,
  activeRoute,
  onSelectBuilding,
  onUpdateLocation,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);

  // Helper to convert accuracy meters to pixels at given latitude and zoom level
  const getAccuracyPixelRadius = (accuracyMeters, lat, zoom) => {
    if (!accuracyMeters || !lat) return 20;
    const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
    return Math.max(10, Math.min(200, accuracyMeters / metersPerPixel));
  };

  // 1. Initialize MapLibre Map with ESRI High-Resolution Satellite Map Source
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          },
        },
        layers: [
          {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: JSSATE_BANGALORE_CENTER,
      zoom: 17,
      pitch: 45,
      bearing: -17.6,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const buildingsGeoJson = await apiClient('/api/v1/buildings');
        
        if (!map.getSource('campus-buildings')) {
          map.addSource('campus-buildings', {
            type: 'geojson',
            data: buildingsGeoJson,
          });

          // Layer 1: Existing Buildings (Semi-transparent 3D Extrusion on top of Satellite)
          map.addLayer({
            id: 'existing-buildings-extrusion',
            type: 'fill-extrusion',
            source: 'campus-buildings',
            filter: ['==', ['get', 'status'], 'existing'],
            paint: {
              'fill-extrusion-color': '#1D4ED8', // Vibrant Royal Blue
              'fill-extrusion-height': ['get', 'height_m'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.75,
            },
          });

          // Layer 2: Proposed Buildings (Semi-transparent Gold Extrusion)
          map.addLayer({
            id: 'proposed-buildings-extrusion',
            type: 'fill-extrusion',
            source: 'campus-buildings',
            filter: ['==', ['get', 'status'], 'proposed'],
            paint: {
              'fill-extrusion-color': '#FACC15', // Cyber Gold
              'fill-extrusion-height': ['get', 'height_m'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.5,
            },
          });
        }
      } catch (err) {
        console.error('Failed to load campus buildings GeoJSON:', err);
      }

      // Click event handling for buildings
      map.on('click', 'existing-buildings-extrusion', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const bProps = feature.properties;
        const coordinates = e.lngLat;

        const buildingObj = {
          id: bProps.id,
          name: bProps.name || `Building ${bProps.id}`,
          status: bProps.status,
          height_m: bProps.height_m,
          center: [coordinates.lng, coordinates.lat],
        };

        if (onSelectBuilding) {
          onSelectBuilding(buildingObj);
        }
      });

      // Cursor pointer on hover over existing buildings
      map.on('mouseenter', 'existing-buildings-extrusion', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'existing-buildings-extrusion', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectBuilding]);

  // 2. Camera Swoop Animation reacting to State Machine
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentState === NAV_STATES.BUILDING_FLOORS && selectedBuilding?.center) {
      map.flyTo({
        center: selectedBuilding.center,
        zoom: 18.5,
        pitch: 60,
        bearing: -20,
        speed: 1.2,
      });
    } else if (currentState === NAV_STATES.OVERVIEW) {
      map.flyTo({
        center: JSSATE_BANGALORE_CENTER,
        zoom: 17,
        pitch: 45,
        bearing: -17.6,
        speed: 1.2,
      });
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

      // Accuracy Outer Circle
      map.addLayer({
        id: 'gps-accuracy-circle',
        type: 'circle',
        source: 'gps-location-source',
        paint: {
          'circle-radius': getAccuracyPixelRadius(accuracy, latitude, map.getZoom()),
          'circle-color': '#FF4757',
          'circle-opacity': 0.25,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FF4757',
          'circle-stroke-opacity': 0.6,
        },
      });

      // Inner Coral Red GPS Dot
      map.addLayer({
        id: 'gps-location-dot',
        type: 'circle',
        source: 'gps-location-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FF4757',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF',
        },
      });
    }

    const handleZoom = () => {
      if (map.getLayer('gps-accuracy-circle')) {
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
            'line-color': '#0F172A',
            'line-width': 10,
            'line-opacity': 0.8,
          },
        });

        map.addLayer({
          id: 'active-route-line',
          type: 'line',
          source: 'active-route-source',
          paint: {
            'line-color': '#FACC15', // Yellow Route Line
            'line-width': 6,
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
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-950 bg-slate-900">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* BitSummit-Style Zone Pill Badges overlaying JSSATE Satellite Map */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
        <div className="bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-white shadow-[0_4px_0_0_#9F1239] pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
          JSSATE Block C - CS & AI
        </div>
        <div className="bg-blue-950 text-yellow-400 font-black text-xs px-3 py-1 rounded-full border-2 border-yellow-400 shadow-[0_4px_0_0_#FACC15] pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
          Admin Block A
        </div>
        <div className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-white shadow-[0_4px_0_0_#065F46] pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
          Library & Quadrangle
        </div>
      </div>

      {/* ESRI High Resolution Satellite Badge Indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-blue-950/90 text-yellow-300 font-extrabold text-[10px] px-3 py-1 rounded-full border border-yellow-400/60 shadow-md">
        🛰️ ESRI High-Res Satellite • JSSATE Bangalore (12.9015° N, 77.5057° E)
      </div>

      {/* Nearest Building Floating Overlay Badge */}
      {!geoDenied && nearestInfo && (
        <div className="absolute top-16 left-4 z-10 bg-blue-950/95 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border-2 border-yellow-400 flex items-center gap-2 text-xs font-black">
          <span className={`w-3 h-3 rounded-full ${nearestInfo.confidence === 'inside' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          {nearestInfo.confidence === 'inside' ? (
            <span>Inside <strong className="text-yellow-300">{nearestInfo.building_name}</strong></span>
          ) : (
            <span>Near <strong className="text-yellow-300">{nearestInfo.building_name}</strong></span>
          )}
        </div>
      )}

      {/* Geolocation Denied Notice */}
      {geoDenied && (
        <div className="absolute top-16 left-4 z-10 bg-rose-950/95 text-white backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black border-2 border-rose-500 shadow-xl">
          ⚠️ GPS Location Unavailable (Manual Zone Drill-Down Active)
        </div>
      )}
    </div>
  );
}
