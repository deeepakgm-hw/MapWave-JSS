// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CampusMap } from './CampusMap';

// Mock maplibre-gl
vi.mock('maplibre-gl', () => {
  function MockMap() {
    this.on = vi.fn((event, layer, callback) => {
      if (typeof layer === 'function') {
        setTimeout(layer, 0);
      }
    });
    this.off = vi.fn();
    this.getSource = vi.fn();
    this.addSource = vi.fn();
    this.addLayer = vi.fn();
    this.getLayer = vi.fn();
    this.setLayoutProperty = vi.fn();
    this.setPaintProperty = vi.fn();
    this.setFilter = vi.fn();
    this.setStyle = vi.fn();
    this.getZoom = vi.fn().mockReturnValue(16.8);
    this.getBearing = vi.fn().mockReturnValue(0);
    this.isStyleLoaded = vi.fn().mockReturnValue(true);
    this.getCanvas = vi.fn().mockReturnValue({ style: {} });
    this.flyTo = vi.fn();
    this.easeTo = vi.fn();
    this.zoomIn = vi.fn();
    this.zoomOut = vi.fn();
    this.remove = vi.fn();
    this.addControl = vi.fn();
  }

  function MockMarker() {
    this.setLngLat = vi.fn().mockReturnValue(this);
    this.addTo = vi.fn().mockReturnValue(this);
    this.remove = vi.fn();
  }

  function MockScaleControl() {}

  return {
    Map: MockMap,
    Marker: MockMarker,
    ScaleControl: MockScaleControl,
    default: {
      Map: MockMap,
      Marker: MockMarker,
      ScaleControl: MockScaleControl,
    },
  };
});

describe('CampusMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders polished MapSetupScreen when configuration is missing', () => {
    // Render without credentials or coordinates
    render(
      <CampusMap
        configOverrides={{
          apiKey: '',
          lat: null,
          lng: null,
        }}
      />
    );

    expect(screen.getByText(/Map Foundation Setup Required/i)).toBeInTheDocument();
    expect(screen.getAllByText(/VITE_MAPTILER_KEY/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VITE_CAMPUS_LAT/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VITE_CAMPUS_LNG/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Explore Development Preview/i })).toBeInTheDocument();
  });

  it('allows activating development preview fallback mode from setup screen', async () => {
    render(
      <CampusMap
        configOverrides={{
          apiKey: '',
          lat: null,
          lng: null,
        }}
      />
    );

    const previewBtn = screen.getByRole('button', { name: /Explore Development Preview/i });
    fireEvent.click(previewBtn);

    // After activating preview, map controls and search bar should render
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search buildings & campus/i)).toBeInTheDocument();
    });
  });

  it('initializes map directly when valid configuration is provided', async () => {
    render(
      <CampusMap
        configOverrides={{
          apiKey: 'test-maptiler-key',
          lat: 12.9015,
          lng: 77.5057,
        }}
      />
    );

    // Directly shows map search and controls rather than setup screen
    expect(screen.getByPlaceholderText(/Search buildings & campus/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Reset Bearing/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Locate My Position/i)).toBeInTheDocument();
  });

  it('displays building contextual information panel when building is selected', () => {
    const mockBuilding = {
      id: 'b1',
      building_id: 'b1',
      name: 'Block C (CS & AI)',
      category: 'Academic',
      verified: true,
      height_m: 22.0,
      floor_count: 3,
      indoor_mapping_status: 'verified',
      description: 'Department of Computer Science & Engineering',
    };

    render(
      <CampusMap
        configOverrides={{
          apiKey: 'test-key',
          lat: 12.9015,
          lng: 77.5057,
        }}
        selectedBuilding={mockBuilding}
      />
    );

    expect(screen.getByText('Block C (CS & AI)')).toBeInTheDocument();
    expect(screen.getByText(/22m/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Footprint/i)).toBeInTheDocument();
  });

  it('allows searching and displays matching campus features', () => {
    render(
      <CampusMap
        configOverrides={{
          apiKey: 'test-key',
          lat: 12.9015,
          lng: 77.5057,
        }}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search buildings & campus/i);
    fireEvent.change(searchInput, { target: { value: 'Block C' } });

    expect(screen.getByText(/Block C \(CS & AI\)/i)).toBeInTheDocument();
  });
});
