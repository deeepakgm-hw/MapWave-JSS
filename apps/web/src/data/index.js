import campusBoundary from './campus-boundary.json';
import campusBoundaryGeojson from './geo/campusBoundary.json';
import campusBuildings from './campus-buildings.json';
import campusPaths from './campus-paths.json';
import campusFacilities from './campus-facilities.json';
import buildingMetadata from './building-metadata.json';

export {
  campusBoundary,
  campusBoundaryGeojson,
  campusBuildings,
  campusPaths,
  campusFacilities,
  buildingMetadata,
};

// Official coordinates and framing bounds for JSSATE Bangalore from authoritative KML
export const CAMPUS_CENTER = [77.50546, 12.90247];
export const CAMPUS_BOUNDS = [
  [77.503649, 12.900519], // Southwest coordinates
  [77.507271, 12.904427], // Northeast coordinates
];
