import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiClient } from '../../lib/apiClient';

export default function MapOutdoor({ onBuildingSelect }) {
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
              'fill-extrusion-color': '#1E3A8A',
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
        const buildingId = feature.properties.id;

        // Fly camera to building
        const coordinates = e.lngLat;
        map.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 17.5,
          pitch: 60,
          bearing: -20,
          speed: 1.2,
        });

        if (onBuildingSelect) {
          onBuildingSelect(buildingId);
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
  }, [onBuildingSelect]);

  // 2. Geolocation Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ latitude, longitude, accuracy });
        setGeoDenied(false);
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
  }, []);

  // 3. Update GPS Dot & Accuracy Circle on Map
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

    // Dynamic radius update on zoom
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

  // 4. Poll Nearest Building API
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
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* MapLibre Canvas Container */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* Nearest Building Floating Overlay Label */}
      {!geoDenied && nearestInfo && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md border border-gray-100 flex items-center gap-2 font-sans text-sm font-semibold text-gray-800">
          <span className={`w-2.5 h-2.5 rounded-full ${nearestInfo.confidence === 'inside' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          {nearestInfo.confidence === 'inside' ? (
            <span>You're in <strong className="text-emerald-700">{nearestInfo.building_name}</strong></span>
          ) : (
            <span>You're near <strong className="text-blue-700">{nearestInfo.building_name}</strong></span>
          )}
        </div>
      )}

      {/* Geolocation Denied Banner */}
      {geoDenied && (
        <div className="absolute top-4 left-4 z-10 bg-amber-50/90 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-medium text-amber-800 border border-amber-200">
          GPS Location Unavailable / Permission Denied
        </div>
      )}
    </div>
  );
}
