# TODO: NavNode & NavEdge models for graph routing
import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, func
from app.db.base import Base

class NavNode(Base):
    __tablename__ = "nav_nodes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_type = Column(String, nullable=False)  # OUTDOOR_WALKWAY, ENTRANCE, HALLWAY, STAIRS, ELEVATOR, ROOM
    building_id = Column(String, nullable=True)
    floor_id = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NavEdge(Base):
    __tablename__ = "nav_edges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_node_id = Column(String, ForeignKey("nav_nodes.id"), nullable=False)
    to_node_id = Column(String, ForeignKey("nav_nodes.id"), nullable=False)
    weight_meters = Column(Float, nullable=False)
    is_accessible = Column(Boolean, default=True)
    bidirectional = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
