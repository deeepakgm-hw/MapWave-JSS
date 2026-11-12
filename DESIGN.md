# MapWave — Design System & Presentation Layer Architecture

## Overview
**MapWave** is an Apple-Maps/Linear-grade glassmorphic geospatial portal for JSS Academy of Technical Education (JSSATE), Bengaluru. It seamlessly bridges high-altitude outdoor satellite reconnaissance with precision indoor floor-plan navigation.

---

## 1. Design Tokens & Visual Language

### Spacing & Grid Hierarchy
- **Base Unit:** 4px
- **Grid Step:** 8px strictly enforced across all margins, paddings, and component heights.
- **Screen-Edge Inset:** 16px on viewport widths `< 1280px`; 24px on desktop `≥ 1280px`.
- **Radii Tokens:**
  - `12px` (`var(--radius-control)`): Control buttons, dropdown triggers, search pills.
  - `16px` (`var(--radius-card)`): Cards, command stack rows, route stats container.
  - `24px` (`var(--radius-panel)`): Floating Detail Panel and bottom sheets.
  - `9999px` (`var(--radius-pill)`): Telemetry chips, vertical control docks, badges.

### Typography
- **UI Typography:** `Geist`, `Inter`, `-apple-system`, `sans-serif`.
- **Telemetry & Coordinates:** `Geist Mono`, `ui-monospace`. Scale: 11px / 12px / 14px / 16px / 20px / 28px. Minimum font size is 11px for secondary labels, 12px for standard telemetry.
- **Font Weights:** Strictly 500 (Medium) and 600/700 (Semi-bold/Bold).

### Color & Contrast Philosophy
- **Neutral Base:** Pure satellite canvas layered with dark obsidian (`#0e111a`) and warm translucency.
- **Primary Accent:** Electric Blue (`#3B82F6` / `#2563EB`) for focus states, selected modes, and primary CTAs.
- **Route Accent:** Warm Amber (`#F59E0B`) with subtle drop shadow for indoor corridors and active waypoints.
- **Campus Perimeter:** Official Authoritative Cyan (`#06B6D4` / `#22D3EE`), 2px stroke with 6px soft blur halo.
- **Semantic Badges:**
  - Success / Inside Geofence: Emerald (`#10B981`)
  - Warning / Outdoor Hysteresis: Amber (`#F59E0B`)
  - Error: Rose (`#EF4444`)

---

## 2. Glassmorphism Architecture (`GlassSurface`)

### Dark Theme Glass (Default)
```css
background: rgba(14, 17, 26, 0.55);
backdrop-filter: blur(24px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
```

### Light Theme Glass
```css
background: rgba(255, 255, 255, 0.62);
backdrop-filter: blur(24px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.70);
box-shadow: 0 12px 40px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.90);
```

### Strict GPU Performance Constraint
- **No Nested Backdrop Blur:** Children of glass surfaces strictly use solid tinted fills (`rgba(255, 255, 255, 0.08)` dark, `rgba(0, 0, 0, 0.05)` light) with 1px border.
- **Max Blurred Surfaces:** No more than 3 blurred surfaces active simultaneously (Command Stack, Detail Panel, Control Dock).
- **Satellite Vignettes:** Top and bottom CSS gradient scrims (`map-scrim-top` and `map-scrim-bottom`) ensure WCAG AA legibility over complex satellite tiles.
- **Fallbacks:** `@supports not (backdrop-filter)` and `@media (prefers-reduced-transparency)` automatically fall back to opaque surfaces.

---

## 3. Desktop Layout Mechanics (≥ 1024px)

