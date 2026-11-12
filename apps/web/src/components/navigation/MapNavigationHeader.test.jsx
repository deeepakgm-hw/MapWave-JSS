// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import {
  MapNavigationHeader,
  BrandIdentity,
  CampusStatusIndicator,
  GlobalMapSearch,
  ViewModeToggle,
  MapStyleSelector,
  GPSStatusPill,
} from './index';

describe('Premium MapNavigationHeader Components', () => {
  it('renders BrandIdentity with MAPWAVE wordmark and JSSATE identifier', () => {
    render(<BrandIdentity selectedBuilding={null} selectedFloor={null} />);
    expect(screen.getByText('MAPWAVE')).toBeInTheDocument();
    expect(screen.getByText(/JSSATE Bengaluru/i)).toBeInTheDocument();
  });

  it('renders breadcrumb when a building and floor are selected', () => {
    const building = { id: 'b1', name: 'Academic Block A', shortName: 'Block A' };
    const floor = { id: 'floor-2', level_number: 2 };
    render(<BrandIdentity selectedBuilding={building} selectedFloor={floor} />);
    expect(screen.getByText('Block A')).toBeInTheDocument();
    expect(screen.getByText(/Floor 2/i)).toBeInTheDocument();
  });

  it('renders CampusStatusIndicator with geofencing state and handles mode click', () => {
    const onToggleMode = vi.fn();
    render(
      <CampusStatusIndicator
        currentMode="CAMPUS_MODE"
        isInsideCampus={true}
        distanceToCampusKm={0}
        onToggleMode={onToggleMode}
      />
    );
    const badge = screen.getByRole('button', { name: /Campus Mode/i });
    expect(badge).toBeInTheDocument();
    fireEvent.click(badge);
    expect(onToggleMode).toHaveBeenCalledTimes(1);
  });

  it('renders GlobalMapSearch with shortcut indicator and opens search on click', () => {
    const onOpenSearch = vi.fn();
    render(<GlobalMapSearch onOpenSearch={onOpenSearch} />);
    const searchBtn = screen.getByRole('button', { name: /Search buildings, rooms, labs and facilities/i });
    expect(searchBtn).toBeInTheDocument();
    fireEvent.click(searchBtn);
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('renders ViewModeToggle with 2D and 3D buttons and toggles active state', () => {
    const onSetViewMode = vi.fn();
    render(<ViewModeToggle isTopView={false} onSetViewMode={onSetViewMode} />);
    const btn2D = screen.getByRole('button', { name: /2D/i });
    const btn3D = screen.getByRole('button', { name: /3D/i });
    expect(btn2D).toBeInTheDocument();
    expect(btn3D).toBeInTheDocument();
    fireEvent.click(btn2D);
    expect(onSetViewMode).toHaveBeenCalledWith('top');
  });

  it('renders MapStyleSelector and toggles dropdown menu', () => {
    const onSwitchProvider = vi.fn();
    render(<MapStyleSelector currentProvider="google" onSwitchProvider={onSwitchProvider} />);
    const selectorBtn = screen.getByRole('button', { name: /Map style selector/i });
    expect(selectorBtn).toBeInTheDocument();
    fireEvent.click(selectorBtn);
    expect(screen.getByText(/Esri World Imagery/i)).toBeInTheDocument();
    expect(screen.getByText(/MapLibre Streets/i)).toBeInTheDocument();
  });

  it('renders GPSStatusPill with real accuracy without fabricated values', () => {
    const gpsLocation = { latitude: 12.902, longitude: 77.505, accuracy: 6.4 };
    render(
      <GPSStatusPill
        isGpsActive={true}
        isGpsLoading={false}
        gpsLocation={gpsLocation}
        onLocateMe={vi.fn()}
      />
    );
    expect(screen.getByText(/GPS Active/i)).toBeInTheDocument();
    expect(screen.getByText(/±6m/i)).toBeInTheDocument();
  });

  it('renders full MapNavigationHeader with all three structured rows', () => {
    const state = {
      selectedBuilding: null,
      selectedFloor: null,
      gpsLocation: null,
    };
    render(
      <MapNavigationHeader
        state={state}
        onOpenSearch={vi.fn()}
        onSetViewMode={vi.fn()}
        onSwitchProvider={vi.fn()}
        onLocateMe={vi.fn()}
      />
    );
    expect(screen.getByText('MAPWAVE')).toBeInTheDocument();
    expect(screen.getByText(/Search buildings, rooms, labs and facilities/i)).toBeInTheDocument();
    expect(screen.getByText('2D')).toBeInTheDocument();
    expect(screen.getByText('3D')).toBeInTheDocument();
  });
});
