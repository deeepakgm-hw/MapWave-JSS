import React from 'react';
import { BrandIdentity } from './BrandIdentity';
import { CampusStatusIndicator } from './CampusStatusIndicator';
import { GlobalMapSearch } from './GlobalMapSearch';
import { MapQuickActions } from './MapQuickActions';
import { GPSStatusPill } from './GPSStatusPill';

export function MapNavigationHeader({
  state,
  onBack,
  onOpenSearch,
  onOpenLanding,
  bearing = 0,
  onResetNorth,
  isTopView = false,
  onSetViewMode,
  currentProvider,
  onSwitchProvider,
  isGpsActive = false,
  isGpsLoading = false,
  onToggleGps,
  onLocateMe,
  currentMode = 'CAMPUS_MODE',
  isInsideCampus = true,
  distanceToCampusKm = 0,
  onToggleMode,
}) {
  const { selectedBuilding, selectedFloor, gpsLocation } = state || {};

  return (
    <div className="absolute top-4 inset-x-4 z-30 flex flex-col items-start gap-2.5 pointer-events-none select-none max-w-2xl">
      {/* 1. Unified Premium Navigation Shell */}
      <nav
        aria-label="MapWave Top Navigation"
        className="w-full pointer-events-auto p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.45)] text-slate-100 flex flex-col gap-2.5 transition-all"
      >
        {/* ROW 1: BRAND IDENTITY & CAMPUS GEOFENCE STATUS */}
        <div className="flex items-center justify-between gap-2">
          <BrandIdentity
            selectedBuilding={selectedBuilding}
            selectedFloor={selectedFloor}
            onResetToCampus={() => onBack?.('OVERVIEW')}
            onOpenLanding={onOpenLanding}
          />

          <CampusStatusIndicator
            currentMode={currentMode}
            isInsideCampus={isInsideCampus}
            distanceToCampusKm={distanceToCampusKm}
            isGpsActive={isGpsActive}
            isGpsLoading={isGpsLoading}
            onToggleMode={onToggleMode}
          />
        </div>

        {/* ROW 2: GLOBAL SEARCH */}
        <GlobalMapSearch onOpenSearch={onOpenSearch} />

        {/* ROW 3: MAP VIEW CONTROLS & ACTIONS */}
        <MapQuickActions
          isTopView={isTopView}
          onSetViewMode={onSetViewMode}
          currentProvider={currentProvider}
          onSwitchProvider={onSwitchProvider}
          bearing={bearing}
          onResetNorth={onResetNorth}
          onLocateMe={onLocateMe}
          isGpsActive={isGpsActive}
          isGpsLoading={isGpsLoading}
          onToggleGps={onToggleGps}
          onOpenLanding={onOpenLanding}
        />
      </nav>

      {/* 2. Floating Compact GPS Telemetry Pill */}
      <div className="pointer-events-auto pl-1">
        <GPSStatusPill
          isGpsActive={isGpsActive}
          isGpsLoading={isGpsLoading}
          gpsLocation={gpsLocation}
          onLocateMe={onLocateMe}
          onToggleGps={onToggleGps}
        />
      </div>
    </div>
  );
}

// Backwards compatibility alias for TopBar
export const TopBar = MapNavigationHeader;
