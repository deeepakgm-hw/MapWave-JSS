import uuid
import enum
from sqlalchemy import Column, String, Float, Enum, ForeignKey, DateTime, event, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base

class NodeType(str, enum.Enum):
    door = "door"
    junction = "junction"
    stairs = "stairs"
    lift = "lift"
    outdoor = "outdoor"

class NavNode(Base):
    __tablename__ = "nav_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_id = Column(UUID(as_uuid=True), ForeignKey("floors.id", ondelete="CASCADE"), nullable=True)
    node_type = Column(Enum(NodeType, name="node_type", native_enum=True), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    geom_local = Column(Geometry(geometry_type="POINT", srid=32643), nullable=True)

    floor = relationship("Floor", back_populates="nodes")
    edges_from = relationship("NavEdge", foreign_keys="NavEdge.from_node_id", back_populates="from_node", cascade="all, delete-orphan")
    edges_to = relationship("NavEdge", foreign_keys="NavEdge.to_node_id", back_populates="to_node", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

def sync_local_geom(target):
    """Derives geom_local (UTM 43N meters, SRID 32643) from lat/lon (SRID 4326) via ST_Transform."""
    if target.lat is not None and target.lon is not None:
        target.geom_local = func.ST_Transform(
            func.ST_SetSRID(func.ST_MakePoint(target.lon, target.lat), 4326),
            32643
        )

@event.listens_for(NavNode, "before_insert")
def nav_node_before_insert(mapper, connection, target):
    sync_local_geom(target)

@event.listens_for(NavNode, "before_update")
def nav_node_before_update(mapper, connection, target):
    sync_local_geom(target)
