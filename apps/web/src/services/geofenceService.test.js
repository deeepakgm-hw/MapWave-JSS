import { describe, it, expect, beforeEach } from 'vitest';
import {
  isPointInCampus,
  validateGpsAccuracy,
  calculateHaversineDistanceKm,
  GeofenceManager,
  APP_MODES,
  GEOFENCE_CONFIG,
  normalizeCoordinates,
} from './geofenceService';
import campusBoundary from '../data/campus-boundary.json';

describe('geofenceService - Authoritative KML Geofencing', () => {
  it('correctly normalizes different coordinate input structures', () => {
    expect(normalizeCoordinates([77.505, 12.901])).toEqual([77.505, 12.901]);
    expect(normalizeCoordinates({ longitude: 77.505, latitude: 12.901 })).toEqual([77.505, 12.901]);
    expect(normalizeCoordinates({ lng: 77.505, lat: 12.901 })).toEqual([77.505, 12.901]);
    expect(
      normalizeCoordinates({
        type: 'Point',
        coordinates: [77.505, 12.901],
      })
    ).toEqual([77.505, 12.901]);
    expect(normalizeCoordinates(null)).toBeNull();
  });

  describe('Point-in-Polygon (PIP) detection against Authoritative Campus Boundary', () => {
    it('detects campus interior points as inside', () => {
      // Campus center / quadrangle
      expect(isPointInCampus([77.50546, 12.90247])).toBe(true);
      // Block A (CSE, ISE, Robotics)
      expect(isPointInCampus([77.5057, 12.9015])).toBe(true);
      // Block B (ECE, Library)
      expect(isPointInCampus([77.50495, 12.9027])).toBe(true);
      // Cafeteria
      expect(isPointInCampus([77.5054, 12.9022])).toBe(true);
    });

    it('detects points outside the authoritative boundary as outside', () => {
      // Uttarahalli Main Road (West outside)
      expect(isPointInCampus([77.5010, 12.9015])).toBe(false);
      // Kengeri Road (East outside)
      expect(isPointInCampus([77.5090, 12.9040])).toBe(false);
      // Bangalore City Center (Majestic)
      expect(isPointInCampus([77.5700, 12.9760])).toBe(false);
      // Electronic City
      expect(isPointInCampus([77.6600, 12.8450])).toBe(false);
    });
  });

  describe('GPS Accuracy Validation', () => {
    it('accepts accurate GPS fixes', () => {
      const goodFix = { latitude: 12.902, longitude: 77.505, accuracy: 8.5 };
      const result = validateGpsAccuracy(goodFix);
      expect(result.isValid).toBe(true);
      expect(result.accuracy).toBe(8.5);
    });

    it('rejects low-accuracy readings exceeding threshold', () => {
      const noisyFix = { latitude: 12.902, longitude: 77.505, accuracy: 250 };
      const result = validateGpsAccuracy(noisyFix);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('LOW_ACCURACY_EXCEEDED_THRESHOLD');
    });

    it('handles missing accuracy property gracefully', () => {
      const fixWithoutAccuracy = { latitude: 12.902, longitude: 77.505 };
      const result = validateGpsAccuracy(fixWithoutAccuracy);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Haversine Distance Calculation', () => {
    it('calculates distance accurately', () => {
      const p1 = [77.50546, 12.90247];
      const p2 = [77.50546, 12.90247];
      expect(calculateHaversineDistanceKm(p1, p2)).toBeCloseTo(0, 4);

      const p3 = [77.5700, 12.9760]; // ~10.5 km away in Central Bangalore
      const dist = calculateHaversineDistanceKm(p1, p3);
      expect(dist).toBeGreaterThan(9.0);
      expect(dist).toBeLessThan(13.0);
    });
  });

  describe('GeofenceManager & Entry/Exit Hysteresis', () => {
    let manager;
    const insideCoords = { latitude: 12.90247, longitude: 77.50546, accuracy: 5 };
    const outsideCoords = { latitude: 12.95000, longitude: 77.55000, accuracy: 5 };

    beforeEach(() => {
      manager = new GeofenceManager({
        requiredConsecutive: 3,
        initialMode: APP_MODES.CAMPUS_MODE,
      });
    });

    it('initializes in specified mode', () => {
      expect(manager.getMode()).toBe(APP_MODES.CAMPUS_MODE);
    });

    it('does not prematurely switch to EXPLORE_MODE on a single outside reading', () => {
      const r1 = manager.processReading(outsideCoords);
      expect(r1.mode).toBe(APP_MODES.CAMPUS_MODE);
      expect(r1.switched).toBe(false);
      expect(r1.consecutiveCount).toBe(1);
    });

    it('requires multiple consistent readings before switching to EXPLORE_MODE', () => {
      // 1st outside reading
      const r1 = manager.processReading(outsideCoords);
      expect(r1.switched).toBe(false);
      expect(r1.mode).toBe(APP_MODES.CAMPUS_MODE);

      // 2nd outside reading
      const r2 = manager.processReading(outsideCoords);
      expect(r2.switched).toBe(false);
      expect(r2.mode).toBe(APP_MODES.CAMPUS_MODE);
      expect(r2.consecutiveCount).toBe(2);

      // 3rd outside reading -> hysteresis fulfilled!
      const r3 = manager.processReading(outsideCoords);
      expect(r3.switched).toBe(true);
      expect(r3.mode).toBe(APP_MODES.EXPLORE_MODE);
      expect(manager.getMode()).toBe(APP_MODES.EXPLORE_MODE);
    });

    it('resets hysteresis counter if readings oscillate before reaching threshold', () => {
      // 1st outside reading
      manager.processReading(outsideCoords);
      // 2nd outside reading
      manager.processReading(outsideCoords);
      // Unexpected inside bounce reading (GPS jitter near edge)
      const r3 = manager.processReading(insideCoords);
      expect(r3.mode).toBe(APP_MODES.CAMPUS_MODE);
      expect(r3.consecutiveCount).toBe(0);

      // Next outside reading starts fresh count from 1
      const r4 = manager.processReading(outsideCoords);
      expect(r4.consecutiveCount).toBe(1);
      expect(r4.switched).toBe(false);
    });

    it('switches back from EXPLORE_MODE to CAMPUS_MODE after 3 consecutive inside readings', () => {
      manager.setMode(APP_MODES.EXPLORE_MODE);
      expect(manager.getMode()).toBe(APP_MODES.EXPLORE_MODE);

      manager.processReading(insideCoords);
      manager.processReading(insideCoords);
      const r3 = manager.processReading(insideCoords);

      expect(r3.switched).toBe(true);
      expect(r3.mode).toBe(APP_MODES.CAMPUS_MODE);
      expect(manager.getMode()).toBe(APP_MODES.CAMPUS_MODE);
    });

    it('ignores readings that fail accuracy validation and does not advance hysteresis', () => {
      const inaccurateOutside = { latitude: 12.95000, longitude: 77.55000, accuracy: 400 };
      const r = manager.processReading(inaccurateOutside);
      expect(r.accuracyValid).toBe(false);
      expect(r.consecutiveCount).toBe(0);
      expect(r.mode).toBe(APP_MODES.CAMPUS_MODE);
    });
  });
});
