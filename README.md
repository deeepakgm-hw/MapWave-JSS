# Campus Navigator

Campus Navigator is a college indoor/outdoor mapping web application featuring:
- **MapLibre 3D campus overview** with GPS blue dot tracking
- **Per-floor GeoJSON indoor rendering** and floor level switcher
- **A* pathfinding** over campus indoor/outdoor navigation graphs powered by NetworkX
- **QR checkpoint scanning** via `html5-qrcode` to anchor indoor positions

## Tech Stack (Zero TypeScript)

- **Frontend**: React (JavaScript JSX) + Vite + Tailwind CSS (`apps/web`)
- **Backend**: Python + FastAPI + SQLAlchemy + GeoAlchemy2 + NetworkX (`apps/api`)
- **Database**: PostgreSQL 16 + PostGIS extension (`infra/docker-compose.yml`)

## Prerequisites

- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: 20+ or 22+ (for running Vite frontend development server)
- **Docker & Docker Compose**: For containerized PostGIS database

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JssNav
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Install frontend dependencies**
   ```bash
   npm install
   ```

4. **Install backend dependencies**
   ```bash
   pip install -r apps/api/requirements.txt
   ```

5. **Start PostgreSQL with PostGIS**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d postgres
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **Interactive API Docs (Swagger)**: http://localhost:3001/docs

## Repository Structure

```
apps/
  web/                         # React (JavaScript JSX) + Vite frontend
    src/
      features/
        map-outdoor/           # MapLibre 3D campus overview, GPS dot
        map-indoor/            # per-floor GeoJSON rendering, floor switcher
        routing/               # A* pathfinding over the nav graph
        qr-checkpoint/         # html5-qrcode scan-to-locate flow
        admin/                 # room/occupant editor
      components/              # shared UI components (buttons, cards, layout)
      lib/                     # api client, constants
      App.jsx
      main.jsx
    index.html
    vite.config.js
    tailwind.config.js
    package.json

  api/                         # Python FastAPI backend
    app/
      api/v1/endpoints/        # auth, buildings, nav_graph, occupants
      core/                    # config & security
      db/                      # SQLAlchemy session & Base
      models/                  # SQLAlchemy / GeoAlchemy2 models
      schemas/                 # Pydantic models (DTOs)
      services/                # NetworkX A* pathfinding engine
      main.py                  # FastAPI application entry point
    requirements.txt

infra/
  docker-compose.yml           # postgres+postgis, api, web
  postgres/init.sql            # postgis extension setup

.github/workflows/ci.yml       # CI automated tests
```
