import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import campusBoundary from '../data/campus-boundary.json';
import { CAMPUS_CENTER } from '../data';

export const APP_MODES = {
  CAMPUS_MODE: 'CAMPUS_MODE',
  EXPLORE_MODE: 'EXPLORE_MODE',
};

export const GEOFENCE_CONFIG = {
  REQUIRED_CONSECUTIVE_READINGS: 3,
  MAX_ACCURACY_THRESHOLD_METERS: 150,
  CAMPUS_CENTER_COORDS: CAMPUS_CENTER,
};

/**
 * Standard ray-casting point-in-polygon algorithm fallback.
 */
function rayCastingPointInPolygon(point, polygonCoordinates) {
  const [x, y] = point;
  let inside = false;
  const ring = polygonCoordinates[0] || polygonCoordinates;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Formats arbitrary coordinate representations into [longitude, latitude].
 */
export function normalizeCoordinates(coords) {
  if (!coords) return null;
  if (Array.isArray(coords)) {
    if (coords.length >= 2) return [Number(coords[0]), Number(coords[1])];
    return null;
  }
  if (typeof coords === 'object') {
    if (coords.type === 'Point' && Array.isArray(coords.coordinates)) {
      return [Number(coords.coordinates[0]), Number(coords.coordinates[1])];
    }
    if (coords.geometry && coords.geometry.coordinates) {
      return [
        Number(coords.geometry.coordinates[0]),
        Number(coords.geometry.coordinates[1]),
      ];
    }
    const lon =
      coords.longitude !== undefined
        ? coords.longitude
        : coords.lng !== undefined
        ? coords.lng
        : coords.lon;
    const lat = coords.latitude !== undefined ? coords.latitude : coords.lat;
    if (lon !== undefined && lat !== undefined) {
      return [Number(lon), Number(lat)];
    }
  }
  return null;
}

/**
 * Validates GPS accuracy against a maximum threshold in meters.
 * Readings with error margins greater than threshold are flagged as low accuracy.
 */
export function validateGpsAccuracy(
  coords,
  maxThreshold = GEOFENCE_CONFIG.MAX_ACCURACY_THRESHOLD_METERS
) {
  if (!coords) {
    return { isValid: false, reason: 'NO_COORDINATES', accuracy: null };
  }
  const accuracy = coords.accuracy;
  if (accuracy === undefined || accuracy === null) {
    return { isValid: true, reason: 'ACCURACY_UNSPECIFIED', accuracy: null };
  }
  if (typeof accuracy !== 'number' || Number.isNaN(accuracy) || accuracy < 0) {
    return { isValid: false, reason: 'INVALID_ACCURACY_VALUE', accuracy };
  }
  if (accuracy > maxThreshold) {
    return {
      isValid: false,
      reason: 'LOW_ACCURACY_EXCEEDED_THRESHOLD',
      accuracy,
      maxThreshold,
    };
  }
  return { isValid: true, reason: 'VALID_ACCURACY', accuracy };
}

/**
 * Checks if a coordinate is inside the authoritative JSSATE campus boundary polygon.
 * Uses Turf.js booleanPointInPolygon with graceful ray-casting fallback.
 */
export function isPointInCampus(coords, boundaryGeojson = campusBoundary) {
  const normPoint = normalizeCoordinates(coords);
  if (!normPoint) return false;

  const feature =
    boundaryGeojson?.type === 'FeatureCollection'
      ? boundaryGeojson.features?.[0]
      : boundaryGeojson?.type === 'Feature'
      ? boundaryGeojson
      : { type: 'Feature', geometry: boundaryGeojson };

  if (!feature || !feature.geometry) return false;

  const ptFeature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: normPoint,
    },
  };

  try {
    if (typeof booleanPointInPolygon === 'function') {
      return booleanPointInPolygon(ptFeature, feature);
    }
  } catch (err) {
    console.warn('Turf point-in-polygon fallback invoked:', err);
  }

  // Fallback ray-casting point-in-polygon
  if (feature.geometry.type === 'Polygon') {
    return rayCastingPointInPolygon(normPoint, feature.geometry.coordinates);
  } else if (feature.geometry.type === 'MultiPolygon') {
    return feature.geometry.coordinates.some((polygonCoords) =>
      rayCastingPointInPolygon(normPoint, polygonCoords)
    );
  }

  return false;
}

