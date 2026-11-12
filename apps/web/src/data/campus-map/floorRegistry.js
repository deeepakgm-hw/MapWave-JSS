// Central Floor Configuration Registry for Indoor Campus Mapping
// Maps verified building codes and floor levels to their authoritative QGIS GeoJSON datasets

import blockAFloor2Rooms from './academic-block-a/floor-2/rooms.geojson';
import blockAFloor2Doors from './academic-block-a/floor-2/doors.geojson';
import blockAFloor2Paths from './academic-block-a/floor-2/paths.geojson';

export const INDOOR_FLOOR_REGISTRY = {
  BLOCK_A: {
    buildingId: 'b1000000-0000-0000-0000-000000000001',
    buildingCode: 'BLOCK_A',
    buildingName: 'Academic Block A',
    shortName: 'Block A',
    center: [77.50456, 12.90282],
    defaultFloor: 2,
    floors: [
      {
        id: 'floor-1',
        level_number: 1,
        name: 'First Floor (Ground)',
        shortLabel: 'F1',
        status: 'unmapped',
        notes: 'First Floor — Reception, Core Labs & Workshops (Survey in progress)',
        datasets: null,
      },
      {
        id: 'floor-2',
        level_number: 2,
        name: 'Second Floor',
        shortLabel: 'F2',
        status: 'available',
        notes: 'Second Floor — ISE & CSE Departments, Varahamihira Lab, Project Labs & Seminar Hall',
        datasets: {
          rooms: blockAFloor2Rooms,
          doors: blockAFloor2Doors,
          paths: blockAFloor2Paths,
        },
        stats: {
          roomCount: blockAFloor2Rooms.features.length,
          doorCount: blockAFloor2Doors.features.length,
          pathCount: blockAFloor2Paths.features.length,
        },
      },
      {
        id: 'floor-3',
        level_number: 3,
        name: 'Third Floor',
        shortLabel: 'F3',
        status: 'unmapped',
        notes: 'Third Floor — CAD/CAM Modelling Centre & Lecture Halls (Phase 2)',
        datasets: null,
      },
    ],
  },
};

/**
 * Normalizes a building code string to match registry keys.
 */
export function normalizeBuildingCode(codeOrName) {
  if (!codeOrName) return null;
  const upper = String(codeOrName).toUpperCase().trim();
  if (upper === 'BLOCK_A' || upper === 'A' || upper.includes('BLOCK A')) return 'BLOCK_A';
  if (upper === 'BLOCK_B' || upper === 'B' || upper.includes('BLOCK B')) return 'BLOCK_B';
  if (upper.includes('CIVIL')) return 'BLOCK_CIVIL';
  return upper;
}

/**
 * Returns the floor configuration for a building.
 */
export function getBuildingFloorConfig(buildingCodeOrName) {
  const code = normalizeBuildingCode(buildingCodeOrName);
  return INDOOR_FLOOR_REGISTRY[code] || null;
}

/**
 * Returns available (mapped) floors for a given building.
 */
export function getAvailableFloors(buildingCodeOrName) {
  const config = getBuildingFloorConfig(buildingCodeOrName);
  if (!config) return [];
  return config.floors.filter((f) => f.status === 'available');
}

/**
 * Returns a specific floor configuration and its datasets.
 */
export function getFloorData(buildingCodeOrName, levelOrId) {
  const config = getBuildingFloorConfig(buildingCodeOrName);
  if (!config) return null;

  const targetLevel = typeof levelOrId === 'number'
    ? levelOrId
    : parseInt(String(levelOrId).replace(/\D/g, ''), 10) || config.defaultFloor;

  return config.floors.find((f) => f.level_number === targetLevel) || null;
}

/**
 * Checks whether a specific floor has verified indoor data.
 */
export function isFloorMapped(buildingCodeOrName, levelOrId) {
  const floor = getFloorData(buildingCodeOrName, levelOrId);
  return floor !== null && floor.status === 'available' && floor.datasets !== null;
}

/**
 * Computes polygon centroid using green's theorem on coordinates.
 */
export function calculatePolygonCentroid(coordinatesRing) {
  if (!coordinatesRing || coordinatesRing.length === 0) return [0, 0];
  const origin = coordinatesRing[0];
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < coordinatesRing.length - 1; i++) {
    const x0 = coordinatesRing[i][0] - origin[0];
    const y0 = coordinatesRing[i][1] - origin[1];
    const x1 = coordinatesRing[i + 1][0] - origin[0];
    const y1 = coordinatesRing[i + 1][1] - origin[1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  if (Math.abs(area) < 1e-12) {
    return [origin[0], origin[1]];
  }

  return [origin[0] + cx / (3 * area), origin[1] + cy / (3 * area)];
}

/**
 * Returns all room items for a floor formatted for UI selection & search.
 */
export function getFloorRooms(buildingCodeOrName, levelOrId = 2) {
  const floor = getFloorData(buildingCodeOrName, levelOrId);
  if (!floor || !floor.datasets || !floor.datasets.rooms) return [];

  return floor.datasets.rooms.features.map((feat, index) => {
    const props = feat.properties || {};
    const coords = feat.geometry?.coordinates?.[0] || [];
    const center = calculatePolygonCentroid(coords);
    const roomCodeMatch = (props.name || '').match(/A\s*[-]?\s*(\d{3})/i);
    const roomCode = roomCodeMatch ? `A-${roomCodeMatch[1]}` : `A2-${index + 1}`;

    return {
      id: `room-a2-${index}`,
      index,
      room_code: roomCode,
      name: props.name || `Room ${index + 1}`,
      floor: props.floor || 2,
      floor_id: `floor-${props.floor || 2}`,
      building_code: 'BLOCK_A',
      building_name: 'Academic Block A',
      room_type: props.type || 'room',
      category: props.type || 'General',
      coordinates: center,
      geometry: feat.geometry,
      properties: props,
    };
  });
}
