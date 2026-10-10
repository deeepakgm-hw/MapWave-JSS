/**
 * MapWave — Centralized 3D Satellite Map Configuration
 *
 * Manages imagery provider settings, style URLs, coordinate validation,
 * and environment variable resolution for MapLibre GL JS.
 */

export const MAP_PROVIDERS = {
  MAPTILER: 'maptiler',
  ESRI: 'esri',
  CUSTOM: 'custom',
};

export const MAP_VIEWS = {
  HYBRID: 'hybrid',
  SATELLITE: 'satellite',
  STREETS: 'streets',
};

export const DEFAULT_VIEWPORT = {
  zoom: 16.8,
  pitch: 45,
  bearing: -17.6,
  minZoom: 0,
  maxZoom: 22,
};

/**
 * Validates if coordinates are finite numbers within valid WGS 84 geographic bounds.
 * Latitude must be within [-90, 90], Longitude must be within [-180, 180].
 *
 * @param {any} lat
 * @param {any} lng
 * @returns {{ isValid: boolean, lat: number | null, lng: number | null, error: string | null }}
 */
export function validateCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lat === '' || lng === null || lng === undefined || lng === '') {
    return {
      isValid: false,
      lat: null,
      lng: null,
      error: 'Campus coordinates are not set.',
    };
  }

  const parsedLat = typeof lat === 'number' ? lat : parseFloat(String(lat).trim());
  const parsedLng = typeof lng === 'number' ? lng : parseFloat(String(lng).trim());

  if (isNaN(parsedLat) || !Number.isFinite(parsedLat)) {
    return {
      isValid: false,
      lat: null,
      lng: null,
      error: `Latitude "${lat}" is not a valid finite number.`,
    };
  }

  if (isNaN(parsedLng) || !Number.isFinite(parsedLng)) {
    return {
      isValid: false,
      lat: null,
      lng: null,
      error: `Longitude "${lng}" is not a valid finite number.`,
    };
  }

  if (parsedLat < -90 || parsedLat > 90) {
    return {
      isValid: false,
      lat: parsedLat,
      lng: parsedLng,
      error: `Latitude ${parsedLat} is out of geographic bounds [-90, 90].`,
    };
  }

  if (parsedLng < -180 || parsedLng > 180) {
    return {
      isValid: false,
      lat: parsedLat,
      lng: parsedLng,
      error: `Longitude ${parsedLng} is out of geographic bounds [-180, 180].`,
    };
  }

  return {
    isValid: true,
    lat: parsedLat,
    lng: parsedLng,
    error: null,
  };
}

/**
 * Generates the MapTiler or custom style URL from current key and style mode.
 *
 * @param {string} apiKey
 * @param {string} styleMode - 'hybrid' | 'satellite' | 'streets'
 * @param {string} customUrlTemplate
 * @returns {string}
 */
