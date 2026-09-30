# TODO: NavNode, NavEdge, and Route schemas
from typing import Optional, List
from pydantic import BaseModel

class Coordinates(BaseModel):
    latitude: float
    longitude: float
    altitude: Optional[float] = None

class NavNodeBase(BaseModel):
    node_type: str
    building_id: Optional[str] = None
    floor_id: Optional[str] = None
    latitude: float
    longitude: float

class NavNodeResponse(NavNodeBase):
    id: str

    class Config:
        from_attributes = True

class RouteRequest(BaseModel):
    start_node_id: Optional[str] = None
    end_node_id: Optional[str] = None
    start_coords: Optional[Coordinates] = None
    end_coords: Optional[Coordinates] = None
    accessible_only: bool = False

class RouteSegment(BaseModel):
    from_node_id: str
    to_node_id: str
    distance_meters: float
    instruction: str

class RouteResponse(BaseModel):
    total_distance_meters: float
    estimated_duration_seconds: int
    segments: List[RouteSegment]
    path_coordinates: List[Coordinates]
