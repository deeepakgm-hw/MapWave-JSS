import uuid
from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.nav_node import NodeType
from app.models.nav_edge import EdgeType

# NavNode Schemas
class NavNodeBase(BaseModel):
    floor_id: Optional[uuid.UUID] = None
    node_type: NodeType
    lat: float
    lon: float

class NavNodeCreate(NavNodeBase):
    pass

class NavNodeRead(NavNodeBase):
    id: uuid.UUID
    geom_local: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# NavEdge Schemas
class NavEdgeBase(BaseModel):
    from_node_id: uuid.UUID
    to_node_id: uuid.UUID
    weight: float
    is_accessible: bool = True
    edge_type: EdgeType

class NavEdgeCreate(NavEdgeBase):
    pass

class NavEdgeRead(NavEdgeBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
