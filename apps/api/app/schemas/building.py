# TODO: Building, Floor, and Room schemas
from typing import Optional, List, Any
from pydantic import BaseModel

class RoomBase(BaseModel):
    room_number: str
    name: Optional[str] = None
    room_type: Optional[str] = "CLASSROOM"
    occupant_names: Optional[List[str]] = None

class RoomResponse(RoomBase):
    id: str
    floor_id: str

    class Config:
        from_attributes = True

class FloorBase(BaseModel):
    floor_number: int
    name: str
    svg_floor_plan_url: Optional[str] = None
    geojson_features: Optional[Any] = None

class FloorResponse(FloorBase):
    id: str
    building_id: str
    rooms: Optional[List[RoomResponse]] = []

    class Config:
        from_attributes = True

class BuildingBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    latitude: float
    longitude: float

class BuildingResponse(BuildingBase):
    id: str
    floors: Optional[List[FloorResponse]] = []

    class Config:
        from_attributes = True