```
+-----------------------------------------------------------------------------------------------+
| [Map Scrim Top Gradient]                                                                      |
|                                                                                               |
|  +-- COMMAND STACK (420w) --+                                        +-- DETAIL PANEL (400w) -+
|  | [Brand | Campus Chip] 56h|                                        | [Header: Title, Avatar]|
|  | [Search Bar (/)]      48h|                                        |                        |
|  | [2D|3D|Style|Locate]  40h|                                        | [Scrollable Body]      |
|  +--------------------------+                                        |  - 3D Preview (WebGL)  |
|  | [Selected Building Card] |                                        |  - Floor Levels        |
|  +--------------------------+                                        |  - Category Filter     |
|                                                                      |  - RouteCard Track     |
|                                                                      |                        |
|                                                                      | [Sticky CTA: 52h]      |
|                                                                      +------------------------+
|                                                                                               |
|                                                                      +- MAP CONTROLS (Pill) -+
|                                                                      |  [ + ] Zoom In         |
|  +- FLOOR SWITCHER -+                                                |  [ - ] Zoom Out        |
|  | [F3]             |                                                |  [ ^ ] Compass Reset   |
|  | [F2] *active     |                                                |  [ o ] Locate Position |
|  | [F1]             |                                                +------------------------+
|  +------------------+                                                 (Offset: panelW + 32px)
|  [Scale | Lat, Long]                                                                          |
|                                                                                               |
| [Map Scrim Bottom Gradient]                                                                   |
+-----------------------------------------------------------------------------------------------+
```

1. **Top-Left Command Stack:**
   - Single flex column (`w-[420px]`, `gap-3`).
   - Row A (56px): Brand identity, breadcrumb, and interactive Campus Mode geofence chip.
   - Row B (48px): Global search input with keyboard shortcut `/`.
   - Row C (40px): 2D/3D segmented switch, basemap dropdown, locate button, compass, and overflow menu (theme toggle & 8px grid audit).
   - Row D: Selected-Building card that flows dynamically below Row C in the same column flow.

2. **Right Floating Detail Panel:**
   - Floating 400px glass panel, 16px inset (`24px` on `xl`), radius 24px (`rounded-3xl`), `h-[calc(100vh-32px)]`.
   - Left-edge sinuous tab notch artifact was completely eliminated.
   - Smooth slide-and-fade animation (`240ms cubic-bezier(0.2, 0.8, 0.2, 1)`).
   - Pressing `Esc` collapses the panel; a floating "Details" pill re-opens it.

3. **Bottom-Right Map Controls:**
   - Vertical glass pill with 44px touch targets (Zoom In, Zoom Out, Compass, Locate Me).
   - **Dynamic Offset Animation:** Right position animates to `panelWidth + 32px` (`432px`) when Detail Panel is open, and returns to `16px` (`24px` on xl) when the panel is closed, preventing control occlusion.

4. **Bottom-Left Floor Switcher & Telemetry:**
   - Vertical glass pill with sliding active indicator for F3, F2, F1.
   - Telemetry strip: Scale bar in meters + live geographic coordinates in Geist Mono 11px.

---

## 4. Map Intelligence & Label Decluttering (`LabelLayer`)

- **Screen-Space Collision Detection:** Computes screen projections of centroids and evaluates bounding box overlaps with 4px margins.
- **Priority Tiers:**
  - Tier 3: Building Footprints
  - Tier 2: Labs and Core Academic Facilities
  - Tier 1: Classrooms & General Rooms (rendered only at `zoom ≥ 19`)
  - Tier 0: Corridors & Utility Nodes
- **Haloed Glass Pills:** All markers use `.indoor-room-label` with glass styling and dark halo pills for contrast against satellite rasters.
- **Indoor Transition:** At `zoom ≥ 19` with a selected building, the map presents the QGIS-generated floor plan, with corridors and animated amber dashed route casing.

---

## 5. Responsive & Accessibility Features

- **Mobile Viewport (< 768px / < 1024px):** Replaces the desktop right panel with a 3-snap bottom sheet:
  - Peek: 120px
  - Half: 50vh
  - Full: 90vh
- **WCAG AA Compliance:** Visible focus rings (`2px` solid Electric Blue with `2px` offset) on all interactive elements.
- **Keyboard Navigation:**
  - `/`: Focuses global search
  - `Esc`: Collapses Detail Panel
  - `Ctrl + G` / `Meta + G`: Toggles live 8px grid audit overlay
- **Reduced Motion:** Fully honors `@media (prefers-reduced-motion: reduce)` by disabling spatial translation while preserving instantaneous state changes.
