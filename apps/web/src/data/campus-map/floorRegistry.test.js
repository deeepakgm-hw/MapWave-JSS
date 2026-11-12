import { describe, it, expect } from 'vitest';
import {
  getBuildingFloorConfig,
  getAvailableFloors,
  getFloorData,
  isFloorMapped,
  getFloorRooms,
  calculatePolygonCentroid,
} from './floorRegistry';

describe('Indoor Floor Registry', () => {
  it('retrieves floor configuration for Academic Block A', () => {
    const config = getBuildingFloorConfig('BLOCK_A');
    expect(config).toBeDefined();
    expect(config.buildingCode).toBe('BLOCK_A');
    expect(config.floors.length).toBe(3);
  });

  it('identifies Floor 2 as available with verified datasets', () => {
    const floor2 = getFloorData('BLOCK_A', 2);
    expect(floor2).toBeDefined();
    expect(floor2.status).toBe('available');
    expect(floor2.datasets).toBeDefined();
    expect(floor2.datasets.rooms.features.length).toBe(50);
    expect(floor2.datasets.doors.features.length).toBe(41);
    expect(floor2.datasets.paths.features.length).toBe(42);
  });

  it('marks Floor 1 and Floor 3 as unmapped without inventing placeholder datasets', () => {
    const floor1 = getFloorData('BLOCK_A', 1);
    const floor3 = getFloorData('BLOCK_A', 3);
    expect(floor1.status).toBe('unmapped');
    expect(floor1.datasets).toBeNull();
    expect(floor3.status).toBe('unmapped');
    expect(floor3.datasets).toBeNull();
  });

  it('lists only available floors for mapping', () => {
    const available = getAvailableFloors('BLOCK_A');
    expect(available.length).toBe(1);
    expect(available[0].level_number).toBe(2);
  });

  it('returns true for isFloorMapped only on verified floors', () => {
    expect(isFloorMapped('BLOCK_A', 2)).toBe(true);
    expect(isFloorMapped('BLOCK_A', 1)).toBe(false);
    expect(isFloorMapped('BLOCK_A', 3)).toBe(false);
    expect(isFloorMapped('UNKNOWN_BUILDING', 1)).toBe(false);
  });

  it('computes valid polygon centroids for all rooms', () => {
    const sampleRing = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ];
    const centroid = calculatePolygonCentroid(sampleRing);
    expect(centroid[0]).toBeCloseTo(5, 1);
    expect(centroid[1]).toBeCloseTo(5, 1);
  });

  it('extracts all 50 rooms with properties from Floor 2', () => {
    const rooms = getFloorRooms('BLOCK_A', 2);
    expect(rooms.length).toBe(50);
    expect(rooms[0]).toHaveProperty('room_code');
    expect(rooms[0]).toHaveProperty('name');
    expect(rooms[0]).toHaveProperty('coordinates');
    expect(rooms[0].coordinates[0]).toBeGreaterThan(77.5);
    expect(rooms[0].coordinates[1]).toBeGreaterThan(12.8);
  });
});
