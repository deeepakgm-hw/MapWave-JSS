from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.building import Building
from app.services.geo import find_nearest_building, building_geometry_to_shapely

router = APIRouter()

# Default fallback campus buildings for initial demonstration when DB is empty
SAMPLE_BUILDINGS = [
    {
        "id": "b1000000-0000-0000-0000-000000000001",
        "name": "Main Academic Block",
        "status": "existing",
        "height_m": 24.0,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5942, 12.9714],
                [77.5950, 12.9714],
                [77.5950, 12.9718],
                [77.5942, 12.9718],
                [77.5942, 12.9714]
            ]]
        }
    },
    {
        "id": "b2000000-0000-0000-0000-000000000002",
        "name": "Science & Innovation Lab",
        "status": "existing",
        "height_m": 18.0,
        "latitude": 12.9722,
        "longitude": 77.5952,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5948, 12.9720],
                [77.5956, 12.9720],
                [77.5956, 12.9724],
                [77.5948, 12.9724],
                [77.5948, 12.9720]
            ]]
        }
    },
    {
        "id": "b3000000-0000-0000-0000-000000000003",
        "name": "Future Student Recreation Complex",
        "status": "proposed",
        "height_m": 15.0,
        "latitude": 12.9710,
        "longitude": 77.5955,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5952, 12.9708],
                [77.5958, 12.9708],
                [77.5958, 12.9712],
                [77.5952, 12.9712],
                [77.5952, 12.9708]
            ]]
        }
    }
]

class MockBuildingObject:
    def __init__(self, data: dict):
        self.id = data["id"]
        self.name = data["name"]
        self.status = data["status"]
        self.height_m = data.get("height_m", 15.0)
        self.latitude = data.get("latitude", 12.9716)
        self.longitude = data.get("longitude", 77.5946)
        self.footprint = data.get("footprint")

@router.get("")
@router.get("/")
def get_buildings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Returns all campus buildings as a GeoJSON FeatureCollection."""
    db_buildings = []
    try:
        db_buildings = db.query(Building).all()
    except Exception:
        db_buildings = []

    features = []
    if db_buildings:
        for b in db_buildings:
            poly = building_geometry_to_shapely(b.footprint)
            geom_dict = poly.__geo_interface__ if poly else None
            features.append({
                "type": "Feature",
                "id": str(b.id),
                "geometry": geom_dict,
                "properties": {
                    "id": str(b.id),
                    "name": b.name,
                    "status": getattr(b.status, "value", str(b.status)),
                    "height_m": b.height_m or 15.0
                }
            })
    else:
        for b in SAMPLE_BUILDINGS:
            features.append({
                "type": "Feature",
                "id": b["id"],
                "geometry": b["footprint"],
                "properties": {
                    "id": b["id"],
                    "name": b["name"],
                    "status": b["status"],
                    "height_m": b["height_m"]
                }
            })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/nearest")
def get_nearest_building(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    accuracy_m: Optional[float] = Query(10.0, description="GPS accuracy radius in meters"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Checks if user location is inside a building or returns nearest building by UTM distance.
    Returns confidence='inside' ONLY if point_in_building succeeded.
    """
    db_buildings = []
    try:
        db_buildings = db.query(Building).all()
    except Exception:
        db_buildings = []

    if not db_buildings:
        db_buildings = [MockBuildingObject(b) for b in SAMPLE_BUILDINGS]

    return find_nearest_building(lat, lon, accuracy_m, db_buildings)
