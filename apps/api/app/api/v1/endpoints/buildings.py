from typing import Optional, Dict, Any
import json
from pathlib import Path
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
        "name": "JSSATE Academic Block C (CS & AI)",
        "status": "existing",
        "height_m": 22.0,
        "latitude": 12.9015,
        "longitude": 77.5057,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5052, 12.9012],
                [77.5062, 12.9012],
                [77.5062, 12.9018],
                [77.5052, 12.9018],
                [77.5052, 12.9012]
            ]]
        }
    },
    {
        "id": "b2000000-0000-0000-0000-000000000002",
        "name": "Administrative Block A & Auditorium",
        "status": "existing",
        "height_m": 18.0,
        "latitude": 12.9022,
        "longitude": 77.5068,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5064, 12.9019],
                [77.5073, 12.9019],
                [77.5073, 12.9025],
                [77.5064, 12.9025],
                [77.5064, 12.9019]
            ]]
        }
    },
    {
        "id": "b3000000-0000-0000-0000-000000000003",
        "name": "Central Library Block B & Tech Hub",
        "status": "existing",
        "height_m": 15.0,
        "latitude": 12.9026,
        "longitude": 77.5048,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5044, 12.9023],
                [77.5052, 12.9023],
                [77.5052, 12.9029],
                [77.5044, 12.9029],
                [77.5044, 12.9023]
            ]]
        }
    },
    {
        "id": "b4000000-0000-0000-0000-000000000004",
        "name": "Proposed JSS Incubation & Tech Complex",
        "status": "proposed",
        "height_m": 25.0,
        "latitude": 12.9010,
        "longitude": 77.5075,
        "footprint": {
            "type": "Polygon",
            "coordinates": [[
                [77.5071, 12.9007],
                [77.5079, 12.9007],
                [77.5079, 12.9013],
                [77.5071, 12.9013],
                [77.5071, 12.9007]
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
        self.latitude = data.get("latitude", 12.9015)
        self.longitude = data.get("longitude", 77.5057)
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
        geojson_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "campus_buildings.geojson"
        if geojson_path.exists():
            try:
                with open(geojson_path, "r", encoding="utf-8") as f:
                    file_data = json.load(f)
                    features = file_data.get("features", [])
            except Exception as e:
                features = []

        if not features:
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
