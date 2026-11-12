// Indoor Navigation Graph Service
// Generates a topological corridor network from QGIS paths & doors GeoJSON,
// resolves room-door relationships, and computes shortest indoor paths using A*.

import { getFloorData, calculatePolygonCentroid } from '../data/campus-map/floorRegistry';

const EARTH_RADIUS_METERS = 6371000;
const WALKING_SPEED_MPS = 1.2; // ~4.3 km/h average indoor pace
const SNAPPING_TOLERANCE_METERS = 0.25;

/**
 * Computes great-circle distance between two [lng, lat] points in meters.
 */
export function distanceMeters(coordA, coordB) {
  if (!coordA || !coordB) return 0;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(coordB[1] - coordA[1]);
  const dLng = toRad(coordB[0] - coordA[0]);
  const lat1 = toRad(coordA[1]);
  const lat2 = toRad(coordB[1]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/**
 * Checks if a point [lng, lat] is inside a polygon ring.
 */
export function isPointInPolygon(point, ring) {
  if (!point || !ring || ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculates distance from point to polygon boundary.
 */
export function distanceToPolygon(point, ring) {
  if (!point || !ring || ring.length === 0) return Infinity;
  let min = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i];
    const b = ring[i + 1];
    for (let t = 0; t <= 1; t += 0.1) {
      const p = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      const d = distanceMeters(point, p);
      if (d < min) min = d;
    }
  }
  return min;
}

// In-memory graph cache keyed by `${buildingCode}_floor_${level}`
const graphCache = new Map();

/**
 * Builds or retrieves the topological corridor navigation graph for a given floor.
 */
export function getIndoorGraph(buildingCode = 'BLOCK_A', floorLevel = 2) {
  const cacheKey = `${buildingCode}_floor_${floorLevel}`;
  if (graphCache.has(cacheKey)) {
    return graphCache.get(cacheKey);
  }

  const floorData = getFloorData(buildingCode, floorLevel);
  if (!floorData || !floorData.datasets) {
    return null;
  }

  const { paths, doors, rooms } = floorData.datasets;
  const nodes = [];

  function getOrCreateNode(coord) {
    for (let i = 0; i < nodes.length; i++) {
      if (distanceMeters(nodes[i].coord, coord) < SNAPPING_TOLERANCE_METERS) {
        return i;
      }
    }
    const id = nodes.length;
    nodes.push({ id, coord: [coord[0], coord[1]], edges: [] });
    return id;
  }

  // 1. Process LineStrings into Graph Edges
  if (paths?.features) {
    paths.features.forEach((feat) => {
      const coords = feat.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      if (feat.geometry.type === 'LineString') {
        for (let i = 0; i < coords.length - 1; i++) {
          const u = getOrCreateNode(coords[i]);
          const v = getOrCreateNode(coords[i + 1]);
          if (u !== v) {
            const w = distanceMeters(nodes[u].coord, nodes[v].coord);
            nodes[u].edges.push({ to: v, weight: w });
            nodes[v].edges.push({ to: u, weight: w });
          }
        }
      }
    });
  }

  // 2. Map Doors to nearest graph nodes
  const doorRegistry = [];
  if (doors?.features) {
    doors.features.forEach((doorFeat, idx) => {
      const c = doorFeat.geometry?.coordinates;
      if (!c) return;
      let bestNode = null;
      let bestDist = Infinity;

      nodes.forEach((n) => {
        const d = distanceMeters(n.coord, c);
        if (d < bestDist) {
          bestDist = d;
          bestNode = n.id;
        }
      });

      doorRegistry.push({
        id: `door-${idx}`,
        fid: doorFeat.properties?.fid,
        name: doorFeat.properties?.name || `Door ${idx + 1}`,
        type: doorFeat.properties?.type,
        floor: doorFeat.properties?.floor || floorLevel,
        coord: c,
        nodeId: bestNode,
        distanceToGraphM: bestDist,
        properties: doorFeat.properties,
      });
    });
  }

  // 3. Associate Rooms with their corresponding Door
  const roomRegistry = [];
  if (rooms?.features) {
    rooms.features.forEach((roomFeat, idx) => {
      const ring = roomFeat.geometry?.coordinates?.[0] || [];
      const center = calculatePolygonCentroid(ring);
      const roomName = (roomFeat.properties?.name || '').toLowerCase();

      // Find closest door by name match or boundary distance
      let bestDoor = null;
      let minDoorDist = Infinity;

      doorRegistry.forEach((door) => {
        const doorName = door.name.toLowerCase();
        const dist = distanceToPolygon(door.coord, ring);

        // Strong name match bonus
        const isNameMatch =
          roomName.length > 2 &&
          doorName.length > 2 &&
          (roomName.includes(doorName) || doorName.includes(roomName));

        const effectiveDist = isNameMatch ? dist * 0.2 : dist;

        if (effectiveDist < minDoorDist) {
          minDoorDist = effectiveDist;
          bestDoor = door;
        }
      });

      roomRegistry.push({
        id: `room-${idx}`,
        index: idx,
        name: roomFeat.properties?.name || `Room ${idx + 1}`,
        floor: roomFeat.properties?.floor || floorLevel,
        type: roomFeat.properties?.type || 'room',
        center,
        door: bestDoor,
        geometry: roomFeat.geometry,
        properties: roomFeat.properties,
      });
    });
  }

  const graph = {
    buildingCode,
    floorLevel,
    nodes,
    doorRegistry,
    roomRegistry,
  };

  graphCache.set(cacheKey, graph);
  return graph;
}

/**
 * Solves A* path between two node IDs in the corridor graph.
 */
function solveAStar(nodes, startNodeId, targetNodeId) {
  if (startNodeId === targetNodeId) {
    return { path: [startNodeId], cost: 0 };
  }

  const h = (id) => distanceMeters(nodes[id].coord, nodes[targetNodeId].coord);
  const open = new Set([startNodeId]);
  const prev = {};
  const g = { [startNodeId]: 0 };
  const f = { [startNodeId]: h(startNodeId) };

  while (open.size > 0) {
    let curr = null;
    let minF = Infinity;
    for (const id of open) {
      if (f[id] < minF) {
        minF = f[id];
        curr = id;
      }
    }

    if (curr === targetNodeId) {
      const pathNodes = [curr];
      while (prev[pathNodes[0]] !== undefined) {
        pathNodes.unshift(prev[pathNodes[0]]);
      }
      return { path: pathNodes, cost: g[targetNodeId] };
    }

    open.delete(curr);

    for (const edge of nodes[curr].edges) {
      const tentativeG = g[curr] + edge.weight;
      if (tentativeG < (g[edge.to] ?? Infinity)) {
        prev[edge.to] = curr;
        g[edge.to] = tentativeG;
        f[edge.to] = tentativeG + h(edge.to);
        open.add(edge.to);
      }
    }
  }

  return null;
}

/**
 * Calculates a verified indoor walking route from start to destination on a given floor.
 *
 * @param {string} buildingCode e.g. 'BLOCK_A'
 * @param {number} floorLevel e.g. 2
 * @param {Object|Array} startOrigin Room, Door, or [lng, lat] coordinate
 * @param {Object} destinationTarget Destination Room or Door
 * @returns {Object|null} Verified indoor route summary with GeoJSON line geometry
 */
export function findIndoorRoute(
  buildingCode = 'BLOCK_A',
  floorLevel = 2,
  startOrigin,
  destinationTarget
) {
  const graph = getIndoorGraph(buildingCode, floorLevel);
  if (!graph || graph.nodes.length === 0) return null;

  // Resolve target door and graph node
  let targetDoor = null;
  if (destinationTarget?.door) {
    targetDoor = destinationTarget.door;
  } else if (destinationTarget?.nodeId !== undefined) {
    targetDoor = destinationTarget;
  } else if (destinationTarget?.name) {
    const targetName = destinationTarget.name.toLowerCase();
    targetDoor =
      graph.doorRegistry.find((d) => d.name.toLowerCase() === targetName) ||
      graph.roomRegistry.find((r) => r.name.toLowerCase() === targetName)?.door ||
      graph.doorRegistry[0];
  } else {
    targetDoor = graph.doorRegistry[0];
  }

  if (!targetDoor || targetDoor.nodeId === null) return null;

  // Resolve start door or nearest node
  let startNodeId = null;
  let startCoord = null;

  if (Array.isArray(startOrigin)) {
    // GPS / coordinates
    startCoord = startOrigin;
    let minDist = Infinity;
    graph.nodes.forEach((n) => {
      const d = distanceMeters(n.coord, startCoord);
      if (d < minDist) {
        minDist = d;
        startNodeId = n.id;
      }
    });
  } else if (startOrigin?.door?.nodeId !== undefined) {
    startNodeId = startOrigin.door.nodeId;
    startCoord = startOrigin.door.coord;
  } else if (startOrigin?.nodeId !== undefined) {
    startNodeId = startOrigin.nodeId;
    startCoord = startOrigin.coord;
  } else {
    // Default starting anchor: Main Staircase 1 Down or First Entrance Door
    const defaultEntrance =
      graph.doorRegistry.find((d) => d.name.includes('STAIRCASE 1')) ||
      graph.doorRegistry[0];
    startNodeId = defaultEntrance.nodeId;
    startCoord = defaultEntrance.coord;
  }

  if (startNodeId === null) return null;

  const result = solveAStar(graph.nodes, startNodeId, targetDoor.nodeId);
  if (!result) return null;

  const coordinates = result.path.map((nodeId) => graph.nodes[nodeId].coord);

  // If the target door point differs slightly from the node, terminate at the door point
  if (targetDoor.coord && distanceMeters(coordinates[coordinates.length - 1], targetDoor.coord) > 0.05) {
    coordinates.push(targetDoor.coord);
  }

  const totalDistanceM = Math.round(result.cost * 10) / 10;
  const estimatedSeconds = Math.round(totalDistanceM / WALKING_SPEED_MPS);
  const estimatedMinutes = Math.max(1, Math.round(estimatedSeconds / 60));

  const routeGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {
      distanceMeters: totalDistanceM,
      estimatedMinutes,
      destinationName: destinationTarget?.name || targetDoor.name,
      destinationDoor: targetDoor.name,
      floorLevel,
      buildingCode,
    },
  };

  return {
    success: true,
    total_distance_m: totalDistanceM,
    estimatedMinutes,
    estimatedSeconds,
    coordinates,
    geojson: routeGeoJSON,
    startNodeId,
    targetNodeId: targetDoor.nodeId,
    destinationDoor: targetDoor,
    startCoord,
    targetCoord: targetDoor.coord,
  };
}
