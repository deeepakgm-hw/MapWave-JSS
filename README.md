# Campus Navigator

Campus Navigator is a college indoor/outdoor mapping web app featuring 3D campus overview, per-floor GeoJSON rendering, A* pathfinding navigation, and QR code scan-to-locate checkpoints.

## Prerequisites

- **Node.js**: v20+ or v22+
- **Python**: 3.10+
- **Docker & Docker Compose**: For PostgreSQL with PostGIS database

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JssNav
   ```

2. **Start PostgreSQL with PostGIS**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

3. **Backend Setup (Python / FastAPI)**
   ```bash
   cd apps/api
   python -m venv .venv
   # On Windows: .venv\Scripts\activate
   # On macOS/Linux: source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 3001
   ```
   - API Server: `http://localhost:3001`
   - Interactive Swagger Docs: `http://localhost:3001/docs`

4. **Frontend Setup (React / Vite)**
   ```bash
   # In workspace root or apps/web:
   npm install
   npm run dev
   ```
   - Web Server: `http://localhost:5173`

## Repository Structure

```
apps/
  web/                          # React 19 + JavaScript (JSX) + Vite 6
    src/
      features/
        map-outdoor/
        map-indoor/
        routing/
        qr-checkpoint/
        admin/
      components/
      lib/
        apiClient.js            # thin fetch wrapper, reads API base URL from env
      App.jsx
      main.jsx
    index.html
    vite.config.js
    tailwind.config.js
    package.json

  api/
    app/
      main.py                   # FastAPI app, CORS enabled for localhost:5173
      core/
        config.py               # pydantic Settings (env-driven)
        security.py             # JWT + bcrypt helpers
      db/
        base.py
        session.py
      models/                   # user.py, building.py, floor.py, room.py, nav_node.py, nav_edge.py
      schemas/                  # Pydantic validation schemas
      services/
        pathfinding.py          # NetworkX A* pathfinding solver
      api/
        v1/
          endpoints/
            auth.py
            buildings.py
            nav_graph.py
            occupants.py
          router.py             # aggregates all endpoint routers
    alembic/                    # migrations folder placeholder
    requirements.txt            # pinned dependencies
    pyproject.toml

infra/
  docker-compose.yml            # postgis/postgis:16-3.4, api, web (nginx)
  postgres/
    init.sql                    # CREATE EXTENSION postgis; CREATE EXTENSION "uuid-ossp";

.github/workflows/ci.yml        # ruff (api) and eslint (web) linting on push
.env.example
README.md
```
