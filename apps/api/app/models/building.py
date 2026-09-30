# TODO: Building, Floor, and Room models with GeoJSON support
import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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
