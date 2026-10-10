/**
 * MapWave — CampusMap TypeScript Type Definitions & Component Re-export
 */
import React from 'react';
import { CampusMap as CampusMapComponent } from './CampusMap.jsx';

export interface BuildingFeature {
  id: string;
  building_id?: string;
  name: string;
  code?: string;
  category?: string;
  status?: string;
  verified?: boolean;
  verification?: string;
  height_m?: number;
  base_height_m?: number;
  floor_count?: number;
  indoor_mapping_status?: 'not_started' | 'in_progress' | 'verified' | 'available';
  description?: string;
  departments?: string[];
  facilities?: string[];
  operating_hours?: string;
  accessibility?: string;
  center?: [number, number];
}

export interface CampusMapProps {
  configOverrides?: {
    apiKey?: string;
    lat?: number;
    lng?: number;
    styleUrl?: string;
    zoom?: number;
    pitch?: number;
    bearing?: number;
  };
  selectedBuilding?: BuildingFeature | null;
  onSelectBuilding?: (building: BuildingFeature) => void;
  onUpdateLocation?: (loc: { latitude: number; longitude: number; accuracy: number }) => void;
  onBearingChange?: (bearing: number) => void;
  mapRefOut?: React.MutableRefObject<any>;
  className?: string;
}

export const CampusMap: React.FC<CampusMapProps> = (props) => {
  return <CampusMapComponent {...props} />;
};

export default CampusMap;
