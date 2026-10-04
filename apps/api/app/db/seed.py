import os
import json
import uuid
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
import shapely.geometry

# Add apps/api to path if needed
CURRENT_DIR = Path(__file__).resolve().parent
API_DIR = CURRENT_DIR.parent.parent
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from app.db.session import SessionLocal
from app.models.building import Building, BuildingStatus

DATA_FILE = API_DIR / "data" / "campus_buildings.geojson"

def seed_buildings(db: Session = None):
    """Seed campus buildings from GeoJSON into database."""
    should_close = False
    if db is None:
        try:
            db = SessionLocal()
            should_close = True
        except Exception as e:
            print(f"Warning: Could not connect to database for seeding: {e}")
            return False

    if not DATA_FILE.exists():
        print(f"GeoJSON data file not found at {DATA_FILE}")
        return False

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    features = geojson_data.get("features", [])
    seeded_count = 0

    try:
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            b_id_str = feat.get("id") or props.get("id") or str(uuid.uuid4())
            b_id = uuid.UUID(b_id_str)

            # Convert polygon geometry to WKT
            shape = shapely.geometry.shape(geom)
            wkt_geom = WKTElement(shape.wkt, srid=4326)

            # Check if building exists
            existing_building = db.query(Building).filter(Building.id == b_id).first()
            if not existing_building:
                existing_building = db.query(Building).filter(Building.name == props.get("name")).first()

            status_val = BuildingStatus.existing if props.get("status") == "existing" else BuildingStatus.proposed

            if existing_building:
                existing_building.name = props.get("name")
                existing_building.status = status_val
                existing_building.height_m = float(props.get("height_m", 15.0))
                existing_building.footprint = wkt_geom
            else:
                new_building = Building(
                    id=b_id,
                    name=props.get("name"),
                    status=status_val,
                    height_m=float(props.get("height_m", 15.0)),
                    footprint=wkt_geom
                )
                db.add(new_building)

            seeded_count += 1

        db.commit()
        print(f"Successfully seeded {seeded_count} buildings into database.")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        return False
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_buildings()
