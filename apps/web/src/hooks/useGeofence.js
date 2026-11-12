import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GeofenceManager,
  APP_MODES,
  GEOFENCE_CONFIG,
  calculateHaversineDistanceKm,
} from '../services/geofenceService';
import campusBoundary from '../data/campus-boundary.json';

/**
 * useGeofence
 * 
 * Manages live GPS tracking with Turf.js point-in-polygon boundary checks,
 * GPS accuracy filtering, and hysteresis-backed automatic mode switching.
 */
export function useGeofence({
  initialMode = APP_MODES.CAMPUS_MODE,
  requiredConsecutive = GEOFENCE_CONFIG.REQUIRED_CONSECUTIVE_READINGS,
  maxAccuracyThreshold = GEOFENCE_CONFIG.MAX_ACCURACY_THRESHOLD_METERS,
  onModeSwitch,
  onLocationUpdate,
} = {}) {
  const [mode, setMode] = useState(initialMode);
  const [isInsideCampus, setIsInsideCampus] = useState(initialMode === APP_MODES.CAMPUS_MODE);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToCampusKm, setDistanceToCampusKm] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'searching' | 'active' | 'denied' | 'unavailable' | 'timeout'
  const [accuracyValid, setAccuracyValid] = useState(true);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [candidateMode, setCandidateMode] = useState(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const managerRef = useRef(null);
  const watchIdRef = useRef(null);
  const onLocationUpdateRef = useRef(onLocationUpdate);
  onLocationUpdateRef.current = onLocationUpdate;

  if (!managerRef.current) {
    managerRef.current = new GeofenceManager({
      boundary: campusBoundary,
      requiredConsecutive,
      maxAccuracy: maxAccuracyThreshold,
      initialMode,
    });
  }

  const processGpsFix = useCallback(
    (coords) => {
      if (!coords) return;
      const manager = managerRef.current;
      const result = manager.processReading(coords);

      setUserLocation(coords);
      setIsInsideCampus(result.rawInside);
      setAccuracyValid(result.accuracyValid);
      setConsecutiveCount(result.consecutiveCount);
      setCandidateMode(result.candidateMode);

      const dist = calculateHaversineDistanceKm(
        coords,
        GEOFENCE_CONFIG.CAMPUS_CENTER_COORDS
      );
      setDistanceToCampusKm(dist);

      if (onLocationUpdateRef.current) {
        onLocationUpdateRef.current(coords, result);
      }

      if (!isManualOverride && result.switched) {
        setMode(result.mode);
        if (onModeSwitch) {
          onModeSwitch(result.mode, coords);
        }
      }
    },
    [isManualOverride, onModeSwitch]
  );

  const startWatching = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unavailable');
      return;
    }

    setGpsStatus('searching');

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsStatus('active');
        const fix = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
        processGpsFix(fix);
      },
      (err) => {
        console.warn('Geofence watchPosition error:', err);
        if (err.code === 1) {
          setGpsStatus('denied');
        } else if (err.code === 2) {
          setGpsStatus('unavailable');
        } else if (err.code === 3) {
          setGpsStatus('timeout');
        } else {
          setGpsStatus('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [processGpsFix]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus('idle');
  }, []);

  const manualSetMode = useCallback((newMode) => {
    setIsManualOverride(true);
    setMode(newMode);
    managerRef.current?.setMode(newMode);
  }, []);

  const clearManualOverride = useCallback(() => {
    setIsManualOverride(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    mode,
    isInsideCampus,
    userLocation,
    distanceToCampusKm,
    gpsStatus,
    accuracyValid,
    consecutiveCount,
    candidateMode,
    isManualOverride,
    startWatching,
    stopWatching,
    processGpsFix,
    manualSetMode,
    clearManualOverride,
  };
}
