# TODO: Building, Floor, and Room CRUD endpoints
from typing import List
from fastapi import APIRouter
from app.schemas.building import BuildingResponse, FloorResponse, RoomResponse

router = APIRouter()

@router.get("/", response_model=List[BuildingResponse])
def get_buildings():
    # TODO: Fetch campus buildings list with geographic center coordinates
    return []

@router.get("/{building_id}/floors", response_model=List[FloorResponse])
def get_building_floors(building_id: str):
    # TODO: Fetch floors with indoor GeoJSON geometries for the specified building
    return []

@router.get("/floors/{floor_id}/rooms", response_model=List[RoomResponse])
def get_floor_rooms(floor_id: str):
    # TODO: Fetch rooms and occupancy list for the specified floor
    return []
