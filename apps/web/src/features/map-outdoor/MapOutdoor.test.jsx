// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import MapOutdoor from './MapOutdoor';
import * as apiClientModule from '../../lib/apiClient';

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
    this.setPaintProperty = vi.fn();
    this.getZoom = vi.fn().mockReturnValue(16);
    this.isStyleLoaded = vi.fn().mockReturnValue(true);
    this.getCanvas = vi.fn().mockReturnValue({ style: {} });
    this.flyTo = vi.fn();
    this.remove = vi.fn();
  }

  return {
    Map: MockMap,
    default: {
      Map: MockMap,
    },
  };
});

describe('MapOutdoor Component', () => {
  let apiClientSpy;

  beforeEach(() => {
    apiClientSpy = vi.spyOn(apiClientModule, 'apiClient').mockImplementation(async (url) => {
      if (url.includes('/api/v1/buildings/nearest')) {
        return {
          building_id: 'b1',
          building_name: 'Main Academic Block',
          confidence: 'inside',
          distance_m: 0.0,
        };
      }
      return { type: 'FeatureCollection', features: [] };
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders without crashing when geolocation permission is denied', async () => {
    // Mock navigator.geolocation error (permission denied)
    const mockWatchPosition = vi.fn((success, error) => {
      error({ code: 1, message: 'User denied Geolocation' });
      return 123;
    });

    vi.stubGlobal('navigator', {
      geolocation: {
        watchPosition: mockWatchPosition,
        clearWatch: vi.fn(),
      },
    });

    render(<MapOutdoor />);

    // Verify banner shows location unavailable
    await waitFor(() => {
      expect(screen.getByText(/GPS Location Unavailable/i)).toBeInTheDocument();
    });
  });

  it('skips nearest-building API fetch when geolocation is denied or unavailable', async () => {
    const mockWatchPosition = vi.fn((success, error) => {
      error({ code: 1, message: 'User denied Geolocation' });
      return 123;
    });

    vi.stubGlobal('navigator', {
      geolocation: {
        watchPosition: mockWatchPosition,
        clearWatch: vi.fn(),
      },
    });

    render(<MapOutdoor />);

    await waitFor(() => {
      expect(screen.getAllByText(/GPS Location Unavailable/i).length).toBeGreaterThan(0);
    });

    // Verify /api/v1/buildings/nearest call was NOT triggered
    const nearestCalls = apiClientSpy.mock.calls.filter(([url]) =>
      url.includes('/api/v1/buildings/nearest')
    );
    expect(nearestCalls.length).toBe(0);
  });
});
