import * as maplibregl from 'maplibre-gl';

/**
 * Intelligent Map Label Declutter Manager
 * Priority tiers:
 * Tier 3: Building Footprints
 * Tier 2: Labs and Major Facilities
 * Tier 1: Rooms (Zoom >= 19 only)
 * Tier 0: Corridors & Utilities
 */
export class LabelLayer {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.rawLabels = [];
    this.handleUpdate = this.handleUpdate.bind(this);

    if (this.map) {
      this.map.on('move', this.handleUpdate);
      this.map.on('zoom', this.handleUpdate);
    }
  }

  setLabels(labels) {
    this.rawLabels = labels || [];
    this.handleUpdate();
  }

  handleUpdate() {
    if (!this.map || !this.map.isStyleLoaded()) return;

    const currentZoom = this.map.getZoom();
    const placedBoxes = [];

    // Clear existing DOM markers
    this.clearMarkers();

    // Sort labels by priority (highest priority first)
    const sorted = [...this.rawLabels].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    sorted.forEach((item) => {
      // Rule: Rooms & corridors only render when zoom >= 19
      if (item.priority <= 1 && currentZoom < 18.8) {
        return;
      }

      const point =
        typeof this.map.project === 'function'
          ? this.map.project(item.coordinates)
          : { x: 0, y: 0 };
      // Rough bounding box estimation based on text length
      const width = Math.max((item.text?.length || 6) * 7.5 + 16, 40);
      const height = 22;
      const margin = 4;

      const box = {
        minX: point.x - width / 2 - margin,
        maxX: point.x + width / 2 + margin,
        minY: point.y - height / 2 - margin,
        maxY: point.y + height / 2 + margin,
      };

      // Collision detection: Check if box intersects with any already placed higher-priority label
      const hasCollision = placedBoxes.some((placed) => {
        return !(
          box.maxX < placed.minX ||
          box.minX > placed.maxX ||
          box.maxY < placed.minY ||
          box.minY > placed.maxY
        );
      });

      if (!hasCollision) {
        placedBoxes.push(box);
        this.renderMarker(item);
      }
    });
  }

  renderMarker(item) {
    const el = document.createElement('div');
    el.className = 'indoor-room-label';
    el.textContent = item.text;

    if (item.className) {
      el.classList.add(item.className);
    }

    if (item.onClick) {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        item.onClick();
      });
    }

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(item.coordinates)
      .addTo(this.map);

    this.markers.push(marker);
  }

  clearMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
  }

  destroy() {
    if (this.map) {
      this.map.off('move', this.handleUpdate);
      this.map.off('zoom', this.handleUpdate);
    }
    this.clearMarkers();
    this.rawLabels = [];
  }
}

export default LabelLayer;
