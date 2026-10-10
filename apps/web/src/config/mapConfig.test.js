// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  validateCoordinates,
  buildMapStyleUrl,
  getMapConfig,
  getMapConfigStatus,
  getFallbackRasterStyle,
  MAP_VIEWS,
} from './mapConfig';

describe('MapConfig Module', () => {
  describe('validateCoordinates', () => {
    it('validates correct geographic coordinates within WGS 84 bounds', () => {
      const result = validateCoordinates(12.9015, 77.5057);
      expect(result.isValid).toBe(true);
      expect(result.lat).toBe(12.9015);
      expect(result.lng).toBe(77.5057);
      expect(result.error).toBeNull();
    });

    it('parses numeric string coordinates correctly', () => {
      const result = validateCoordinates(' -33.8688 ', ' 151.2093 ');
      expect(result.isValid).toBe(true);
      expect(result.lat).toBe(-33.8688);
      expect(result.lng).toBe(151.2093);
    });

    it('rejects latitude outside [-90, 90]', () => {
      const result = validateCoordinates(95.0, 77.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/Latitude 95 is out of geographic bounds/i);
    });

    it('rejects longitude outside [-180, 180]', () => {
      const result = validateCoordinates(12.9, 185.0);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/Longitude 185 is out of geographic bounds/i);
    });

    it('rejects missing, null, or empty coordinates', () => {
      expect(validateCoordinates(null, null).isValid).toBe(false);
      expect(validateCoordinates(undefined, 77.5).isValid).toBe(false);
      expect(validateCoordinates('', '').isValid).toBe(false);
    });

    it('rejects non-numeric NaN values', () => {
      const result = validateCoordinates('invalid-lat', 77.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/not a valid finite number/i);
    });
  });

  describe('buildMapStyleUrl', () => {
    it('builds standard MapTiler hybrid style URL', () => {
      const url = buildMapStyleUrl('test-key-123', MAP_VIEWS.HYBRID);
      expect(url).toBe('https://api.maptiler.com/maps/hybrid/style.json?key=test-key-123');
    });

    it('builds MapTiler satellite style URL', () => {
      const url = buildMapStyleUrl('test-key-123', MAP_VIEWS.SATELLITE);
      expect(url).toBe('https://api.maptiler.com/maps/satellite/style.json?key=test-key-123');
    });

    it('supports custom URL template with {key} placeholder', () => {
      const customTemplate = 'https://custom-tiles.org/styles/{key}/style.json';
      const url = buildMapStyleUrl('my-token', MAP_VIEWS.HYBRID, customTemplate);
      expect(url).toBe('https://custom-tiles.org/styles/my-token/style.json');
    });

    it('returns empty string if no API key is provided', () => {
      const url = buildMapStyleUrl('', MAP_VIEWS.HYBRID);
      expect(url).toBe('');
    });
  });

  describe('getMapConfig and getMapConfigStatus', () => {
    it('detects unconfigured state when environment variables are empty', () => {
      const config = getMapConfig({ apiKey: '', lat: null, lng: null });
      const status = getMapConfigStatus(config);

      expect(status.isReady).toBe(false);
      expect(status.missingApiKey).toBe(true);
      expect(status.missingCoordinates).toBe(true);
      expect(status.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('reports ready status when valid key and coordinates are provided', () => {
      const config = getMapConfig({
        apiKey: 'valid-maptiler-key',
        lat: 12.9015,
        lng: 77.5057,
      });
      const status = getMapConfigStatus(config);

      expect(status.isReady).toBe(true);
      expect(status.missingApiKey).toBe(false);
      expect(status.missingCoordinates).toBe(false);
      expect(status.errors).toHaveLength(0);
      expect(config.campusCoordinates).toEqual([77.5057, 12.9015]);
    });

    it('provides fallback raster style specification', () => {
      const fallback = getFallbackRasterStyle();
      expect(fallback.version).toBe(8);
      expect(fallback.sources['esri-world-imagery']).toBeDefined();
      expect(fallback.layers[0].id).toBe('esri-world-imagery-layer');
    });
  });
});