/**
 * Calculates great-circle Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(coord1, coord2) {
  const p1 = normalizeCoordinates(coord1);
  const p2 = normalizeCoordinates(coord2);
  if (!p1 || !p2) return 0;

  const [lon1, lat1] = p1;
  const [lon2, lat2] = p2;

  const R = 6371; // Earth's radius in km
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
}

/**
 * GeofenceManager manages GPS readings, hysteresis thresholding, and mode switching.
 */
export class GeofenceManager {
  constructor(options = {}) {
    this.boundary = options.boundary || campusBoundary;
    this.requiredConsecutive =
      options.requiredConsecutive || GEOFENCE_CONFIG.REQUIRED_CONSECUTIVE_READINGS;
    this.maxAccuracy =
      options.maxAccuracy || GEOFENCE_CONFIG.MAX_ACCURACY_THRESHOLD_METERS;
    this.currentMode = options.initialMode || APP_MODES.CAMPUS_MODE;
    this.consecutiveCount = 0;
    this.candidateMode = null;
    this.lastProcessedPosition = null;
    this.lastRawInside = null;
  }

  /**
   * Evaluates a new GPS position through accuracy validation and hysteresis counters.
   * Returns evaluation summary and whether a mode switch occurred.
   */
  processReading(position) {
    if (!position) {
      return {
        mode: this.currentMode,
        rawInside: this.lastRawInside,
        consecutiveCount: this.consecutiveCount,
        switched: false,
        accuracyValid: false,
        reason: 'NO_POSITION',
      };
    }

    const accuracyValidation = validateGpsAccuracy(position, this.maxAccuracy);
    if (!accuracyValidation.isValid) {
      return {
        mode: this.currentMode,
        rawInside: this.lastRawInside,
        consecutiveCount: this.consecutiveCount,
        switched: false,
        accuracyValid: false,
        accuracy: position.accuracy,
        reason: accuracyValidation.reason,
      };
    }

    const isInside = isPointInCampus(position, this.boundary);
    this.lastRawInside = isInside;
    this.lastProcessedPosition = position;

    const targetMode = isInside ? APP_MODES.CAMPUS_MODE : APP_MODES.EXPLORE_MODE;

    let switched = false;

    // If the reading indicates a different mode than the active currentMode
    if (targetMode !== this.currentMode) {
      if (this.candidateMode === targetMode) {
        this.consecutiveCount += 1;
      } else {
        this.candidateMode = targetMode;
        this.consecutiveCount = 1;
      }

      // Check if hysteresis threshold is satisfied
      if (this.consecutiveCount >= this.requiredConsecutive) {
        this.currentMode = targetMode;
        this.candidateMode = null;
        this.consecutiveCount = 0;
        switched = true;
      }
    } else {
      // Current mode matches the reading; reset any pending transition
      this.candidateMode = null;
      this.consecutiveCount = 0;
    }

    const distanceKm = calculateHaversineDistanceKm(
      position,
      GEOFENCE_CONFIG.CAMPUS_CENTER_COORDS
    );

    return {
      mode: this.currentMode,
      rawInside: isInside,
      candidateMode: this.candidateMode,
      consecutiveCount: this.consecutiveCount,
      requiredConsecutive: this.requiredConsecutive,
      switched,
      accuracyValid: true,
      accuracy: position.accuracy,
      distanceToCampusKm: distanceKm,
    };
  }

  setMode(mode) {
    if (mode === APP_MODES.CAMPUS_MODE || mode === APP_MODES.EXPLORE_MODE) {
      this.currentMode = mode;
      this.candidateMode = null;
      this.consecutiveCount = 0;
    }
  }

  getMode() {
    return this.currentMode;
  }

  reset() {
    this.consecutiveCount = 0;
    this.candidateMode = null;
    this.lastProcessedPosition = null;
    this.lastRawInside = null;
  }
}
