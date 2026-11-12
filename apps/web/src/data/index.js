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

// Official coordinates and framing bounds for JSSATE Bangalore (Authoritative 21.4-acre Compound Wall)
export const CAMPUS_CENTER = [77.50544, 12.90145];
export const CAMPUS_BOUNDS = [
  [77.50348, 12.89845], // Southwest coordinates (Boys Hostel & Sports Ground perimeter)
  [77.5074, 12.904455], // Northeast coordinates (Dr. Vishnuvardhan Rd & STEP perimeter)
];