export function buildMapStyleUrl(apiKey, styleMode = MAP_VIEWS.HYBRID, customUrlTemplate = '') {
  if (customUrlTemplate) {
    return customUrlTemplate
      .replace('{key}', apiKey || '')
      .replace('{apiKey}', apiKey || '');
  }

  if (!apiKey) {
    return '';
  }

  switch (styleMode) {
    case MAP_VIEWS.SATELLITE:
      return `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`;
    case MAP_VIEWS.STREETS:
      return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${apiKey}`;
    case MAP_VIEWS.HYBRID:
    default:
      return `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`;
  }
}

/**
 * Generates an offline/fallback MapLibre raster style using Esri World Imagery
 * when MapTiler credentials are not yet supplied but fallback testing is active.
 *
 * @returns {object} MapLibre style JSON specification
 */
export function getFallbackRasterStyle() {
  return {
    version: 8,
    sources: {
      'esri-world-imagery': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      },
    },
    layers: [
      {
        id: 'esri-world-imagery-layer',
        type: 'raster',
        source: 'esri-world-imagery',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

/**
 * Resolves current map configuration from environment variables and runtime overrides.
 *
 * @param {object} overrides - Optional runtime configuration overrides
 * @returns {object} Complete map configuration
 */
export function getMapConfig(overrides = {}) {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

  const apiKey = overrides.apiKey !== undefined
    ? overrides.apiKey
    : (env.VITE_MAPTILER_KEY || '').trim();

  const rawLat = overrides.lat !== undefined ? overrides.lat : env.VITE_CAMPUS_LAT;
  const rawLng = overrides.lng !== undefined ? overrides.lng : env.VITE_CAMPUS_LNG;
  const coordValidation = validateCoordinates(rawLat, rawLng);

  const imageryProvider = overrides.imageryProvider || MAP_PROVIDERS.MAPTILER;
  const defaultMapView = overrides.defaultMapView || MAP_VIEWS.HYBRID;
  const customStyleUrl = overrides.styleUrl || (env.VITE_MAP_STYLE_URL || '').trim();

  const initialZoom = parseFloat(overrides.zoom || env.VITE_CAMPUS_ZOOM || DEFAULT_VIEWPORT.zoom);
  const initialPitch = parseFloat(overrides.pitch || env.VITE_CAMPUS_PITCH || DEFAULT_VIEWPORT.pitch);
  const initialBearing = parseFloat(overrides.bearing || env.VITE_CAMPUS_BEARING || DEFAULT_VIEWPORT.bearing);

  return {
    imageryProvider,
    apiKeyEnvVar: 'VITE_MAPTILER_KEY',
    apiKey,
    hasApiKey: Boolean(apiKey && apiKey.length > 0),
    campusLat: coordValidation.lat,
    campusLng: coordValidation.lng,
    campusCoordinates: coordValidation.isValid ? [coordValidation.lng, coordValidation.lat] : null,
    isCoordinatesValid: coordValidation.isValid,
    coordinateError: coordValidation.error,
    initialZoom: isNaN(initialZoom) ? DEFAULT_VIEWPORT.zoom : initialZoom,
    initialPitch: isNaN(initialPitch) ? DEFAULT_VIEWPORT.pitch : initialPitch,
    initialBearing: isNaN(initialBearing) ? DEFAULT_VIEWPORT.bearing : initialBearing,
    minZoom: DEFAULT_VIEWPORT.minZoom,
    maxZoom: DEFAULT_VIEWPORT.maxZoom,
    defaultMapView,
    styleUrl: buildMapStyleUrl(apiKey, defaultMapView, customStyleUrl),
  };
}

/**
 * Evaluates the readiness of the map configuration and produces detailed diagnostic messages.
 *
 * @param {object} config - Configuration object returned by getMapConfig
 * @returns {{
 *   isReady: boolean,
 *   missingApiKey: boolean,
 *   missingCoordinates: boolean,
 *   invalidCoordinates: boolean,
 *   errors: string[],
 *   details: object
 * }}
 */
export function getMapConfigStatus(config) {
  const errors = [];
  const missingApiKey = !config.hasApiKey;
  const missingCoordinates = config.campusLat === null && config.campusLng === null;
  const invalidCoordinates = !missingCoordinates && !config.isCoordinatesValid;

  if (missingApiKey) {
    errors.push('MapTiler API key is not configured (missing VITE_MAPTILER_KEY).');
  }

  if (missingCoordinates) {
    errors.push('Campus coordinates are not set (missing VITE_CAMPUS_LAT and VITE_CAMPUS_LNG).');
  } else if (invalidCoordinates) {
    errors.push(config.coordinateError || 'Campus coordinates are outside valid geographic bounds.');
  }

  return {
    isReady: !missingApiKey && config.isCoordinatesValid,
    missingApiKey,
    missingCoordinates,
    invalidCoordinates,
    errors,
    details: {
      provider: config.imageryProvider,
      hasKey: config.hasApiKey,
      coordinates: config.campusCoordinates,
    },
  };
}
