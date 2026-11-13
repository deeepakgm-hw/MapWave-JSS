import * as maplibregl from 'maplibre-gl';
import workerSource from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';

let isWorkerConfigured = false;

export function initMapLibreWorker() {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  try {
    if ('setWorkerUrl' in maplibregl && typeof maplibregl.setWorkerUrl === 'function') {
      if (typeof window.Blob !== 'undefined' && typeof window.URL?.createObjectURL === 'function' && workerSource) {
        const blob = new Blob([workerSource], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        maplibregl.setWorkerUrl(blobUrl);
        isWorkerConfigured = true;
        return;
      }
      maplibregl.setWorkerUrl('/assets/maplibre-gl-worker.mjs');
      isWorkerConfigured = true;
    }
  } catch (err) {
    console.warn('[MapLibre] Fallback to static worker URL:', err);
    try {
      if ('setWorkerUrl' in maplibregl && typeof maplibregl.setWorkerUrl === 'function') {
        maplibregl.setWorkerUrl('/assets/maplibre-gl-worker.mjs');
        isWorkerConfigured = true;
      }
    } catch {
      // Ignore in mock environment
    }
  }
}

// Auto-run once upon import in browser environment
initMapLibreWorker();
