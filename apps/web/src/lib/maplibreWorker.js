import * as maplibregl from 'maplibre-gl';

let isWorkerConfigured = false;

export function initMapLibreWorker() {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  try {
    if ('setWorkerUrl' in maplibregl && typeof maplibregl.setWorkerUrl === 'function') {
      // Use the static same-origin worker script bundled in public/assets/
      // This eliminates the blob: revokeObjectURL bug and works reliably in all production environments.
      const origin = window.location.origin || '';
      const workerUrl = `${origin}/assets/maplibre-gl-worker.js`;
      maplibregl.setWorkerUrl(workerUrl);
      isWorkerConfigured = true;
    }
  } catch (err) {
    console.warn('[MapLibre] Failed to configure worker URL:', err);
  }
}

// Auto-run once upon import in browser environment
initMapLibreWorker();
