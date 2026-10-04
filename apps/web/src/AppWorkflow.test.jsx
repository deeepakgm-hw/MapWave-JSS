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
  return {
    Map: MockMap,
    default: {
      Map: MockMap,
    },
  };
});

describe('App End-to-End Workflow Integration', () => {
  it('renders MapWave - JSSATE landing page and allows entering 3D campus', () => {
    render(<App />);

    // Landing Page Elements
    expect(screen.getByText('MAPWAVE')).toBeInTheDocument();
    expect(screen.getByText('JSSATE')).toBeInTheDocument();
    expect(screen.getByText(/Please select your map experience/i)).toBeInTheDocument();

    const exploreBtn = screen.getByRole('button', { name: /EXPLORE/i });
    expect(exploreBtn).toBeInTheDocument();

    // Click Explore to transition to Campus Map View
    fireEvent.click(exploreBtn);

    expect(screen.getAllByText(/Campus Overview/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();
  });

  it('allows opening search modal and jumping directly to ROUTE_PREVIEW', async () => {
    render(<App />);

    // Transition from landing page
    const exploreBtn = screen.getByRole('button', { name: /EXPLORE/i });
    fireEvent.click(exploreBtn);

    const searchBtn = screen.getByRole('button', { name: /Search Rooms/i });
    fireEvent.click(searchBtn);

    const input = screen.getByPlaceholderText(/Search room code/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'C-101' } });
    const navigateBtns = screen.getAllByText(/Navigate →/i);
    expect(navigateBtns.length).toBeGreaterThan(0);

    fireEvent.click(navigateBtns[0]);

    // Should jump to ROUTE_PREVIEW
    expect(screen.getByText(/Start Turn-by-Turn Navigation/i)).toBeInTheDocument();
  });

  it('toggles accessible route switch', () => {
    render(<App />);

    // Transition from landing page
    const exploreBtn = screen.getByRole('button', { name: /EXPLORE/i });
    fireEvent.click(exploreBtn);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('selects a pilot building (Block C) and transitions to BUILDING_FLOORS', () => {
    render(<App />);

    // Transition from landing page
    const exploreBtn = screen.getByRole('button', { name: /EXPLORE/i });
    fireEvent.click(exploreBtn);

    // Click Block C pill button in bottom sheet
    const blockCBtn = screen.getByRole('button', { name: /Block C \(CS & AI\)/i });
    expect(blockCBtn).toBeInTheDocument();
    fireEvent.click(blockCBtn);

    // State machine should transition to BUILDING_FLOORS
    expect(screen.getByText(/SELECT FLOOR/i)).toBeInTheDocument();
    expect(screen.getByText(/Floor 1/i)).toBeInTheDocument();
  });
});
