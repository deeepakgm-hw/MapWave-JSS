import campusBoundary from './campus-boundary.json';
import campusBuildings from './campus-buildings.json';
import campusPaths from './campus-paths.json';
import campusFacilities from './campus-facilities.json';
import buildingMetadata from './building-metadata.json';

export {
  campusBoundary,
  campusBuildings,
  campusPaths,
  campusFacilities,
  buildingMetadata,
};

// Official coordinates and framing bounds for JSSATE Bangalore
export const CAMPUS_CENTER = [77.50544, 12.90147];
export const CAMPUS_BOUNDS = [
  [77.503526, 12.898494], // Southwest coordinates
  [77.507359, 12.904455], // Northeast coordinates
];
