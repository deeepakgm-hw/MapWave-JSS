import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_id = Column(UUID(as_uuid=True), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    room_code = Column(String, nullable=False)
    name = Column(String, nullable=True)
    room_type = Column(String, nullable=False, default="CLASSROOM")
    occupant_name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)

    floor = relationship("Floor", back_populates="rooms")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
