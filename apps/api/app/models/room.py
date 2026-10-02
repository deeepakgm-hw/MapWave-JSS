# Room entity model
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id = Column(String, ForeignKey("floors.id"), nullable=False)
    room_number = Column(String, nullable=False)
    name = Column(String, nullable=True)
    room_type = Column(String, default="CLASSROOM")
    occupant_names = Column(JSON, nullable=True)

    floor = relationship("Floor", back_populates="rooms")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
