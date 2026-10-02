# Floor entity model
import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Floor(Base):
    __tablename__ = "floors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id = Column(String, ForeignKey("buildings.id"), nullable=False)
    floor_number = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    svg_floor_plan_url = Column(String, nullable=True)
    geojson_features = Column(JSON, nullable=True)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
