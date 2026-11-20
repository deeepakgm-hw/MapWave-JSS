// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// Mock MapLibre GL JS since WebGL canvas is not available in JSDOM
vi.mock('maplibre-gl', () => {
  function MockMap() {
    return {
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
      getSource: vi.fn(),
      getLayer: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      flyTo: vi.fn(),
      getZoom: vi.fn(() => 16),
      isStyleLoaded: vi.fn(() => true),
      getCanvas: vi.fn(() => ({ style: {} })),
    };
  }
  function MockMarker() {
    return {
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    };
  }
  return {
    Map: MockMap,
    Marker: MockMarker,
    setWorkerUrl: vi.fn(),
    getWorkerUrl: vi.fn(),
    default: {
      Map: MockMap,
      Marker: MockMarker,
      setWorkerUrl: vi.fn(),
      getWorkerUrl: vi.fn(),
    },
  };
});

describe('App End-to-End Workflow Integration', () => {
  it('renders MapWave landing page and navigates through login, ID scanner, and into campus portal', async () => {
    render(<App />);

    // Landing Page Elements
    expect(screen.getByText('MAPWAVE')).toBeInTheDocument();
    expect(screen.getByText('JSSATE')).toBeInTheDocument();
    expect(screen.getByText(/Please select your map experience/i)).toBeInTheDocument();

    const exploreBtn = screen.getByRole('button', { name: /EXPLORE/i });
    expect(exploreBtn).toBeInTheDocument();

    // 1. Click Explore to transition to Login Page
    fireEvent.click(exploreBtn);

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();

    // 2. Submit Login to transition to ID Card Scanner
    const loginBtn = screen.getByRole('button', { name: /^Login$/i });
    fireEvent.click(loginBtn);

    expect(await screen.findByText('Scan Your Campus ID Card', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Sample ID/i })).toBeInTheDocument();

    // 3. Trigger Sample ID Card scan
    const scanBtn = screen.getByRole('button', { name: /Scan Sample ID/i });
    fireEvent.click(scanBtn);

    const confirmBtn = await screen.findByRole(
      'button',
      { name: /Confirm & Enter MapWave Portal/i },
      { timeout: 5000 }
    );
    expect(confirmBtn).toBeInTheDocument();
    expect(screen.getAllByText('DEEPAK G M')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1JS24IS188')[0]).toBeInTheDocument();

    // 4. Confirm and Enter Portal
    fireEvent.click(confirmBtn);

    expect(screen.getAllByText(/Campus Overview/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();
  });

  it('allows opening search modal and jumping directly to ROUTE_PREVIEW', async () => {
    render(<App initialAuthStep="PORTAL" />);

    const searchBtn = screen.getByRole('button', { name: /Search Rooms/i });
    fireEvent.click(searchBtn);

    const input = screen.getByPlaceholderText(/Search room code/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'C-101' } });
    const navigateBtns = screen.getAllByText(/Navigate →/i);
    expect(navigateBtns.length).toBeGreaterThan(0);

    fireEvent.click(navigateBtns[0]);

    // Should jump to ROUTE_PREVIEW
    expect(screen.getAllByText(/Start Turn-by-Turn Navigation/i)[0]).toBeInTheDocument();
  });

  it('toggles accessible route switch', () => {
    render(<App initialAuthStep="PORTAL" />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('selects a pilot building (Block A) and transitions to BUILDING_FLOORS', () => {
    render(<App initialAuthStep="PORTAL" />);

    // Click Block A pill button in bottom sheet
    const blockBtn = screen.getByRole('button', { name: /Block A/i });
    expect(blockBtn).toBeInTheDocument();
    fireEvent.click(blockBtn);

    // State machine should transition to BUILDING_FLOORS
    expect(screen.getByText(/SELECT FLOOR/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Floor 1/i)[0]).toBeInTheDocument();
  });

  it('supports automatic and manual geofence switching between CAMPUS_MODE and EXPLORE_MODE', () => {
    render(<App initialAuthStep="PORTAL" />);

    // Initial state: Campus Mode is active with 3D Pilot Zones and Search Rooms
    expect(screen.getAllByText(/Campus Mode/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Block A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();

    // Toggle mode to EXPLORE_MODE (as would happen when student moves outside boundary)
    const modeBadge = screen.getAllByRole('button', { name: /Campus Mode/i })[0];
    fireEvent.click(modeBadge);

    // Now in EXPLORE_MODE: indoor controls are hidden, outdoor overview is active
    expect(screen.getAllByText(/Explore Mode/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Explore Mode Active/i)[0]).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Block A/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Search Rooms/i })).not.toBeInTheDocument();

    // Prominent "Enter Campus 3D Mode" button is available
    const enterCampusBtn = screen.getByRole('button', { name: /Enter Campus 3D Mode/i });
    expect(enterCampusBtn).toBeInTheDocument();

    // Clicking Enter Campus 3D Mode switches back to CAMPUS_MODE
    fireEvent.click(enterCampusBtn);
    expect(screen.getAllByText(/Campus Mode/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Block A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();
  });
});
