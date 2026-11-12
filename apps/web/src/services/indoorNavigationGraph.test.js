import { describe, it, expect } from 'vitest';
import {
  distanceMeters,
  getIndoorGraph,
  findIndoorRoute,
} from './indoorNavigationGraph';

describe('Indoor Navigation Graph Service', () => {
  it('calculates accurate distance between coordinates', () => {
    // 1 degree latitude is approx 111km
    const d = distanceMeters([77.5, 12.9], [77.5, 12.901]);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });

  it('builds a connected topological corridor graph from Floor 2 paths', () => {
    const graph = getIndoorGraph('BLOCK_A', 2);
    expect(graph).toBeDefined();
    expect(graph.nodes.length).toBeGreaterThan(50);
    expect(graph.doorRegistry.length).toBe(41);
    expect(graph.roomRegistry.length).toBe(50);
  });

  it('connects all doors within snapping tolerance to graph nodes', () => {
    const graph = getIndoorGraph('BLOCK_A', 2);
    graph.doorRegistry.forEach((door) => {
      expect(door.nodeId).not.toBeNull();
      expect(door.distanceToGraphM).toBeLessThan(0.25);
    });
  });

  it('associates rooms with valid entrance doors', () => {
    const graph = getIndoorGraph('BLOCK_A', 2);
    const labRoom = graph.roomRegistry.find((r) => r.name.includes('A221'));
    expect(labRoom).toBeDefined();
    expect(labRoom.door).toBeDefined();
    expect(labRoom.door.name).toContain('A221');
  });

  it('computes shortest walkable corridor route between two rooms', () => {
    const graph = getIndoorGraph('BLOCK_A', 2);
    const startRoom = graph.roomRegistry.find((r) => r.name.includes('A221'));
    const targetRoom = graph.roomRegistry.find((r) => r.name.includes('A202'));

    const route = findIndoorRoute('BLOCK_A', 2, startRoom, targetRoom);
    expect(route).toBeDefined();
    expect(route.success).toBe(true);
    expect(route.total_distance_m).toBeGreaterThan(30);
    expect(route.total_distance_m).toBeLessThan(100);
    expect(route.coordinates.length).toBeGreaterThan(5);
    expect(route.geojson.geometry.type).toBe('LineString');
    expect(route.destinationDoor.name).toBe(targetRoom.door.name);
  });

  it('returns null if floor dataset is unavailable', () => {
    const route = findIndoorRoute('BLOCK_A', 1, null, { name: 'Nonexistent' });
    expect(route).toBeNull();
  });
});
