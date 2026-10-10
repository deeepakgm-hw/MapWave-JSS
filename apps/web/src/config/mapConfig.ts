/**
 * MapWave — 3D Satellite Map Configuration Type Definitions & Re-exports
 */

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapConfig {
  imageryProvider: 'maptiler' | 'esri' | 'custom';
  apiKeyEnvVar: string;
  apiKey: string;
  hasApiKey: boolean;
  campusLat: number | null;
  campusLng: number | null;
  campusCoordinates: [number, number] | null; // [lng, lat]
  isCoordinatesValid: boolean;
  coordinateError: string | null;
  initialZoom: number;
  initialPitch: number;
  initialBearing: number;
  minZoom: number;
  maxZoom: number;
  defaultMapView: 'hybrid' | 'satellite' | 'streets';
  styleUrl: string;
}

export interface MapConfigStatus {
  isReady: boolean;
  missingApiKey: boolean;
  missingCoordinates: boolean;
  invalidCoordinates: boolean;
  errors: string[];
  details: {
    provider: string;
    hasKey: boolean;
    coordinates: [number, number] | null;
  };
}

export {
  MAP_PROVIDERS,
  MAP_VIEWS,
  DEFAULT_VIEWPORT,
  validateCoordinates,
  buildMapStyleUrl,
  getFallbackRasterStyle,
  getMapConfig,
  getMapConfigStatus,
} from './mapConfig.js';
