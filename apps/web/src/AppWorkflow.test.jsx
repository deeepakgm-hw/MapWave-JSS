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
  it('renders top bar breadcrumbs and initial campus overview', () => {
    render(<App />);

    expect(screen.getAllByText(/Campus Overview/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Rooms/i })).toBeInTheDocument();
  });

  it('allows opening search modal and jumping directly to ROUTE_PREVIEW', async () => {
    render(<App />);

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

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  });
});
