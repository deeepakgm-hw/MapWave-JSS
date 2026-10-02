import uuid
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.building import BuildingStatus

# Room Schemas
class RoomBase(BaseModel):
    room_code: str
    name: Optional[str] = None
    room_type: str = "CLASSROOM"
    occupant_name: Optional[str] = None
    department: Optional[str] = None
    geom: Optional[Any] = None

class RoomCreate(RoomBase):
    floor_id: uuid.UUID

class RoomRead(RoomBase):
    id: uuid.UUID
    floor_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Floor Schemas
class FloorBase(BaseModel):
    level_number: int
    notes: Optional[str] = None

class FloorCreate(FloorBase):
    building_id: uuid.UUID

class FloorRead(FloorBase):
    id: uuid.UUID
    building_id: uuid.UUID
    rooms: List[RoomRead] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Building Schemas
class BuildingBase(BaseModel):
    name: str
    status: BuildingStatus = BuildingStatus.existing
    college_id: Optional[uuid.UUID] = None
    footprint: Optional[Any] = None
    height_m: Optional[float] = None

class BuildingCreate(BuildingBase):
    pass

class BuildingRead(BuildingBase):
    id: uuid.UUID
    floors: List[FloorRead] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
