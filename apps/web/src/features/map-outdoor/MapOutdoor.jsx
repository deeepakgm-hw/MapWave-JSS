import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '../../lib/apiClient';
import { NAV_STATES } from '../../lib/navigationState';

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

  // 1. Initialize MapLibre Map
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [77.5946, 12.9716],
      zoom: 16,
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

          // Layer 1: Existing Buildings (Full Opacity Extrusion)
          map.addLayer({
            id: 'existing-buildings-extrusion',
            type: 'fill-extrusion',
            source: 'campus-buildings',
            filter: ['==', ['get', 'status'], 'existing'],
            paint: {
              'fill-extrusion-color': '#1E40AF',
              'fill-extrusion-height': ['get', 'height_m'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.85,
            },
          });

          // Layer 2: Proposed Buildings (Semi-transparent Extrusion)
          map.addLayer({
            id: 'proposed-buildings-extrusion',
            type: 'fill-extrusion',
            source: 'campus-buildings',
            filter: ['==', ['get', 'status'], 'proposed'],
            paint: {
              'fill-extrusion-color': '#F59E0B',
              'fill-extrusion-height': ['get', 'height_m'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.35,
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
      // Swoop down to building
      map.flyTo({
        center: selectedBuilding.center,
        zoom: 18,
        pitch: 60,
        bearing: -20,
        speed: 1.2,
      });
    } else if (currentState === NAV_STATES.OVERVIEW) {
      // Reset camera to campus overview
      map.flyTo({
        center: [77.5946, 12.9716],
        zoom: 16,
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
          'circle-color': '#3B82F6',
          'circle-opacity': 0.2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#2563EB',
          'circle-stroke-opacity': 0.4,
        },
      });

      // Inner Blue GPS Dot
      map.addLayer({
        id: 'gps-location-dot',
        type: 'circle',
        source: 'gps-location-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#2563EB',
          'circle-stroke-width': 2,
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
            [77.5946, 12.9716],
            [77.5950, 12.9720],
            [77.5954, 12.9724],
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
            'line-color': '#1E3A8A',
            'line-width': 8,
            'line-opacity': 0.6,
          },
        });

        map.addLayer({
          id: 'active-route-line',
          type: 'line',
          source: 'active-route-source',
          paint: {
            'line-color': '#3B82F6',
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
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* Nearest Building Floating Overlay Badge */}
      {!geoDenied && nearestInfo && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${nearestInfo.confidence === 'inside' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          {nearestInfo.confidence === 'inside' ? (
            <span>You're in <strong className="text-emerald-700">{nearestInfo.building_name}</strong></span>
          ) : (
            <span>You're near <strong className="text-blue-700">{nearestInfo.building_name}</strong></span>
          )}
        </div>
      )}

      {/* Geolocation Denied Notice */}
      {geoDenied && (
        <div className="absolute top-4 left-4 z-10 bg-amber-50/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900 border border-amber-300 shadow-md">
          ⚠️ GPS Location Unavailable (Manual Drill-Down Enabled)
        </div>
      )}
    </div>
  );
}
