# Campus Navigator

Campus Navigator is a college indoor/outdoor mapping web application featuring 3D campus overview, per-floor GeoJSON rendering, A* pathfinding over indoor/outdoor navigation graphs, and QR-based scan-to-locate checkpoint flows.

## Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended, tested with Node `v22.20.0` and npm `10.9.3`)
- **Docker & Docker Compose**: Docker Desktop or Docker Engine with Docker Compose v2 for running PostgreSQL with PostGIS

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

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start PostgreSQL with PostGIS**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate -w @campus-nav/api
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```
   - Frontend web application will be accessible at: `http://localhost:5173`
   - Backend API application will be accessible at: `http://localhost:3001`

## Repository Structure

```
apps/
  web/          # React + TypeScript + Vite frontend
  api/          # NestJS backend + Prisma ORM
packages/
  shared-types/ # Shared TypeScript types and contracts
infra/
  docker-compose.yml # PostgreSQL + PostGIS container definition
  postgres/init.sql  # PostGIS database initialisation script
```
