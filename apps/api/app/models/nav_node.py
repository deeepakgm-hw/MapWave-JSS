# NavNode entity model
import uuid
from sqlalchemy import Column, String, Float, DateTime, func
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
