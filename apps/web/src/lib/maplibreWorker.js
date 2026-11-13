import * as maplibregl from 'maplibre-gl';

let isWorkerConfigured = false;

export function initMapLibreWorker() {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  try {
    if ('setWorkerUrl' in maplibregl && typeof maplibregl.setWorkerUrl === 'function') {
      // MapLibre v6 uses dynamic module worker imports.
      // unpkg delivers the exact 6.11.2 worker bundle with proper 'text/javascript' MIME type and CORS headers.
      maplibregl.setWorkerUrl('https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl-worker.mjs');
      isWorkerConfigured = true;
    }
  } catch (err) {
    console.warn('[MapLibre] Failed to configure CDN worker URL, falling back to local asset:', err);
    try {
      if ('setWorkerUrl' in maplibregl && typeof maplibregl.setWorkerUrl === 'function') {
        const origin = window.location.origin || '';
        maplibregl.setWorkerUrl(`${origin}/assets/maplibre-gl-worker.js`);
        isWorkerConfigured = true;
      }
    } catch {
      // Ignore in mock environment
    }
  }
}

// Auto-run once upon import in browser environment
initMapLibreWorker();
